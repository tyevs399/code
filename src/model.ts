import type { DesktopEnvironment } from './environments'

export type LayoutName = 'tile' | 'floating' | 'fair'
export type BarPosition = 'top' | 'bottom'
export type KeybindingAction =
  | 'launchTerminal'
  | 'closeFocusedWindow'
  | 'cycleLayout'
  | 'toggleFloating'

export interface KeybindingConfig {
  id: string
  key: string
  shift: boolean
  action: KeybindingAction
}

export const KEYBINDING_ACTIONS: Record<KeybindingAction, string> = {
  launchTerminal: 'Launch terminal',
  closeFocusedWindow: 'Close focused window',
  cycleLayout: 'Cycle layout',
  toggleFloating: 'Toggle floating',
}

export const TERMINAL_OPTIONS = [
  { command: 'xterm', label: 'XTerm' },
  { command: 'alacritty', label: 'Alacritty' },
  { command: 'kitty', label: 'Kitty' },
  { command: 'wezterm', label: 'WezTerm' },
  { command: 'gnome-terminal', label: 'GNOME Terminal' },
] as const
export type TerminalName = (typeof TERMINAL_OPTIONS)[number]['command']

export type WallpaperPresetId =
  | ''
  | 'neon-grid'
  | 'deep-space'
  | 'terminal-matrix'
  | 'crystal-circuit'
  | 'amber-crt'
  | 'nordic-orbit'
  | 'synthwave-sunset'
  | 'minimal-bauhaus'
  | 'carbon-fiber'
  | 'blueprint-grid'
  | 'cyber-orbit'
  | 'green-phosphor'
  | 'solar-flare'
  | 'data-stream'
  | 'monochrome-mesh'
  | 'violet-void'
  | 'arctic-terminal'
  | 'rust-console'
  | 'paper-circuit'
  | 'night-garden'
  | 'red-team'
  | 'cosmic-dust'
  | 'pixel-sunrise'
  | 'glass-arcade'

