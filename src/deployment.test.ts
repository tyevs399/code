import { execFileSync } from 'node:child_process'
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createDeploymentScript } from './deployment'

const generatedConfig = '-- test config\nlocal title = "Café desktop"\n'

function makeSandbox() {
  const root = mkdtempSync(join(tmpdir(), 'awesome-deploy-test-'))
  const fakeBin = join(root, 'bin')
  const configHome = join(root, 'config')
  const targetDir = join(configHome, 'awesome')
  mkdirSync(fakeBin)
  mkdirSync(targetDir, { recursive: true })
  writeFileSync(
    join(fakeBin, 'awesome'),
    '#!/usr/bin/env bash\n[[ "$1" == "-k" && "$2" == "-c" && -s "$3" ]]\n',
  )
  chmodSync(join(fakeBin, 'awesome'), 0o755)
  return { root, fakeBin, configHome, targetDir }
}

describe('deployment script', () => {
  it('is valid Bash and embeds the generated config as UTF-8 data', () => {
    const script = createDeploymentScript(generatedConfig)

    expect(() => execFileSync('bash', ['-n'], { input: script })).not.toThrow()
    const payload = script.match(
      /base64 --decode > "\$config_tmp" <<'AWESOME_CONFIG_BASE64'\n([A-Za-z0-9+/=]+)\nAWESOME_CONFIG_BASE64/,
    )?.[1]
    expect(payload).toBeDefined()
    expect(new TextDecoder().decode(Uint8Array.from(atob(payload!), (char) => char.charCodeAt(0)))).toBe(
      generatedConfig,
    )
    expect(script).toContain('awesome -k -c "$candidate_config"')
    expect(script).toContain('mktemp "${target}.backup.')
    expect(script).toContain('cp -p -- "$target" "$backup_tmp"')
    expect(script).toContain('target changed while awaiting confirmation')
    expect(script).toContain('cmp -s -- "$restore_source" "$deploy_tmp"')
    expect(script).toContain('--dry-run')
    expect(script).toContain('--restore-latest')
    expect(script).toContain('--list-backups')
    expect(script).toContain('--restore-backup BACKUP_NAME')
    expect(script).toContain('target is a symbolic link')
    expect(script).toContain('another deployment may be active')
    expect(script).toContain('Restart AwesomeWM manually')
  })

  it('backs up the current config and installs only after confirmation', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const previousConfig = '-- existing config\n'
    writeFileSync(target, previousConfig)

    try {
      execFileSync('bash', ['-c', createDeploymentScript(generatedConfig)], {
        encoding: 'utf8',
        env: {
          ...process.env,
          HOME: sandbox.root,
          PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
          XDG_CONFIG_HOME: sandbox.configHome,
        },
        input: 'y\n',
      })

      expect(readFileSync(target, 'utf8')).toBe(generatedConfig)
      const backup = readdirSync(sandbox.targetDir).find((name) =>
        name.startsWith('rc.lua.backup.'),
      )
      expect(backup).toBeDefined()
      expect(readFileSync(join(sandbox.targetDir, backup!), 'utf8')).toBe(previousConfig)
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('leaves the existing config untouched when the install is declined', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const previousConfig = '-- keep this config\n'
    writeFileSync(target, previousConfig)

    try {
      execFileSync('bash', ['-c', createDeploymentScript(generatedConfig)], {
        encoding: 'utf8',
        env: {
          ...process.env,
          HOME: sandbox.root,
          PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
          XDG_CONFIG_HOME: sandbox.configHome,
        },
        input: 'n\n',
      })

      expect(readFileSync(target, 'utf8')).toBe(previousConfig)
      expect(readdirSync(sandbox.targetDir)).toEqual(['rc.lua'])
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('validates a dry run without changing the config or creating a backup', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const previousConfig = '-- existing config\n'
    writeFileSync(target, previousConfig)

    try {
      const output = execFileSync(
        'bash',
        ['-c', createDeploymentScript(generatedConfig), 'awesome-deploy', '--dry-run'],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            HOME: sandbox.root,
            PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
            XDG_CONFIG_HOME: sandbox.configHome,
          },
        },
      )

      expect(output).toContain('Dry run passed.')
      expect(readFileSync(target, 'utf8')).toBe(previousConfig)
      expect(readdirSync(sandbox.targetDir)).toEqual(['rc.lua'])
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('restores the latest timestamped backup and backs up the current config first', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const currentConfig = '-- current config\n'
    const earlierBackup = 'local version = "earlier"\n'
    const latestBackup = 'local version = "latest"\n'
    writeFileSync(target, currentConfig)
    writeFileSync(join(sandbox.targetDir, 'rc.lua.backup.20261121-110000.1'), earlierBackup)
    writeFileSync(join(sandbox.targetDir, 'rc.lua.backup.20261121-120000.1'), latestBackup)

    try {
      const output = execFileSync(
        'bash',
        ['-c', createDeploymentScript(generatedConfig), 'awesome-deploy', '--restore-latest'],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            HOME: sandbox.root,
            PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
            XDG_CONFIG_HOME: sandbox.configHome,
          },
          input: 'y\n',
        },
      )

      expect(output).toContain('Restored configuration')
      expect(readFileSync(target, 'utf8')).toBe(latestBackup)
      const backups = readdirSync(sandbox.targetDir).filter((name) =>
        name.startsWith('rc.lua.backup.'),
      )
      expect(backups.map((name) => readFileSync(join(sandbox.targetDir, name), 'utf8'))).toContain(
        currentConfig,
      )
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('lists only regular backups without requiring AwesomeWM or changing files', () => {
    const sandbox = makeSandbox()
    const backupName = 'rc.lua.backup.20261121-110000.1'
    writeFileSync(join(sandbox.targetDir, backupName), '-- valid backup\n')
    writeFileSync(join(sandbox.targetDir, 'linked-backup-target'), '-- linked backup\n')
    symlinkSync('linked-backup-target', join(sandbox.targetDir, 'rc.lua.backup.20261121-120000.1'))

    try {
      const output = execFileSync(
        'bash',
        ['-c', createDeploymentScript(generatedConfig), 'awesome-deploy', '--list-backups'],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            HOME: sandbox.root,
            PATH: '/usr/bin:/bin',
            XDG_CONFIG_HOME: sandbox.configHome,
          },
        },
      )

      expect(output).toContain(backupName)
      expect(output).not.toContain('rc.lua.backup.20261121-120000.1')
      expect(readdirSync(sandbox.targetDir)).toContain('rc.lua.backup.20261121-110000.1')
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('restores a specifically selected backup', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const selectedBackup = 'rc.lua.backup.20261121-110000.1'
    const selectedConfig = '-- selected older config\n'
    writeFileSync(target, '-- current config\n')
    writeFileSync(join(sandbox.targetDir, selectedBackup), selectedConfig)
    writeFileSync(join(sandbox.targetDir, 'rc.lua.backup.20261121-120000.1'), '-- newer config\n')

    try {
      const output = execFileSync(
        'bash',
        ['-c', createDeploymentScript(generatedConfig), 'awesome-deploy', '--restore-backup', selectedBackup],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            HOME: sandbox.root,
            PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
            XDG_CONFIG_HOME: sandbox.configHome,
          },
          input: 'y\n',
        },
      )

      expect(output).toContain('Restored configuration')
      expect(readFileSync(target, 'utf8')).toBe(selectedConfig)
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('refuses symlinked targets and leaves their referents untouched', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const referent = join(sandbox.targetDir, 'real-rc.lua')
    const original = '-- preserve the symlink referent\n'
    writeFileSync(referent, original)
    symlinkSync(referent, target)

    try {
      expect(() => execFileSync('bash', ['-c', createDeploymentScript(generatedConfig)], {
        encoding: 'utf8',
        env: {
          ...process.env,
          HOME: sandbox.root,
          PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
          XDG_CONFIG_HOME: sandbox.configHome,
        },
        input: 'y\n',
      })).toThrow()

      expect(readFileSync(referent, 'utf8')).toBe(original)
      expect(readdirSync(sandbox.targetDir)).toContain('rc.lua')
      expect(readdirSync(sandbox.targetDir)).not.toContain('rc.lua.lock')
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })

  it('refuses to deploy when another process holds the deployment lock', () => {
    const sandbox = makeSandbox()
    const target = join(sandbox.targetDir, 'rc.lua')
    const lockDir = `${target}.lock`
    const original = '-- leave the active config alone\n'
    writeFileSync(target, original)
    mkdirSync(lockDir)

    try {
      expect(() => execFileSync('bash', ['-c', createDeploymentScript(generatedConfig)], {
        encoding: 'utf8',
        env: {
          ...process.env,
          HOME: sandbox.root,
          PATH: `${sandbox.fakeBin}:${process.env.PATH ?? ''}`,
          XDG_CONFIG_HOME: sandbox.configHome,
        },
        input: 'y\n',
      })).toThrow()

      expect(readFileSync(target, 'utf8')).toBe(original)
      expect(readdirSync(sandbox.targetDir)).toContain('rc.lua.lock')
    } finally {
      rmSync(sandbox.root, { recursive: true, force: true })
    }
  })
})
