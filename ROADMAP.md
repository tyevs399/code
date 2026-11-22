# Linux Desktop Forge Roadmap

## Product direction

Linux Desktop Forge is a visual planning, preview, export, and deployment studio for Linux desktop environments and window managers. It should produce native, reviewable output or honest setup guidance for the selected environment instead of assuming one configuration format.

The product is organized around three layers:

1. **Shared design choices**: terminal, modifier keys, layout, gaps, wallpaper, palette, clock, widgets, and shortcuts.
2. **Environment adapters**: native settings, file formats, package expectations, and deployment behavior for each supported desktop.
3. **Safety and recovery**: validation, backups, previews, diffing, import/export, undo, and clear unsupported-feature notices.

## Supported environment matrix

| Environment | Category | Current status | Target output |
| --- | --- | --- | --- |
| AwesomeWM | Tiling WM | Native Lua generator and guarded Bash deployment | `~/.config/awesome/rc.lua` |
| i3 | Tiling WM | Catalog and setup-guidance layer | `~/.config/i3/config` |
| Sway | Tiling WM | Catalog and setup-guidance layer | `~/.config/sway/config` |
| Hyprland | Tiling WM | Catalog and setup-guidance layer | `~/.config/hypr/hyprland.conf` |
| bspwm | Tiling WM | Catalog and setup-guidance layer | `~/.config/bspwm/bspwmrc` and sxhkd |
| River | Tiling WM | Catalog and setup-guidance layer | `~/.config/river/init` |
| dwm | Tiling WM | Catalog and setup-guidance layer | `config.h` source patch |
| Niri | Tiling WM | Catalog and setup-guidance layer | `~/.config/niri/config.kdl` |
| XMonad | Tiling WM | Catalog and setup-guidance layer | `~/.xmonad/xmonad.hs` |
| Qtile | Tiling WM | Catalog and setup-guidance layer | `~/.config/qtile/config.py` |
| LeftWM | Tiling WM | Catalog and setup-guidance layer | `~/.config/leftwm/config.ron` |
| herbstluftwm | Tiling WM | Catalog and setup-guidance layer | `~/.config/herbstluftwm/autostart` |
| Wayfire | Stacking/compositing WM | Catalog and setup-guidance layer | `~/.config/wayfire.ini` |
| labwc | Stacking/compositing WM | Catalog and setup-guidance layer | `~/.config/labwc/rc.xml` |
| Openbox | Stacking WM | Catalog and setup-guidance layer | `~/.config/openbox/rc.xml` |
| Fluxbox | Stacking WM | Catalog and setup-guidance layer | `~/.fluxbox/init` |
| IceWM | Stacking WM | Catalog and setup-guidance layer | `~/.icewm/preferences` |
| GNOME | Desktop environment | Catalog and settings-guidance layer | GNOME Settings and dconf |
| KDE Plasma | Desktop environment | Catalog and settings-guidance layer | KDE Settings and native config |
| Xfce | Desktop environment | Catalog and settings-guidance layer | Xfce Settings |
| Cinnamon | Desktop environment | Catalog and settings-guidance layer | Cinnamon Settings and dconf |
| MATE | Desktop environment | Catalog and settings-guidance layer | MATE Control Center and dconf |
| Budgie | Desktop environment | Catalog and settings-guidance layer | Budgie Settings |
| COSMIC | Desktop environment | Catalog and settings-guidance layer | COSMIC Settings and config |
| LXDE | Desktop environment | Catalog and settings-guidance layer | LXDE Settings |
| LXQt | Desktop environment | Catalog and settings-guidance layer | LXQt Settings |
| Pantheon | Desktop environment | Catalog and settings-guidance layer | Pantheon Settings and dconf |
| Deepin | Desktop environment | Catalog and settings-guidance layer | Deepin Control Center |
| Enlightenment | Desktop environment | Catalog and settings-guidance layer | Enlightenment Settings |
| Phosh | Mobile desktop shell | Catalog and settings-guidance layer | GNOME and Phosh settings |

## Phase 0: Cross-environment foundation

**Status: implementation started**