export type WallpaperPreset = {
  id: Exclude<WallpaperPresetId, ''>
  name: string
  description: string
  tags: string[]
  accentColor: string
  backgroundColor: string
  gradient: string
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  { id: 'neon-grid', name: 'Neon Grid', description: 'A precise perspective grid over a midnight terminal.', tags: ['Cyberpunk', 'Dark', 'Technical'], accentColor: '#58f0b5', backgroundColor: '#07120f', gradient: 'linear-gradient(145deg, #07120f 0%, #0b2520 55%, #12362d 100%)' },
  { id: 'deep-space', name: 'Deep Space', description: 'A violet nebula with a subtle orbital starfield.', tags: ['Space', 'Nebula', 'Minimal'], accentColor: '#a78bfa', backgroundColor: '#09091a', gradient: 'radial-gradient(circle at 72% 28%, #6d28d9 0%, transparent 25%), radial-gradient(circle at 28% 72%, #312e81 0%, transparent 35%), linear-gradient(135deg, #09091a, #17112f)' },
  { id: 'terminal-matrix', name: 'Terminal Matrix', description: 'Digital rain over a black-green machine surface.', tags: ['Matrix', 'Terminal', 'Green'], accentColor: '#43d17a', backgroundColor: '#07110b', gradient: 'linear-gradient(135deg, #07110b 0%, #0b2113 100%)' },
  { id: 'crystal-circuit', name: 'Crystal Circuit', description: 'Cyan circuitry refracted through polished glass.', tags: ['Circuit', 'Cyan', 'Holographic'], accentColor: '#67e8f9', backgroundColor: '#07151b', gradient: 'linear-gradient(135deg, #07151b 0%, #0c3340 48%, #113f4a 100%)' },
  { id: 'amber-crt', name: 'Amber CRT', description: 'Warm phosphor glow inspired by early Unix terminals.', tags: ['Retro', 'CRT', 'Amber'], accentColor: '#ffc66d', backgroundColor: '#171007', gradient: 'radial-gradient(circle at 65% 40%, #5c3b13 0%, transparent 38%), linear-gradient(135deg, #171007, #2a1b0b)' },
  { id: 'nordic-orbit', name: 'Nordic Orbit', description: 'Cool glacial depth with a faint satellite arc.', tags: ['Nordic', 'Calm', 'Blue'], accentColor: '#81a1c1', backgroundColor: '#17202a', gradient: 'linear-gradient(145deg, #17202a 0%, #283845 58%, #1f2d36 100%)' },
  { id: 'synthwave-sunset', name: 'Synthwave Sunset', description: 'A magenta horizon inspired by late-night coding sessions.', tags: ['Synthwave', 'Sunset', 'Neon'], accentColor: '#f472b6', backgroundColor: '#1b1028', gradient: 'linear-gradient(160deg, #1b1028 0%, #5b1d58 48%, #e84a5f 100%)' },
  { id: 'minimal-bauhaus', name: 'Minimal Bauhaus', description: 'Geometric shapes and disciplined primary accents.', tags: ['Minimal', 'Geometric', 'Light'], accentColor: '#ef4444', backgroundColor: '#ece7dc', gradient: 'linear-gradient(135deg, #ece7dc 0%, #f6f1e6 100%)' },
  { id: 'carbon-fiber', name: 'Carbon Fiber', description: 'Dark woven geometry with a crisp graphite finish.', tags: ['Carbon', 'Dark', 'Material'], accentColor: '#22d3ee', backgroundColor: '#101214', gradient: 'repeating-linear-gradient(45deg, #111315 0 8px, #171a1d 8px 16px), linear-gradient(135deg, #101214, #20262a)' },
  { id: 'blueprint-grid', name: 'Blueprint Grid', description: 'Technical drafting lines over deep engineering blue.', tags: ['Blueprint', 'Grid', 'Technical'], accentColor: '#38bdf8', backgroundColor: '#102a43', gradient: 'linear-gradient(rgba(56,189,248,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,.12) 1px, transparent 1px), linear-gradient(135deg, #102a43, #164e63)' },
  { id: 'cyber-orbit', name: 'Cyber Orbit', description: 'Electric rings drifting through a dark interface.', tags: ['Cyber', 'Orbit', 'Neon'], accentColor: '#f0abfc', backgroundColor: '#160f2a', gradient: 'radial-gradient(circle at 72% 38%, transparent 0 12%, #c026d355 12.5% 13.5%, transparent 14%), radial-gradient(circle at 72% 38%, #7c3aed 0, transparent 38%), linear-gradient(135deg, #160f2a, #251342)' },
  { id: 'green-phosphor', name: 'Green Phosphor', description: 'A dense phosphor glow inspired by classic Unix consoles.', tags: ['Phosphor', 'Console', 'Green'], accentColor: '#86efac', backgroundColor: '#07140d', gradient: 'radial-gradient(ellipse at 60% 45%, #14532d 0%, transparent 55%), linear-gradient(135deg, #07140d, #0a1f12)' },
  { id: 'solar-flare', name: 'Solar Flare', description: 'A restrained corona of orange fire over a black horizon.', tags: ['Solar', 'Fire', 'Orange'], accentColor: '#fb923c', backgroundColor: '#1a0d08', gradient: 'radial-gradient(circle at 78% 24%, #fdba74 0%, #ea580c 10%, transparent 34%), linear-gradient(145deg, #1a0d08, #35130a)' },
  { id: 'data-stream', name: 'Data Stream', description: 'Parallel signal traces converging on a terminal core.', tags: ['Data', 'Streams', 'Cyan'], accentColor: '#5eead4', backgroundColor: '#081719', gradient: 'repeating-linear-gradient(165deg, transparent 0 16px, #5eead418 17px 18px), linear-gradient(135deg, #081719, #123334)' },
  { id: 'monochrome-mesh', name: 'Monochrome Mesh', description: 'High-contrast silver geometry for distraction-free work.', tags: ['Monochrome', 'Mesh', 'Minimal'], accentColor: '#d1d5db', backgroundColor: '#17191c', gradient: 'linear-gradient(30deg, #17191c 12%, transparent 12.5%, transparent 87%, #17191c 87.5%), linear-gradient(150deg, #17191c 12%, transparent 12.5%, transparent 87%, #17191c 87.5%), linear-gradient(135deg, #292d31, #111315)' },
  { id: 'violet-void', name: 'Violet Void', description: 'Deep ultraviolet gradient with a sharp central bloom.', tags: ['Violet', 'Void', 'Dark'], accentColor: '#c4b5fd', backgroundColor: '#10091c', gradient: 'radial-gradient(circle at 50% 50%, #7c3aed55 0%, transparent 32%), linear-gradient(135deg, #10091c, #24143a)' },
  { id: 'arctic-terminal', name: 'Arctic Terminal', description: 'Glacial blue light with a clean scientific-console feel.', tags: ['Arctic', 'Cold', 'Scientific'], accentColor: '#bae6fd', backgroundColor: '#0b1820', gradient: 'linear-gradient(145deg, #0b1820 0%, #18384a 55%, #94a6b2 125%)' },
  { id: 'rust-console', name: 'Rust Console', description: 'Oxide red and industrial amber for a rugged workstation.', tags: ['Rust', 'Industrial', 'Amber'], accentColor: '#fb7185', backgroundColor: '#211315', gradient: 'linear-gradient(135deg, #211315 0%, #56302c 55%, #8b4d31 100%)' },
  { id: 'paper-circuit', name: 'Paper Circuit', description: 'Warm technical paper crossed by fine copper paths.', tags: ['Paper', 'Circuit', 'Light'], accentColor: '#b45309', backgroundColor: '#efe8d8', gradient: 'linear-gradient(rgba(180,83,9,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(180,83,9,.08) 1px, transparent 1px), linear-gradient(135deg, #efe8d8, #d8cfb9)' },
  { id: 'night-garden', name: 'Night Garden', description: 'Bioluminescent leaves and soft teal shadows.', tags: ['Nature', 'Night', 'Green'], accentColor: '#2dd4bf', backgroundColor: '#0a1a18', gradient: 'radial-gradient(ellipse at 20% 80%, #115e59 0%, transparent 35%), radial-gradient(ellipse at 78% 20%, #164e63 0%, transparent 28%), linear-gradient(135deg, #0a1a18, #102923)' },
  { id: 'red-team', name: 'Red Team', description: 'A stark red signal over an operational black surface.', tags: ['Red', 'Security', 'Dark'], accentColor: '#f87171', backgroundColor: '#18090b', gradient: 'linear-gradient(135deg, #18090b 0%, #380d12 58%, #661b20 100%)' },
  { id: 'cosmic-dust', name: 'Cosmic Dust', description: 'A dusty interstellar field with cool lunar highlights.', tags: ['Space', 'Dust', 'Silver'], accentColor: '#cbd5e1', backgroundColor: '#111827', gradient: 'radial-gradient(circle at 20% 30%, #94a3b8 0 1px, transparent 2px), radial-gradient(circle at 65% 70%, #64748b 0 1px, transparent 2px), radial-gradient(circle at 80% 20%, #475569 0, transparent 28%), linear-gradient(135deg, #111827, #1f2937)' },
  { id: 'pixel-sunrise', name: 'Pixel Sunrise', description: 'A low-resolution dawn built from warm layered bands.', tags: ['Pixel', 'Sunrise', 'Retro'], accentColor: '#fde047', backgroundColor: '#312e81', gradient: 'linear-gradient(180deg, #312e81 0%, #7c3aed 38%, #db2777 68%, #fb923c 100%)' },
  { id: 'glass-arcade', name: 'Glass Arcade', description: 'Translucent neon panels with an iridescent sheen.', tags: ['Arcade', 'Glass', 'Iridescent'], accentColor: '#6ee7f9', backgroundColor: '#15142d', gradient: 'linear-gradient(125deg, #15142d 0%, #312e81 42%, #1e3a8a 58%, #831843 100%)' },
]
export type WidgetType =
  | 'taglist'
  | 'tasklist'
  | 'layoutbox'
  | 'textclock'
  | 'systray'
  | 'keyboardlayout'
  | 'cpu'
  | 'memory'
  | 'battery'
  | 'volume'
  | 'network'
  | 'date'
  | 'separator'

