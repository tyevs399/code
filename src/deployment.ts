export function createEnvironmentSetupScript(guide: string, environmentName: string): string {
  const payload = encodeBase64(guide)
  return `#!/usr/bin/env bash
set -euo pipefail

printf 'Linux Desktop Forge setup guide for ${environmentName}\\n' >&2
printf 'This script writes no configuration files. It validates and prints a reviewable setup guide.\\n' >&2

if [[ "$#" -ne 0 && "$1" != "--dry-run" ]]; then
    printf 'Usage: %s [--dry-run]\\n' "$0" >&2
    exit 2
fi

target_dir="\${XDG_CONFIG_HOME:-$HOME/.config}"
tmp="$(mktemp "\${TMPDIR:-/tmp}/linux-desktop-guide.XXXXXX")"
trap 'rm -f -- "$tmp"' EXIT
base64 --decode > "$tmp" <<'LINUX_DESKTOP_GUIDE_BASE64'
${payload}
LINUX_DESKTOP_GUIDE_BASE64

printf 'Review the generated guide before changing ${environmentName} settings.\\n'
cat -- "$tmp"
`
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }

  return btoa(binary)
}

export function createDeploymentScript(lua: string): string {
  const configPayload = encodeBase64(lua)

  return `#!/usr/bin/env bash
set -euo pipefail

mode="install"
restore_backup_name=""
if [[ "$#" -eq 1 && "$1" == "--dry-run" ]]; then
    mode="dry-run"
elif [[ "$#" -eq 1 && "$1" == "--restore-latest" ]]; then
    mode="restore"
elif [[ "$#" -eq 2 && "$1" == "--restore-backup" ]]; then
    mode="restore"
    restore_backup_name="$2"
elif [[ "$#" -eq 1 && "$1" == "--list-backups" ]]; then
    mode="list-backups"
elif [[ "$#" -ne 0 ]]; then
    printf 'Usage: %s [--dry-run | --list-backups | --restore-latest | --restore-backup BACKUP_NAME]\\n' "$0" >&2
    exit 2
fi

config_home="\${XDG_CONFIG_HOME:-$HOME/.config}"
target_dir="\${config_home%/}/awesome"
target="$target_dir/rc.lua"
config_tmp=""
deploy_tmp=""
backup_tmp=""
candidate_config=""
restore_source=""
restore_fingerprint=""
target_existed=0
lock_dir=""
lock_acquired=0

cleanup() {
    if [[ -n "$deploy_tmp" ]]; then
        rm -f -- "$deploy_tmp"
    fi
    if [[ -n "$backup_tmp" ]]; then
        rm -f -- "$backup_tmp"
    fi
    if [[ -n "$config_tmp" ]]; then
        rm -f -- "$config_tmp"
    fi
    if [[ "$lock_acquired" -eq 1 ]]; then
        rmdir -- "$lock_dir"
    fi
}
trap cleanup EXIT

if [[ "$mode" == "list-backups" ]]; then
    found_backup=0
    if [[ -d "$target_dir" ]]; then
        for candidate in "$target_dir"/rc.lua.backup.*; do
            [[ -f "$candidate" && ! -L "$candidate" ]] || continue
            printf '%s\\n' "\${candidate##*/}"
            found_backup=1
        done
    fi
    if [[ "$found_backup" -eq 0 ]]; then
        printf 'No valid AwesomeWM backups were found in %s.\\n' "$target_dir"
    fi
    exit 0
fi

if [[ "$mode" == "restore" ]]; then
    if [[ -n "$restore_backup_name" ]]; then
        if [[ "$restore_backup_name" != rc.lua.backup.* ||
              "$restore_backup_name" == */* ||
              "$restore_backup_name" == *".."* ]]; then
            printf 'Error: backup name must be a plain rc.lua.backup filename. No files were changed.\\n' >&2
            exit 2
        fi
        restore_source="$target_dir/$restore_backup_name"
        if [[ ! -f "$restore_source" || -L "$restore_source" ]]; then
            printf 'Error: selected backup is missing or is not a regular file: %s. No files were changed.\\n' "$restore_backup_name" >&2
            exit 1
        fi
    else
        for candidate in "$target_dir"/rc.lua.backup.*; do
            [[ -f "$candidate" && ! -L "$candidate" ]] || continue
            if [[ -z "$restore_source" || "$candidate" > "$restore_source" ]]; then
                restore_source="$candidate"
            fi
        done
    fi
    if [[ -z "$restore_source" ]]; then
        printf 'Error: no AwesomeWM backup was found in %s. No files were changed.\\n' "$target_dir" >&2
        exit 1
    fi
    restore_fingerprint="$(cksum -- "$restore_source")"
    candidate_config="$restore_source"
else
    config_tmp="$(mktemp "\${TMPDIR:-/tmp}/awesome-rc.XXXXXX")"

    base64 --decode > "$config_tmp" <<'AWESOME_CONFIG_BASE64'
${configPayload}
AWESOME_CONFIG_BASE64
    candidate_config="$config_tmp"
fi

if ! command -v awesome >/dev/null 2>&1; then
    printf 'Error: AwesomeWM is not installed or not on PATH. No files were changed.\\n' >&2
    exit 1
fi

if ! awesome -k -c "$candidate_config"; then
    printf 'Error: AwesomeWM rejected the generated configuration. No files were changed.\\n' >&2
    exit 1
fi
if [[ "$mode" == "restore" && "$(cksum -- "$restore_source")" != "$restore_fingerprint" ]]; then
    printf 'Error: selected backup changed during validation. No files were changed.\\n' >&2
    exit 1
fi

if [[ "$mode" == "dry-run" ]]; then
    printf 'Dry run passed. Target: %s\\n' "$target"
    printf 'No configuration files were changed.\\n'
    exit 0
fi

if [[ -e "$target_dir" && ! -d "$target_dir" ]]; then
    printf 'Error: target directory is not a directory: %s\\n' "$target_dir" >&2
    exit 1
fi
if [[ -L "$target" ]]; then
    printf 'Error: target is a symbolic link and will not be replaced: %s\\n' "$target" >&2
    exit 1
fi
if [[ -e "$target" && ! -f "$target" ]]; then
    printf 'Error: target exists and is not a regular file: %s\\n' "$target" >&2
    exit 1
fi

target_fingerprint=""
if [[ -f "$target" ]]; then
    target_existed=1
    target_fingerprint="$(cksum -- "$target")"
fi

if [[ "$mode" == "restore" ]]; then
    printf 'Backup validated. Restore source: %s\\nTarget: %s\\n' "$restore_source" "$target"
    read -r -p 'Restore this backup? [y/N] ' answer
else
    printf 'Configuration validated. Target: %s\\n' "$target"
    read -r -p 'Install this configuration? [y/N] ' answer
fi
case "$answer" in
    [yY]|[yY][eE][sS]) ;;
    *) printf 'Canceled. No files were changed.\\n'; exit 0 ;;
esac

mkdir -p -- "$target_dir"
lock_dir="\${target}.lock"
if ! mkdir -- "$lock_dir" 2>/dev/null; then
    printf 'Error: another deployment may be active or a stale lock exists: %s. No files were changed.\\n' "$lock_dir" >&2
    exit 1
fi
lock_acquired=1

verify_target_unchanged() {
    if [[ -L "$target" ]]; then
        printf 'Error: target became a symbolic link. No files were changed.\\n' >&2
        return 1
    fi
    if [[ "$target_existed" -eq 1 ]]; then
        if [[ ! -f "$target" || "$(cksum -- "$target")" != "$target_fingerprint" ]]; then
            printf 'Error: target changed while awaiting confirmation. No files were changed.\\n' >&2
            return 1
        fi
    elif [[ -e "$target" ]]; then
        printf 'Error: a target appeared while awaiting confirmation. No files were changed.\\n' >&2
        return 1
    fi
    return 0
}

verify_target_unchanged
if [[ "$mode" == "restore" && "$(cksum -- "$restore_source")" != "$restore_fingerprint" ]]; then
    printf 'Error: selected backup changed while awaiting confirmation. No files were changed.\\n' >&2
    exit 1
fi

if [[ -f "$target" ]]; then
    if [[ "$(cksum -- "$target")" != "$target_fingerprint" ]]; then
        printf 'Error: target changed while awaiting confirmation. No files were changed.\\n' >&2
        exit 1
    fi
fi

if [[ -f "$target" ]]; then
    backup_tmp="$(mktemp "\${target}.backup.$(date +%Y%m%d-%H%M%S).XXXXXX")"
    cp -p -- "$target" "$backup_tmp"
    if ! cmp -s -- "$target" "$backup_tmp"; then
        printf 'Error: backup verification failed. No files were changed.\\n' >&2
        exit 1
    fi
    backup="$backup_tmp"
    backup_tmp=""
    printf 'Backup saved to: %s\\n' "$backup"
fi

deploy_tmp="$(mktemp "$target_dir/.rc.lua.XXXXXX")"
if [[ "$mode" == "restore" ]]; then
    cp -p -- "$restore_source" "$deploy_tmp"
    if ! cmp -s -- "$restore_source" "$deploy_tmp" ||
       [[ "$(cksum -- "$restore_source")" != "$restore_fingerprint" ]]; then
        rm -f -- "$deploy_tmp"
        deploy_tmp=""
        printf 'Error: restore verification failed. No files were changed.\\n' >&2
        exit 1
    fi
else
    install -m 0644 -- "$config_tmp" "$deploy_tmp"
fi
verify_target_unchanged
mv -f -- "$deploy_tmp" "$target"
deploy_tmp=""
lock_acquired=0
rmdir -- "$lock_dir"

if [[ "$mode" == "restore" ]]; then
    printf 'Restored configuration at %s\\n' "$target"
else
    printf 'Installed configuration at %s\\n' "$target"
fi
printf 'Restart AwesomeWM manually when you are ready.\\n'
`
}
