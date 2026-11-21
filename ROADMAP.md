# AweForge Roadmap

## Direction

AweForge should become a dependable visual workflow for creating, reviewing, backing up, and deploying AwesomeWM configurations. New features should preserve generated Lua readability and remain compatible with the existing JSON profile format.

## Phase 0: Foundation hardening

**Status: implementation started**

### Reliability and safety
- [x] Validate every curated starter and the full widget catalog with a real AwesomeWM installation in CI.
- [x] Add generated-Lua tests for common widget combinations and edge cases.
- [x] Detect target configuration changes during deployment confirmation.
- [x] Verify backups and restored files match their source files.
- [x] Avoid backup filename collisions.
- [x] Continue preserving current configuration behavior on canceled installs and restores.

**Exit criteria:** All generated configurations and deployment modes pass automated checks, and deployment never modifies files after an integrity or conflict failure.

## Phase 1: Editing confidence

### Unsaved and reversible editing
- [x] Track dirty configuration state and warn before navigation or page exit.
- [x] Show an explicit saved or unsaved state in the top bar.
- [ ] Add auto-save or an explicit save draft mode.
- [ ] Improve undo/redo granularity.
- [x] Expose undo/redo keyboard shortcuts.
- [x] Preserve undo/redo history across page navigation.
- [x] Add a clear last-saved indicator.

### Validation and import safety
- [x] Validate keybinding combinations and widget limits in the generated configuration model.
- [x] Check wallpaper paths and clock-format values before export.
- [x] Warn before loading or importing a profile that replaces the current setup.
- [x] Define unsupported profile format and version behavior during import.
- [x] Disambiguate names when importing profiles that collide with saved names.

**Status: implementation complete for local editing workflows**

**Exit criteria:** Users can safely edit, discard, undo, save, and restore configurations without losing or silently replacing work.

## Phase 2: Core feature expansion

### Configuration coverage
- [ ] Add multiple screen and tag settings.
- [ ] Add per-screen bar and widget layouts.
- [ ] Add window rules and common client behavior options.
- [ ] Add padding, border, titlebar, and focus behavior controls.
- [ ] Add optional notification and menu configuration.
- [ ] Support custom Lua snippets through an opt-in review step.

### Widget library
- [x] Add a battery widget for Linux power-supply systems.
- [x] Add volume, network, and date widgets.
- [ ] Add a weather widget after selecting a provider and defining network/privacy behavior.
- [x] Display widget dependencies and supported operating-system requirements.
- [x] Add a searchable community configuration browser.
- [x] Add editorial direction filters and name/popularity sorting to the community browser.
- [ ] Add widget region ordering and drag-and-drop arrangement.
- [ ] Add reusable widget presets.

### Prebuilt configurations
- [ ] Expand preset coverage while keeping source attribution.
- [ ] Add verified licensing and upstream metadata for the Hellfire community starter.
- [ ] Show exact differences between a preset and the generated configuration.
- [x] Add live in-browser preset previews for supported themes and layouts.
- [ ] Record preset compatibility and required dependencies.

**Exit criteria:** The builder covers a broader set of common desktop configurations without becoming an unrestricted Lua editor.

## Phase 3: Profile and deployment workflows

### Profiles
- [x] Add profile rename, duplicate, search, and sort operations.
- [ ] Support profile folders or tags.
- [ ] Add last-used and last-modified metadata.
- [ ] Add optional import confirmation and merge behavior.
- [ ] Provide a machine-readable profile schema.

### Deployment
- [ ] Add staged deployment previews with exact file diffs.
- [ ] Record install history and backup timestamps.
- [ ] Support selecting a backup to restore.
- [ ] Add checksum-based backup manifests.
- [ ] Offer optional AwesomeWM restart and session reload controls.
- [ ] Detect and report missing terminal, widget, or Lua dependencies.

**Exit criteria:** Profiles and deployments can be managed as complete, auditable workflows rather than isolated export actions.

## Phase 4: Browser and accessibility quality

### Browser support
- [ ] Use a secure context and modern clipboard fallback consistently.
- [ ] Use a robust ID strategy for insecure browser contexts.
- [ ] Improve large-file and local-storage error recovery.
- [ ] Add offline support and cache-busting for downloaded scripts.

### Accessibility
- [ ] Run automated keyboard, contrast, and accessibility audits.
- [ ] Add visible focus and error states for every interactive control.
- [ ] Announce errors and asynchronous completion with appropriate live regions.
- [ ] Test desktop and narrow layouts at 200 percent zoom.

### Responsive UX
- [ ] Improve sidebar behavior on small screens.
- [ ] Add compact controls for dense forms.
- [ ] Preserve page state when resizing or switching navigation.

**Exit criteria:** The complete builder is usable with keyboard-only navigation and is stable across supported desktop browsers and screen sizes.

## Phase 5: Testing and maintenance

- [ ] Add React interaction tests for navigation and configuration editing.
- [ ] Test save, undo/redo, profile import/export, and copy/download flows.
- [ ] Add accessibility and visual regression coverage.
- [ ] Test deployment scripts in temporary Linux sandboxes.
- [ ] Add GitHub Actions for test, lint, build, and optional AwesomeWM validation.
- [ ] Document browser support and generated-script expectations.
- [ ] Publish semantic release and profile-format compatibility policies.

**Exit criteria:** Changes are protected by fast unit tests, end-to-end coverage, and repeatable build/deployment validation.

## Ordering

Recommended delivery order:

1. Deployment and generated-Lua safety.
2. Unsaved-state and undo/redo confidence.
3. Profile import/export resilience.
4. React interaction and browser testing.
5. Widget and screen configuration expansion.
6. Advanced deployment history and recovery.
7. Offline, accessibility, and release automation.