export type WidgetRegion = 'left' | 'center' | 'right'

export interface WidgetConfig {
  id: string
  type: WidgetType
  enabled: boolean
}

export interface AwesomeConfig {
  terminal: TerminalName
  modkey: string
  layout: LayoutName
  gaps: number
  barPosition: BarPosition
  clockFormat: string
  wallpaper: string
  wallpaperPreset: WallpaperPresetId
  accentColor: string
  backgroundColor: string
  widgets: WidgetConfig[]
  keybindings: KeybindingConfig[]
}

export const WIDGET_CATALOG: Record<
  WidgetType,
  { name: string; description: string; region: WidgetRegion; dependency?: string }
> = {
  taglist: {
    name: 'Workspaces',
    description: 'Switch between tags on the current screen.',
    region: 'left',
  },
  tasklist: {
    name: 'Window list',
    description: 'Show windows open on the selected workspace.',
    region: 'center',
  },
  layoutbox: {
    name: 'Layout',
    description: 'Show and cycle the active tiling layout.',
    region: 'right',
  },
  textclock: {
    name: 'Clock',
    description: 'Display the current date and time.',
    region: 'right',
  },
  systray: {
    name: 'System tray',
    description: 'Show icons from background applications.',
    region: 'right',
  },
  keyboardlayout: {
    name: 'Keyboard',
    description: 'Show and switch the current keyboard layout.',
    region: 'right',
  },
  cpu: {
    name: 'CPU',
    description: 'Show processor usage using the system top command.',
    region: 'right',
    dependency: 'top',
  },
  memory: {
    name: 'Memory',
    description: 'Show memory usage using the system free command.',
    region: 'right',
    dependency: 'free',
  },
  battery: {
    name: 'Battery',
    description: 'Show battery capacity by reading Linux power-supply files.',
    region: 'right',
  },
  volume: {
    name: 'Volume',
    description: 'Show the default audio output level on Linux with WirePlumber.',
    region: 'right',
    dependency: 'wpctl (WirePlumber)',
  },
  network: {
    name: 'Network',
    description: 'Show the connected network device on Linux with NetworkManager.',
    region: 'right',
    dependency: 'nmcli (NetworkManager)',
  },
  date: {
    name: 'Date',
    description: 'Display the current date separately from the clock.',
    region: 'right',
  },
  separator: {
    name: 'Separator',
    description: 'Add a subtle divider between status widgets.',
    region: 'right',
  },
}

