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
    errors.push('Modifier key must be a single AwesomeWM key name, such as Mod4.')
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
      errors.push('Keybindings must use a single AwesomeWM key name, such as Return or F1.')
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

  return `-- Generated by AweForge.
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
