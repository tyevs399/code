import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generateLua, type AwesomeConfig } from './model'
import { PREBUILT_PRESETS } from './presets'

const awesomeAvailable = spawnSync('awesome', ['-v'], { stdio: 'ignore' }).status === 0

describe.skipIf(!awesomeAvailable)('AwesomeWM generated config validation', () => {
  it('accepts each curated starter and the full widget catalog', () => {
    const widgetTypes = [
      'taglist',
      'tasklist',
      'layoutbox',
      'textclock',
      'systray',
      'keyboardlayout',
      'cpu',
      'memory',
      'battery',
      'volume',
      'network',
      'date',
      'separator',
    ] as const
    const fullWidgetConfig: AwesomeConfig = {
      ...PREBUILT_PRESETS[0].config,
      widgets: widgetTypes.map((type, index) => ({
        id: `widget-${type}-${index}`,
        type,
        enabled: true,
      })),
    }
    const configs = [
      ...PREBUILT_PRESETS.map((preset) => [preset.name, preset.config] as const),
      ['Full widget catalog', fullWidgetConfig] as const,
    ]
    const tempDir = mkdtempSync(join(tmpdir(), 'awesome-config-validation-'))

    try {
      for (const [name, config] of configs) {
        const path = join(tempDir, `${name.replace(/[^a-z0-9]+/gi, '-')}.lua`)
        writeFileSync(path, generateLua(config))
        expect(() => execFileSync('awesome', ['-k', '-c', path], { stdio: 'pipe' }), name)
          .not.toThrow()
      }
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})