export const DEFAULT_CONFIG: AwesomeConfig = {
  terminal: 'xterm',
  modkey: 'Mod4',
  layout: 'tile',
  gaps: 8,
  barPosition: 'top',
  clockFormat: '%a %d %b  %H:%M',
  wallpaper: '',
  wallpaperPreset: '',
  accentColor: '#a8d672',
  backgroundColor: '#171b24',
  widgets: [
    { id: 'widget-workspaces', type: 'taglist', enabled: true },
    { id: 'widget-windows', type: 'tasklist', enabled: true },
    { id: 'widget-keyboard', type: 'keyboardlayout', enabled: true },
    { id: 'widget-cpu', type: 'cpu', enabled: true },
    { id: 'widget-memory', type: 'memory', enabled: true },
    { id: 'widget-clock', type: 'textclock', enabled: true },
    { id: 'widget-tray', type: 'systray', enabled: true },
    { id: 'widget-layout', type: 'layoutbox', enabled: true },
  ],
  keybindings: [
    { id: 'key-terminal', key: 'Return', shift: false, action: 'launchTerminal' },
    { id: 'key-close-window', key: 'c', shift: true, action: 'closeFocusedWindow' },
  ],
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isWidgetType = (value: unknown): value is WidgetType =>
  typeof value === 'string' && Object.hasOwn(WIDGET_CATALOG, value)

const isTerminalName = (value: unknown): value is TerminalName =>
  typeof value === 'string' &&
  TERMINAL_OPTIONS.some((terminal) => terminal.command === value)

const isKeybindingAction = (value: unknown): value is KeybindingAction =>
  typeof value === 'string' && Object.hasOwn(KEYBINDING_ACTIONS, value)

const isWallpaperPresetId = (value: unknown): value is WallpaperPresetId =>
  value === '' || (typeof value === 'string' && WALLPAPER_PRESETS.some((preset) => preset.id === value))

export function isAwesomeConfig(value: unknown): value is AwesomeConfig {
  if (!isRecord(value) || !Array.isArray(value.widgets) || !Array.isArray(value.keybindings)) {
    return false
  }

  return (
    isTerminalName(value.terminal) &&
    typeof value.modkey === 'string' &&
    (value.layout === 'tile' || value.layout === 'floating' || value.layout === 'fair') &&
    typeof value.gaps === 'number' &&
    (value.barPosition === 'top' || value.barPosition === 'bottom') &&
    typeof value.clockFormat === 'string' &&
    typeof value.wallpaper === 'string' &&
    (value.wallpaperPreset === undefined || isWallpaperPresetId(value.wallpaperPreset)) &&
    typeof value.accentColor === 'string' &&
    typeof value.backgroundColor === 'string' &&
    value.keybindings.every(
      (keybinding) =>
        isRecord(keybinding) &&
        typeof keybinding.id === 'string' &&
        typeof keybinding.key === 'string' &&
        typeof keybinding.shift === 'boolean' &&
        isKeybindingAction(keybinding.action),
    ) &&
    value.widgets.every(
      (widget) =>
        isRecord(widget) &&
        typeof widget.id === 'string' &&
        isWidgetType(widget.type) &&
        typeof widget.enabled === 'boolean',
    )
  )
}

export function normalizeAwesomeConfig(value: unknown): AwesomeConfig | null {
  if (!isRecord(value)) return null

  const config = {
    ...value,
    wallpaperPreset: value.wallpaperPreset === undefined ? '' : value.wallpaperPreset,
    keybindings:
      value.keybindings === undefined
        ? DEFAULT_CONFIG.keybindings.map((keybinding) => ({ ...keybinding }))
        : value.keybindings,
  }

  if (!isAwesomeConfig(config) || validateConfig(config).length > 0) return null
  return config
}

export function validateConfig(config: AwesomeConfig): string[] {
  const errors: string[] = []

  if (!isTerminalName(config.terminal)) {
    errors.push('Choose a supported terminal emulator.')
  }
  if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(config.modkey)) {
    errors.push('Modifier key must be a single key name, such as Mod4 or Super.')
  }
  if (!Number.isInteger(config.gaps) || config.gaps < 0 || config.gaps > 40) {
    errors.push('Window gaps must be a whole number from 0 to 40.')
  }
  if (!config.clockFormat.trim() || /[\r\n\0]/.test(config.clockFormat)) {
    errors.push('Clock format must be a non-empty single line.')
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(config.accentColor)) {
    errors.push('Accent color must be a six-digit hex color.')
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(config.backgroundColor)) {
    errors.push('Background color must be a six-digit hex color.')
  }
  if (/[\r\n\0]/.test(config.wallpaper)) {
    errors.push('Wallpaper path must be a single line.')
  }
  if (!isWallpaperPresetId(config.wallpaperPreset)) {
    errors.push('Choose a supported wallpaper preset or clear the selection.')
  }

  const ids = new Set<string>()
  if (config.widgets.length > 32) {
    errors.push('A setup can contain at most 32 widgets.')
  }
  for (const widget of config.widgets) {
    if (!widget.id.trim()) errors.push('Widget IDs must not be empty.')
    if (ids.has(widget.id)) errors.push('Widget IDs must be unique.')
    ids.add(widget.id)
  }

  const keybindingIds = new Set<string>()
  const keybindingChords = new Set<string>()
  if (config.keybindings.length > 32) {
    errors.push('A setup can contain at most 32 keybindings.')
  }
  for (const keybinding of config.keybindings) {
    if (!keybinding.id.trim()) errors.push('Keybinding IDs must not be empty.')
    if (keybindingIds.has(keybinding.id)) errors.push('Keybinding IDs must be unique.')
    keybindingIds.add(keybinding.id)

    if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(keybinding.key)) {
      errors.push('Keybindings must use a single key name, such as Return or F1.')
    }

    const chord = `${keybinding.shift ? 'Shift+' : ''}${keybinding.key.toLowerCase()}`
    if (keybindingChords.has(chord)) errors.push('Keybinding combinations must be unique.')
    keybindingChords.add(chord)
  }

  return errors
}