- [x] Rename the product and browser metadata to Linux Desktop Forge.
- [x] Add a desktop environment and window manager catalog.
- [x] Persist the selected environment independently of the shared working configuration.
- [x] Generate environment-specific setup guides for non-AwesomeWM selections.
- [x] Keep native AwesomeWM Lua and guarded deployment as an opt-in, environment-specific path.
- [x] Preserve legacy profile and browser storage compatibility.
- [x] Add environment capability and environment-extra metadata.
- [x] Add recommended widget and feature discovery for each selected environment.
- [x] Add an in-app catalog of 24 geek-oriented local SVG wallpaper presets with palette integration.
- [x] Keep runtime artwork local and remove unused framework template assets.
- [ ] Add an environment field to profiles and profile imports.
- [ ] Add environment capability metadata for supported, partial, experimental, and unsupported features.
- [ ] Add environment-specific validation and export filename rules.
- [ ] Detect selected environment versus default model assumptions during profile loading.

**Exit criteria:** An environment selection is preserved, exported, imported, and represented consistently across every page and profile workflow.

## Phase 1: Editing confidence

### Unsaved and reversible editing
- [x] Track dirty configuration state and warn before navigation or page exit.
- [x] Show explicit saved or unsaved state in the top bar.
- [x] Auto-save valid edits and maintain a separate recovery draft.
- [x] Add undo and redo for configuration changes.
- [x] Expose undo/redo keyboard shortcuts.
- [x] Preserve undo/redo history across page navigation.
- [x] Show the last-saved time.
- [ ] Improve undo granularity for text fields and ranges.
- [ ] Add an explicit draft timeline and restore points.
- [ ] Warn before replacing a working setup with a preset or profile.

### Validation and import safety
- [x] Validate keybinding combinations and widget limits.
- [x] Check wallpaper paths and clock-format values.
- [x] Warn before loading or importing a profile that replaces the current setup.
- [x] Define unsupported profile format and version behavior.
- [x] Disambiguate names during profile import.
- [ ] Store environment and adapter version in the profile schema.
- [ ] Show environment-specific compatibility warnings for old profiles.

**Exit criteria:** Users can safely edit, discard, undo, save, restore, and import work without silently changing environments or losing recovery state.

## Phase 2: Native environment adapters

### AwesomeWM
- [x] Generate readable Lua for the shared model.
- [x] Validate common widgets and keybindings.
- [x] Add guarded install, backup, list, and restore deployment modes.
- [ ] Add staged file diffs and exact backup contents.
- [ ] Add multiple screens, tags, window rules, borders, padding, and titlebars.
- [ ] Add notification and menu configuration.
- [ ] Add optional custom Lua snippets through an explicit review step.
- [ ] Support dependency detection and optional session reload.

### i3 and Sway
- [ ] Generate a native base configuration from shared choices.
- [ ] Generate Sway Wayland-specific terminal, output, wallpaper, and key syntax.
- [ ] Generate i3 X11-specific workspaces, bars, gaps, and IPC settings.
- [ ] Generate matching `sxhkd`-style shortcuts where applicable.
- [ ] Add multiple workspaces and output-selection controls.
- [ ] Detect package availability and display missing-feature warnings.

### Hyprland
- [ ] Generate `hyprland.conf` from modifier, gaps, layout, decoration, monitor, and key choices.
- [ ] Add dynamic tiling, floating, animations, monitor, and plugin sections.
- [ ] Add Wayland-specific terminal and wallpaper integration.
- [ ] Add generated startup entries and environment variables.
- [ ] Validate syntax with a packaged or local Hyprland parser where available.

### bspwm and sxhkd
- [ ] Generate `bspwmrc` workspace, rule, gap, border, and monitor settings.
- [ ] Generate matching `sxhkdrc` keybindings.
- [ ] Add desktop and node rule previews.
- [ ] Include safe startup and cleanup behavior.

### River
- [ ] Generate `~/.config/river/init`.
- [ ] Add Wayland input, layout, tag, output, focus, and scratchpad behavior.
- [ ] Detect available layout generators and commands.
- [ ] Add shell-safe generation and syntax guidance.

