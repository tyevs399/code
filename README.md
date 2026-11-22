# Linux Desktop Forge

**Design your Linux desktop.**

A visual studio for planning and exporting setups across desktop environments and window managers.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

## Use the builder

- **Desktop** configures the terminal, modifier key, default layout, window gaps, and bar position.
- **Community** browses and searches curated AwesomeWM builds by name, source, and features. Select a card to preview its editable starter. Source files are not copied.
- **Widgets** lets you add, remove, enable, disable, and reorder the supported bar widgets.
- **Keys** edits supported shortcuts for launching a terminal, closing a window, cycling layouts, and toggling floating.
- **Appearance** configures colors, an optional wallpaper path, and the clock format.
- **Profiles** saves, searches, sorts, imports, and exports named setups in this browser as versioned JSON profile files.
- **Lua config** shows the generated file and lets you copy or download `rc.lua`.
- **Deploy** creates a self-contained Bash script with the current configuration embedded.
- **Undo / Redo** keeps the latest 50 configuration edits reversible.
- **Save setup** stores the current setup in this browser's local storage. Valid edits also
  auto-save after a short pause, and the top bar shows the last-saved time.
- **Widget presets** provide minimal, developer, and power/network bar layouts, plus custom
  layouts saved in this browser.
- **Draft recovery** keeps a separate auto-saved recovery copy and offers to restore or discard it
  if it differs from the explicitly saved setup.

The generated deployment script supports three modes:

```sh
bash deploy-awesome-config.sh --dry-run       # validate without changing configuration files
bash deploy-awesome-config.sh                 # confirm, back up, and atomically install
bash deploy-awesome-config.sh --list-backups  # list valid backups without modifying files
bash deploy-awesome-config.sh --restore-latest # validate and confirm restoring the latest backup
bash deploy-awesome-config.sh --restore-backup rc.lua.backup.TIMESTAMP.ID # restore a chosen backup
```

The restore flow also backs up the current `rc.lua` before atomically restoring the selected backup. Installs and restores reject symlinked targets, take an exclusive deployment lock, and recheck the target before replacement. Neither operation restarts AwesomeWM. Review the script before running it.

The terminal selector offers XTerm, Alacritty, Kitty, WezTerm, and GNOME Terminal. The in-browser preview renders the configured palette, bar placement, layout, gaps, terminal, and enabled widgets; it does not run AwesomeWM or third-party widgets. Clock examples use the browser's local time and supported strftime tokens. CPU and memory widgets use the standard Linux `top` and `free` commands. Review generated files and back up your existing configuration before installing.

The widget catalog includes Linux battery, volume, and network integrations. Battery reads `/sys/class/power_supply`; volume requires `wpctl` from WirePlumber; network requires `nmcli` from NetworkManager. CPU and memory widgets use `top` and `free`. Date and clock widgets use AwesomeWM's built-in text clock. These integrations are optional and display placeholder values when their tools or devices are unavailable.

The initial catalog focuses on common AwesomeWM widgets and settings. It does not cover every AwesomeWM API or third-party widget yet.

## Prebuilt source list

The curated list is ordered by GitHub stars from a repository search snapshot on 2026-11-21. Counts and project status may change. The app creates editable starter configurations and links to these projects for their full setup, dependencies, and license details; it does not redistribute their configuration files.

| Source | Stars at snapshot |
| --- | ---: |
| [raexera/yoru](https://github.com/raexera/yoru) | 3,571 |
| [eromatiya/the-glorious-dotfiles](https://github.com/eromatiya/the-glorious-dotfiles) | 2,688 |
| [WillPower3309/awesome-dotfiles](https://github.com/WillPower3309/awesome-dotfiles) | 1,340 |
| [saimoomedits/dotfiles](https://github.com/saimoomedits/dotfiles) | 1,174 |
| [namishh/crystal](https://github.com/namishh/crystal) | 889 |
| [AlphaTechnolog/dotfiles](https://github.com/AlphaTechnolog/dotfiles) | 825 |
| [Stardust-kyun/calla](https://github.com/Stardust-kyun/calla) | 751 |
| [ChocolateBread799/dotfiles](https://github.com/ChocolateBread799/dotfiles) | 749 |
| [material-shell/material-awesome](https://github.com/material-shell/material-awesome) | 678 |
| [raven2cz/awesomewm-config](https://github.com/raven2cz/awesomewm-config) | 439 |

## Community starter

The **Hellfire** entry is generated from the user-provided
`deploy-hellfire-awesomewm.sh` attachment. It is an original starter based on the supported
builder model; it does not redistribute or execute that script. The upstream repository,
license, and maintenance status have not been verified. Unsupported features in the script,
including custom telemetry widgets, developer menus, scratchpads, and application routing,
must be configured manually.

## Checks

```sh
npm test
npm run lint
npm run build
```