export function luaString(value: string): string {
  let escaped = '"'

  for (const character of value) {
    const code = character.charCodeAt(0)
    if (character === '\\') escaped += '\\\\'
    else if (character === '"') escaped += '\\"'
    else if (character === '\n') escaped += '\\n'
    else if (character === '\r') escaped += '\\r'
    else if (character === '\t') escaped += '\\t'
    else if (code < 32 || code === 127) escaped += `\\${code.toString().padStart(3, '0')}`
    else escaped += character
  }

  return `${escaped}"`
}

const LAYOUT_EXPRESSIONS: Record<LayoutName, string> = {
  tile: 'awful.layout.suit.tile',
  floating: 'awful.layout.suit.floating',
  fair: 'awful.layout.suit.fair',
}

function keybindingExpression(keybinding: KeybindingConfig): string {
  const modifiers = keybinding.shift ? '{ modkey, "Shift" }' : '{ modkey }'
  const action = {
    launchTerminal: 'awful.spawn(terminal)',
    closeFocusedWindow: 'if client.focus then client.focus:kill() end',
    cycleLayout: 'awful.layout.inc(1)',
    toggleFloating: 'if client.focus then awful.client.floating.toggle(client.focus) end',
  }[keybinding.action]

  return `    awful.key(${modifiers}, ${luaString(keybinding.key)}, function() ${action} end,
        { description = ${luaString(KEYBINDING_ACTIONS[keybinding.action])}, group = "custom" })`
}