### Niri
- [ ] Generate `~/.config/niri/config.kdl`.
- [ ] Add scrollable-column layouts, monitor rules, inputs, workspaces, and keybindings.
- [ ] Add overview, screenshot, and Wayland-native startup settings.
- [ ] Validate KDL syntax and package availability.

### XMonad
- [ ] Generate a reviewable `~/.xmonad/xmonad.hs`.
- [ ] Add layouts, workspaces, gaps, borders, XMobar integration, and keybindings.
- [ ] Add selected Haskell extension metadata and compile guidance.
- [ ] Never overwrite or compile a configuration without explicit confirmation.

### Qtile
- [ ] Generate `~/.config/qtile/config.py`.
- [ ] Add layouts, screens, groups, widgets, hooks, and keybindings.
- [ ] Support X11 and Wayland-specific backend settings.
- [ ] Validate Python syntax and detect required Qtile extensions.

### LeftWM and herbstluftwm
- [ ] Generate LeftWM RON configuration and theme metadata.
- [ ] Generate a herbstluftwm autostart file and matching keybindings.
- [ ] Add tags, rules, gaps, monitor layouts, and status integration.

### Wayfire and labwc
- [ ] Generate Wayfire INI configuration and enabled plugin sections.
- [ ] Generate labwc XML configuration and Openbox-style menu/keybindings.
- [ ] Add outputs, decorations, effects, workspaces, and Wayland startup commands.

### Openbox, Fluxbox, and IceWM
- [ ] Generate native XML or text configuration for each environment.
- [ ] Add menu, keybinding, workspace, border, and startup guidance.
- [ ] Add desktop-integration and panel-selection metadata.

### dwm
- [ ] Generate a reviewable `config.h` patch.
- [ ] Map layouts, tags, borders, gaps, and keybindings.
- [ ] Support patch and source-build profiles.
- [ ] Add separate custom-patch compatibility metadata.
- [ ] Never overwrite a source tree without an explicit guarded workflow.

### GNOME, KDE, Xfce, Cinnamon, MATE, Budgie, COSMIC, LXDE, LXQt, Pantheon, Deepin, Enlightenment, and Phosh
- [ ] Map shared appearance choices to native settings.
- [ ] Generate copyable shell commands for safe dconf or desktop settings changes.
- [ ] Add panels, docks, applets, desktops, gestures, and keyboard customization.
- [ ] Detect desktop-session availability and backup native settings.
- [ ] Provide rollback commands and previews for applied settings.
- [ ] Add environment-specific monitor and scaling controls.

**Exit criteria:** Every supported environment has an explicit capability level and an export that is native, clearly marked, or intentionally documented as guidance-only.

## Phase 3: Widget and desktop coverage

- [x] Add battery, volume, network, date, tray, clock, CPU, memory, keyboard, layout, and separator concepts.
- [x] Add reusable built-in and custom widget presets.
- [x] Add an environment extras panel for workspaces, rules, monitors, panels, gestures, notifications, and session features.
- [ ] Translate wallpaper presets into native environment wallpaper and theme settings.
- [ ] Add widget region ordering and drag-and-drop arrangement.
- [ ] Add panel/dock selection for environments that use separate shells.
- [ ] Add systray availability and desktop-session compatibility checks.
- [ ] Add weather, media, clipboard, notifications, workspace, and launcher widgets.
- [ ] Select weather providers explicitly and define network/privacy behavior.
- [ ] Add monitor-specific bar layouts and widget visibility rules.
- [ ] Add theme, icon, cursor, font, and application-style settings.
- [ ] Add launcher, screenshot, lock, sleep, logout, and session keybindings.
- [ ] Record required executables, services, devices, and packages for every widget.

**Exit criteria:** Shared widgets are translated by each environment adapter or labeled unavailable, with no assumptions about tools or devices.

## Phase 4: Community presets and discovery

