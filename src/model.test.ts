import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CONFIG,
  TERMINAL_OPTIONS,
  generateLua,
  isAwesomeConfig,
  luaString,
  normalizeAwesomeConfig,
  validateConfig,
} from './model'

describe('AwesomeWM config model', () => {
  it('accepts and generates the default setup', () => {
    expect(isAwesomeConfig(DEFAULT_CONFIG)).toBe(true)
    expect(validateConfig(DEFAULT_CONFIG)).toEqual([])

    const lua = generateLua(DEFAULT_CONFIG)
    expect(lua).toContain('terminal = "xterm"')
    expect(lua).toContain('awful.layout.suit.tile')
    expect(lua).toContain('awful.widget.taglist')
    expect(lua).toContain('wibox.widget.textclock("%a %d %b  %H:%M")')
    expect(lua).toContain('position = "top"')
    expect(lua).toContain('awful.key({ modkey }, "Return"')
    expect(lua).toContain('awful.key({ modkey, "Shift" }, "c"')
  })

  it('limits terminal selection to supported launch commands', () => {
    expect(TERMINAL_OPTIONS).toHaveLength(5)
    expect(isAwesomeConfig({ ...DEFAULT_CONFIG, terminal: 'custom-terminal' })).toBe(false)
  })

  it('escapes Lua string delimiters and control characters', () => {
    expect(luaString('a"b\\c\n\t')).toBe('"a\\"b\\\\c\\n\\t"')
    expect(luaString('\u0001')).toBe('"\\001"')
  })

  it('rejects invalid settings and duplicate widget identifiers', () => {
    const invalidConfig = {
      ...DEFAULT_CONFIG,
      modkey: 'Mod4"); os.execute("bad',
      gaps: 41,
      accentColor: 'green',
      widgets: [DEFAULT_CONFIG.widgets[0], DEFAULT_CONFIG.widgets[0]],
    }

    expect(validateConfig(invalidConfig)).toEqual(
      expect.arrayContaining([
        'Modifier key must be a single AwesomeWM key name, such as Mod4.',
        'Window gaps must be a whole number from 0 to 40.',
        'Accent color must be a six-digit hex color.',
        'Widget IDs must be unique.',
      ]),
    )
    expect(() => generateLua(invalidConfig)).toThrow('Modifier key')
  })

  it('rejects widgets without an identifier', () => {
    const config = {
      ...DEFAULT_CONFIG,
      widgets: [{ ...DEFAULT_CONFIG.widgets[0], id: ' ' }],
    }

    expect(validateConfig(config)).toContain('Widget IDs must not be empty.')
    expect(() => generateLua(config)).toThrow('Widget IDs must not be empty.')
  })

  it('limits large widget and keybinding collections', () => {
    const config = {
      ...DEFAULT_CONFIG,
      widgets: Array.from({ length: 33 }, (_, index) => ({
        id: `widget-${index}`,
        type: 'separator' as const,
        enabled: true,
      })),
      keybindings: Array.from({ length: 33 }, (_, index) => ({
        id: `key-${index}`,
        key: `F${index + 1}`,
        shift: false,
        action: 'cycleLayout' as const,
      })),
    }

    expect(validateConfig(config)).toEqual(
      expect.arrayContaining([
        'A setup can contain at most 32 widgets.',
        'A setup can contain at most 32 keybindings.',
      ]),
    )
  })

  it('generates valid definitions for a fully enabled widget set', () => {
    const config = {
      ...DEFAULT_CONFIG,
      widgets: DEFAULT_CONFIG.widgets.map((widget) => ({ ...widget, enabled: true })),
    }
    const lua = generateLua(config)

    expect(lua).toContain('awful.widget.watch')
    expect(lua).toContain('wibox.widget.textclock')
    expect(lua).toContain('awful.widget.layoutbox')
  })

  it('generates a battery widget with Linux power-supply fallback', () => {
    const config = {
      ...DEFAULT_CONFIG,
      widgets: [{ id: 'battery-one', type: 'battery' as const, enabled: true }],
    }

    const lua = generateLua(config)
    expect(lua).toContain('/sys/class/power_supply/BAT')
    expect(lua).toContain('\\"$battery/capacity\\"')
    expect(lua).toContain('BAT " .. capacity')
  })

  it('generates date, volume, and network widgets with escaped shell commands', () => {
    const config = {
      ...DEFAULT_CONFIG,
      widgets: (['date', 'volume', 'network'] as const).map((type) => ({
        id: `widget-${type}`,
        type,
        enabled: true,
      })),
    }

    const lua = generateLua(config)
    expect(lua).toContain('wibox.widget.textclock("%a %d %b")')
    expect(lua).toContain('wpctl get-volume @DEFAULT_AUDIO_SINK@')
    expect(lua).toContain('nmcli -t -f DEVICE,STATE device status')
    expect(lua).toContain('\\\"%d\\\"')
  })

  it('validates, migrates, and generates editable keybindings', () => {
    const legacyConfig = { ...DEFAULT_CONFIG } as Record<string, unknown>
    delete legacyConfig.keybindings

    expect(normalizeAwesomeConfig(legacyConfig)?.keybindings).toEqual(DEFAULT_CONFIG.keybindings)

    const config = {
      ...DEFAULT_CONFIG,
      keybindings: [
        { id: 'key-layout', key: 'F1', shift: true, action: 'cycleLayout' as const },
      ],
    }
    expect(validateConfig(config)).toEqual([])
    expect(generateLua(config)).toContain(
      'awful.key({ modkey, "Shift" }, "F1", function() awful.layout.inc(1) end',
    )
    expect(
      validateConfig({
        ...config,
        keybindings: [...config.keybindings, { ...config.keybindings[0], id: 'duplicate' }],
      }),
    ).toContain('Keybinding combinations must be unique.')
  })

  it('omits disabled widgets and safely quotes wallpaper paths', () => {
    const config = {
      ...DEFAULT_CONFIG,
      wallpaper: '/home/person/wall "paper".jpg',
      widgets: DEFAULT_CONFIG.widgets.map((widget) =>
        widget.type === 'systray' ? { ...widget, enabled: false } : widget,
      ),
    }

    const lua = generateLua(config)
    expect(lua).toContain('gears.wallpaper.maximized("/home/person/wall \\"paper\\".jpg", s, true)')
    expect(lua).not.toContain('wibox.widget.systray()')
  })
})