export function generateDesktopGuide(environment: DesktopEnvironment, config: AwesomeConfig): string {
  const enabled = config.widgets.filter((widget) => widget.enabled).map((widget) => WIDGET_CATALOG[widget.type].name)
  return `# Linux Desktop Forge setup guide

Environment: ${environment.name}
Category: ${environment.category}
Target: ${environment.targetPath}

## Shared choices
- Terminal: ${config.terminal}
- Modifier: ${config.modkey}
- Layout: ${config.layout}
- Window gaps: ${config.gaps}px
- Status bar: ${config.barPosition}
- Clock: ${config.clockFormat}
- Wallpaper: ${config.wallpaper ? config.wallpaper : config.wallpaperPreset ? config.wallpaperPreset : 'None selected'}
- Accent: ${config.accentColor}
- Background: ${config.backgroundColor}
- Widgets: ${enabled.join(', ') || 'None'}

## Apply
This environment does not share AwesomeWM's Lua format. Review and translate the choices above
into ${environment.name}'s native settings. Restart or log out only after creating a backup.

${environment.category === 'Desktop environment'
  ? 'Open the desktop settings application and apply the appearance, panels, wallpaper, keyboard, and layout choices listed above.'
  : `Create or edit ${environment.targetPath}. Package names, key syntax, and service names vary by distribution.`}

## Verification
- Confirm the terminal launches.
- Confirm the selected modifier key and keybindings.
- Confirm gaps and layout behavior.
- Confirm enabled widgets and system integrations are available.
- Back up the native configuration before making changes.
`
}

function widgetExpression(widget: WidgetConfig, clockFormat: string): string {
  const watch = (command: string, interval: number, callback: string) =>
    `awful.widget.watch({ "sh", "-c", ${luaString(command)} }, ${interval}, function(widget, stdout)\n${callback}\n    end)`

  switch (widget.type) {
    case 'taglist':
      return `awful.widget.taglist({ screen = s, filter = awful.widget.taglist.filter.all })`
    case 'tasklist':
      return `awful.widget.tasklist({ screen = s, filter = awful.widget.tasklist.filter.currenttags })`
    case 'layoutbox':
      return 'awful.widget.layoutbox(s)'
    case 'textclock':
      return `wibox.widget.textclock(${luaString(clockFormat)})`
    case 'systray':
      return 'wibox.widget.systray()'
    case 'keyboardlayout':
      return 'awful.widget.keyboardlayout()'
    case 'cpu':
      return `awful.widget.watch({ "sh", "-c", "LC_ALL=C top -bn1 | awk '/^%?Cpu/ { print $2 }'" }, 5, function(widget, stdout)
        widget:set_text("CPU " .. stdout:gsub("%s+", "") .. "%")
    end)`
    case 'memory':
      return `awful.widget.watch({ "sh", "-c", "free -h | awk 'NR == 2 { printf \\"%s/%s\\", $3, $2 }'" }, 10, function(widget, stdout)
        widget:set_text("MEM " .. stdout:gsub("%s+$", ""))
    end)`
    case 'battery':
      return watch(
        'for battery in /sys/class/power_supply/BAT*; do if [ -r "$battery/capacity" ]; then cat "$battery/capacity"; break; fi; done',
        30,
        `        local capacity = tonumber(stdout:gsub("%s+", ""))
        widget:set_text(capacity and ("BAT " .. capacity .. "%%") or "")
        widget.visible = capacity ~= nil`,
      )
    case 'volume':
      return watch(
        "wpctl get-volume @DEFAULT_AUDIO_SINK@ 2>/dev/null | awk '{ printf \"%d\", $2 * 100 }'",
        5,
        `        local volume = stdout:gsub("%s+", "")
        widget:set_text(volume ~= "" and ("VOL " .. volume .. "%%") or "VOL --")`,
      )
    case 'network':
      return watch(
        `nmcli -t -f DEVICE,STATE device status 2>/dev/null | awk -F: '$2 == "connected" { print $1; exit }'`,
        15,
        `        local device = stdout:gsub("%s+", "")
        widget:set_text(device ~= "" and ("NET " .. device) or "NET --")`,
      )
    case 'date':
      return `wibox.widget.textclock(${luaString('%a %d %b')})`
    case 'separator':
      return `wibox.widget.textbox(${luaString('|')})`
  }
}