- [ ] Expand presets across tiling and desktop environments.
- [ ] Separate AwesomeWM presets from i3, Sway, Hyprland, DE, and source-build starters.
- [ ] Filter community presets by environment, category, dependencies, and compatibility.
- [ ] Verify licenses and upstream metadata before attribution is shown as authoritative.
- [ ] Record preset source revisions and star snapshots.
- [ ] Show exact differences between a preset and the working setup.
- [ ] Record required packages, services, fonts, and third-party tools.
- [ ] Add import, validation, preview, and attribution for user-contributed starters.
- [ ] Preserve source URLs and license information in exported profiles.

**Exit criteria:** Community presets are discoverable, attributable, environment-aware, and reproducible enough to assess dependencies and risk.

## Phase 5: Profiles and deployment workflows

### Profiles
- [x] Add profile rename, duplicate, search, sort, save, import, and export.
- [ ] Add profile folders or tags.
- [ ] Add last-used and last-modified metadata.
- [ ] Add machine-readable environment and adapter schema metadata.
- [ ] Add optional profile merge behavior.
- [ ] Add conflict and compatibility preview before import.
- [ ] Add signed or checksummed profile bundles if remote sharing is introduced.

### Deployment
- [ ] Add staged previews with exact file diffs.
- [ ] Record install history, backup timestamps, and environment identifiers.
- [ ] Support selecting a backup to restore.
- [ ] Add checksum-based backup manifests.
- [ ] Detect missing terminals, widgets, services, packages, and desktop tools.
- [ ] Support rollback at the environment, profile, and file level.
- [ ] Add guarded commands for desktop setting changes and native reload behavior.
- [ ] Require explicit confirmation before package installation or source compilation.

**Exit criteria:** Profiles and deployments are auditable, reversible, environment-specific, and resistant to partial changes.

## Phase 6: Browser, accessibility, and responsive quality

### Browser support
- [ ] Verify secure-context clipboard behavior and fallback behavior consistently.
- [ ] Improve local-storage quota, corruption, and recovery handling.
- [ ] Add offline support with clear cache and downloaded-artifact expectations.
- [ ] Add robust IDs and storage behavior in insecure browser contexts.
- [ ] Preserve environment, page, and draft state across reload and resizing.

### Accessibility
- [ ] Run automated keyboard, contrast, and accessibility audits.
- [ ] Add visible focus and error states to every interactive control.
- [ ] Announce validation, save, import, export, and async completion events.
- [ ] Test desktop and narrow layouts at 200 percent zoom.
- [ ] Provide accessible names for icon-only, drag-and-drop, and removal controls.

### Responsive UX
- [ ] Improve sidebar behavior on small screens.
- [ ] Add compact controls for dense forms.
- [ ] Preserve page state and scroll position during navigation.
- [ ] Keep native preview and code output usable at narrow widths.

**Exit criteria:** The complete builder is usable with keyboard-only navigation and is stable across supported desktop browsers and screen sizes.

## Phase 7: Testing and maintenance

- [ ] Add React interaction tests for environment selection and navigation.
- [ ] Test environment-specific output for every adapter.
- [ ] Test save, recovery, undo/redo, profile import/export, and copy/download flows.
- [ ] Add visual, responsive, and accessibility regression coverage.
- [ ] Test generated deployment scripts in temporary Linux sandboxes.
- [ ] Add optional native parsers or validators for each environment.
- [ ] Add GitHub Actions for tests, lint, build, and native validation.
- [ ] Document supported distribution assumptions and desktop-session requirements.
- [ ] Publish a semantic release and profile-format compatibility policy.
- [ ] Separate community data, environment adapters, and core UI into maintainable modules.

**Exit criteria:** Changes are protected by fast unit tests, end-to-end coverage, native validation where available, and repeatable release builds.

## Delivery order

1. Complete environment profile metadata and capability detection.
2. Add native i3 and Sway configuration generation.
3. Add Hyprland and bspwm/River adapters.
4. Add desktop environment settings and dconf guidance.
5. Expand widget, monitor, panel, and shortcut coverage.
6. Expand community presets and dependency metadata.
7. Add staged deployment, history, rollback, and native-session reload.
8. Improve accessibility, offline behavior, and release automation.
