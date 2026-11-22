import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from './model'
import {
  PROFILE_FILE_FORMAT,
  MAX_PROFILE_IMPORT_BYTES,
  isProfileStore,
  parseProfileImport,
  serializeProfile,
  uniqueImportedProfileName,
} from './profiles'

describe('portable profiles', () => {
  it('round-trips a named profile with its keybindings', () => {
    const text = serializeProfile('Work setup', DEFAULT_CONFIG)

    expect(JSON.parse(text)).toMatchObject({
      format: PROFILE_FILE_FORMAT,
      version: 1,
      name: 'Work setup',
      config: { keybindings: DEFAULT_CONFIG.keybindings },
    })
    expect(parseProfileImport(text)).toEqual({ name: 'Work setup', config: DEFAULT_CONFIG })
  })

  it('rejects unsupported, malformed, or invalid profile data', () => {
    expect(() => parseProfileImport('{')).toThrow('not valid JSON')
    expect(() => parseProfileImport('{"version":99}')).toThrow('not supported')
    expect(() =>
      parseProfileImport(
        JSON.stringify({
          format: PROFILE_FILE_FORMAT,
          version: 1,
          name: 'Bad setup',
          config: { ...DEFAULT_CONFIG, gaps: 99 },
        }),
      ),
    ).toThrow('invalid Linux desktop configuration')
  })

  it('validates stored profile IDs and names', () => {
    expect(
      isProfileStore({
        version: 1,
        profiles: [{ id: 'one', name: 'One', config: DEFAULT_CONFIG }],
      }),
    ).toBe(true)
    expect(
      isProfileStore({
        version: 1,
        profiles: [
          { id: 'same', name: 'One', config: DEFAULT_CONFIG },
          { id: 'same', name: 'Two', config: DEFAULT_CONFIG },
        ],
      }),
    ).toBe(false)
  })

  it('creates a unique name for an imported profile collision', () => {
    expect(uniqueImportedProfileName('Work setup', ['work setup', 'Work setup (2)']))
      .toBe('Work setup (3)')
  })

  it('rejects unsupported profile versions and malformed names', () => {
    expect(() => uniqueImportedProfileName(' ', ['One'])).toThrow('name is empty')
    expect(() =>
      parseProfileImport(JSON.stringify({
        format: 'unknown',
        version: 1,
        name: 'One',
        config: DEFAULT_CONFIG,
      })),
    ).toThrow('format or version')
  })

  it('rejects oversized profile imports before parsing', () => {
    expect(() => parseProfileImport(' '.repeat(MAX_PROFILE_IMPORT_BYTES + 1)))
      .toThrow('byte limit')
    expect(() => parseProfileImport('é'.repeat(Math.floor(MAX_PROFILE_IMPORT_BYTES / 2) + 1)))
      .toThrow('byte limit')
  })
})