export function generateLua(config: AwesomeConfig): string {
  const errors = validateConfig(config)
  if (errors.length > 0) throw new Error(errors.join(' '))

  const enabledWidgets = config.widgets.filter((widget) => widget.enabled)
  const regionWidgets = (region: WidgetRegion) =>
    enabledWidgets
      .filter((widget) => WIDGET_CATALOG[widget.type].region === region)
      .map((widget) => `widget_${widget.type}_${config.widgets.indexOf(widget) + 1}`)

  const widgetDefinitions = enabledWidgets
    .map((widget) => {
      const index = config.widgets.indexOf(widget) + 1
      return `    local widget_${widget.type}_${index} = ${widgetExpression(widget, config.clockFormat)}`
    })
    .join('\n')

  const layoutExpressions = [...new Set([LAYOUT_EXPRESSIONS[config.layout], ...Object.values(LAYOUT_EXPRESSIONS)])]
    .map((expression) => `    ${expression}`)
    .join(',\n')

  const wallpaper = config.wallpaper.trim()
    ? `    gears.wallpaper.maximized(${luaString(config.wallpaper.trim())}, s, true)\n`
    : ''

  const keybindings = config.keybindings.map(keybindingExpression).join(',\n')

  return `-- Generated by Linux Desktop Forge.
-- Review this file before replacing your existing AwesomeWM configuration.
local gears = require("gears")
local awful = require("awful")
local wibox = require("wibox")
local beautiful = require("beautiful")
require("awful.autofocus")

terminal = ${luaString(config.terminal.trim())}
modkey = ${luaString(config.modkey)}

beautiful.init(gears.filesystem.get_themes_dir() .. "default/theme.lua")
beautiful.bg_normal = ${luaString(config.backgroundColor)}
beautiful.fg_normal = "#e8eaf0"
beautiful.bg_focus = ${luaString(config.accentColor)}
beautiful.fg_focus = "#171b24"
beautiful.border_width = 2
beautiful.border_focus = ${luaString(config.accentColor)}
beautiful.useless_gap = ${config.gaps}

awful.layout.layouts = {
${layoutExpressions}
}

root.keys(gears.table.join(
${keybindings}
))

awful.screen.connect_for_each_screen(function(s)
    awful.tag({ "1", "2", "3", "4", "5" }, s, awful.layout.layouts[1])
${wallpaper}${widgetDefinitions ? `${widgetDefinitions}\n` : ''}    s.wibar = awful.wibar({ position = ${luaString(config.barPosition)}, screen = s })
    s.wibar:setup({
        layout = wibox.layout.align.horizontal,
        { layout = wibox.layout.fixed.horizontal, ${regionWidgets('left').join(', ')} },
        { layout = wibox.layout.flex.horizontal, ${regionWidgets('center').join(', ')} },
        { layout = wibox.layout.fixed.horizontal, ${regionWidgets('right').join(', ')} }
    })
end)

client.connect_signal("manage", function(c)
    if awesome.startup and not c.size_hints.user_position and not c.size_hints.program_position then
        awful.placement.no_offscreen(c)
    end
end)
`
}
