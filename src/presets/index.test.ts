import { describe, expect, it } from 'vitest'
import { generateLua, validateConfig } from '../model'
import { PREBUILT_PRESETS } from './index'

describe('prebuilt AwesomeWM starters', () => {
  it('ships source-attributed presets that generate valid configs', () => {
    expect(PREBUILT_PRESETS).toHaveLength(11)

    for (let index = 0; index < PREBUILT_PRESETS.length; index += 1) {
      const preset = PREBUILT_PRESETS[index]
      expect(preset.category.length).toBeGreaterThan(0)
      if (preset.sourceUrl) {
        expect(preset.sourceUrl).toMatch(/^https:\/\/github\.com\//)
      }
      expect(validateConfig(preset.config)).toEqual([])
      expect(generateLua(preset.config)).toContain(`terminal = "${preset.config.terminal}"`)

      if (index > 0) {
        expect(PREBUILT_PRESETS[index - 1].stars).toBeGreaterThanOrEqual(preset.stars)
      }
    }
  })
})
