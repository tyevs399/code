import {
  isAwesomeConfig,
  normalizeAwesomeConfig,
  validateConfig,
  type AwesomeConfig,
} from './model'

export const PROFILE_STORE_VERSION = 1
export const PROFILE_FILE_FORMAT = 'awesome-config-studio-profile'
export const MAX_PROFILE_IMPORT_BYTES = 1_048_576

export interface ConfigProfile {
  id: string
  name: string
  config: AwesomeConfig
}

export interface ProfileStore {
  version: typeof PROFILE_STORE_VERSION
  profiles: ConfigProfile[]
}

export interface ImportedProfile {
  name: string
  config: AwesomeConfig
}

export function uniqueImportedProfileName(
  name: string,
  existingNames: readonly string[],
): string {
  const normalizedName = name.trim().slice(0, 80)
  if (!normalizedName) throw new Error('Imported profile name is empty.')

  const names = new Set(existingNames.map((existingName) => existingName.trim().toLowerCase()))
  if (!names.has(normalizedName.toLowerCase())) return normalizedName

  let suffix = 2
  while (suffix < 10000) {
    const candidateBase = `${normalizedName} (${suffix})`
    const candidate = candidateBase.slice(0, 80)
    if (!names.has(candidate.toLowerCase())) return candidate
    suffix += 1
  }

  throw new Error('Could not create a unique name for the imported profile.')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isProfileStore(value: unknown): value is ProfileStore {
  if (!isRecord(value) || value.version !== PROFILE_STORE_VERSION || !Array.isArray(value.profiles)) {
    return false
  }

  const ids = new Set<string>()
  return value.profiles.every((profile) => {
    if (
      !isRecord(profile) ||
      typeof profile.id !== 'string' ||
      !profile.id.trim() ||
      ids.has(profile.id) ||
      typeof profile.name !== 'string' ||
      !profile.name.trim() ||
      profile.name.length > 80
    ) {
      return false
    }

    if (!isAwesomeConfig(profile.config) || validateConfig(profile.config).length > 0) return false
    ids.add(profile.id)
    return true
  })
}

export function parseProfileImport(text: string): ImportedProfile {
  if (text.length > MAX_PROFILE_IMPORT_BYTES) {
    throw new Error(`Profile file exceeds the ${MAX_PROFILE_IMPORT_BYTES.toLocaleString()} byte limit.`)
  }
  if (new TextEncoder().encode(text).byteLength > MAX_PROFILE_IMPORT_BYTES) {
    throw new Error(`Profile file exceeds the ${MAX_PROFILE_IMPORT_BYTES.toLocaleString()} byte limit.`)
  }

  let value: unknown
  try {
    value = JSON.parse(text)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`Profile file is not valid JSON: ${reason}`)
  }

  if (
    !isRecord(value) ||
    value.format !== PROFILE_FILE_FORMAT ||
    value.version !== PROFILE_STORE_VERSION ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    value.name.length > 80
  ) {
    throw new Error('Profile file format or version is not supported.')
  }

  const config = normalizeAwesomeConfig(value.config)
  if (!config) throw new Error('Profile contains an invalid AwesomeWM configuration.')

  return { name: value.name.trim(), config }
}

export function serializeProfile(name: string, config: AwesomeConfig): string {
  const normalizedName = name.trim()
  if (!normalizedName || normalizedName.length > 80) {
    throw new Error('Profile name must be between 1 and 80 characters.')
  }

  const errors = validateConfig(config)
  if (errors.length > 0) throw new Error(`Cannot export an invalid profile: ${errors[0]}`)

  return `${JSON.stringify(
    {
      format: PROFILE_FILE_FORMAT,
      version: PROFILE_STORE_VERSION,
      name: normalizedName,
      config,
    },
    null,
    2,
  )}\n`
}
