import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import './App.css'
import {
  DEFAULT_CONFIG,
  KEYBINDING_ACTIONS,
  TERMINAL_OPTIONS,
  WIDGET_CATALOG,
  generateLua,
  generateDesktopGuide,
  normalizeAwesomeConfig,
  validateConfig,
  type AwesomeConfig,
  type KeybindingAction,
  type KeybindingConfig,
  type LayoutName,
  type WidgetConfig,
  type WidgetType,
} from './model'
import { DESKTOP_ENVIRONMENTS, type DesktopEnvironmentId } from './environments'
import { createDeploymentScript, createEnvironmentSetupScript } from './deployment'
import {
  PROFILE_STORE_VERSION,
  MAX_PROFILE_IMPORT_BYTES,
  isProfileStore,
  parseProfileImport,
  serializeProfile,
  uniqueImportedProfileName,
  type ConfigProfile,
} from './profiles'
import { PREBUILT_PRESETS, type PresetCategory } from './presets'

const PRESET_CATEGORIES = [...new Set(PREBUILT_PRESETS.map((preset) => preset.category))].sort()

type Page =
  | 'desktop'
  | 'prebuilt'
  | 'widgets'
  | 'keybindings'
  | 'appearance'
  | 'profiles'
  | 'code'
  | 'deploy'
type Notice = { kind: 'success' | 'error'; message: string } | null

type WidgetPreset = {
  id: string
  name: string
  widgets: WidgetConfig[]
}

const BUILT_IN_WIDGET_PRESETS: WidgetPreset[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    widgets: [
      { id: 'preset-taglist', type: 'taglist', enabled: true },
      { id: 'preset-tasklist', type: 'tasklist', enabled: true },
      { id: 'preset-clock', type: 'textclock', enabled: true },
      { id: 'preset-layout', type: 'layoutbox', enabled: true },
    ],
  },
  {
    id: 'developer',
    name: 'Developer',
    widgets: [
      { id: 'preset-taglist', type: 'taglist', enabled: true },
      { id: 'preset-tasklist', type: 'tasklist', enabled: true },
      { id: 'preset-cpu', type: 'cpu', enabled: true },
      { id: 'preset-memory', type: 'memory', enabled: true },
      { id: 'preset-clock', type: 'textclock', enabled: true },
      { id: 'preset-layout', type: 'layoutbox', enabled: true },
    ],
  },
  {
    id: 'power',
    name: 'Power and network',
    widgets: [
      { id: 'preset-taglist', type: 'taglist', enabled: true },
      { id: 'preset-tasklist', type: 'tasklist', enabled: true },
      { id: 'preset-battery', type: 'battery', enabled: true },
      { id: 'preset-volume', type: 'volume', enabled: true },
      { id: 'preset-network', type: 'network', enabled: true },
      { id: 'preset-clock', type: 'textclock', enabled: true },
    ],
  },
]

const navigation: { id: Page; label: string; icon: string }[] = [
  { id: 'desktop', label: 'Desktop', icon: '01' },
  { id: 'prebuilt', label: 'Community', icon: 'P' },
  { id: 'widgets', label: 'Widgets', icon: '02' },
  { id: 'keybindings', label: 'Keys', icon: '⌘' },
  { id: 'appearance', label: 'Appearance', icon: '03' },
  { id: 'profiles', label: 'Profiles', icon: '↔' },
  { id: 'code', label: 'Configuration', icon: '</>' },
  { id: 'deploy', label: 'Deploy', icon: '04' },
]

const pageCopy: Record<Page, { eyebrow: string; title: string; description: string }> = {
  desktop: {
    eyebrow: 'YOUR WORKSPACE',
    title: 'Desktop setup',
    description: 'Shape the foundation of your Linux desktop setup.',
  },
  prebuilt: {
    eyebrow: 'START WITH A COMMUNITY BUILD',
    title: 'Browse community configs',
    description: 'Discover Linux desktop builds and preview an editable starter inspired by each.',
  },
  widgets: {
    eyebrow: 'YOUR STATUS BAR',
    title: 'Widget library',
    description: 'Choose what lives in your bar, then arrange it your way.',
  },
  keybindings: {
    eyebrow: 'YOUR KEYBOARD',
    title: 'Keybindings',
    description: 'Choose the actions attached to your modifier-key shortcuts.',
  },
  appearance: {
    eyebrow: 'MAKE IT YOURS',
    title: 'Appearance',
    description: 'Set the colors, wallpaper, and bar placement for your desktop.',
  },
  profiles: {
    eyebrow: 'YOUR CONFIGURATIONS',
    title: 'Profiles',
    description: 'Save named setups in this browser or move them between machines.',
  },
  code: {
    eyebrow: 'READY TO TAKE WITH YOU',
    title: 'Your desktop configuration',
    description: 'A readable environment-specific configuration or setup guide, generated from your choices.',
  },
  deploy: {
    eyebrow: 'INSTALL WITH CARE',
    title: 'Deployment script',
    description: 'Preview, install, or restore your AwesomeWM setup safely.',
  },
}

function downloadTextFile(filename: string, text: string) {
  const file = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 0)
}

async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('The browser denied clipboard access.')
}

function loadSavedConfig(): { config: AwesomeConfig; notice: Notice } {
  try {
    const stored = window.localStorage.getItem('awesome-config-studio')
    if (!stored) return { config: DEFAULT_CONFIG, notice: null }

    const parsed: unknown = JSON.parse(stored)
    const config = normalizeAwesomeConfig(parsed)
    if (config) {
      return {
        config,
        notice: { kind: 'success', message: 'Your saved setup is ready.' },
      }
    }

    return {
      config: DEFAULT_CONFIG,
      notice: {
        kind: 'error',
        message: 'The saved setup is not valid. A fresh setup is loaded instead.',
      },
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return {
      config: DEFAULT_CONFIG,
      notice: { kind: 'error', message: `Could not read the saved setup: ${reason}` },
    }
  }
}

function loadSavedProfiles(): { profiles: ConfigProfile[]; notice: Notice } {
  try {
    const stored = window.localStorage.getItem('awesome-config-studio-profiles')
    if (!stored) return { profiles: [], notice: null }

    const parsed: unknown = JSON.parse(stored)
    if (isProfileStore(parsed)) return { profiles: parsed.profiles, notice: null }

    return {
      profiles: [],
      notice: { kind: 'error', message: 'Saved profiles are invalid. Import a valid profile file to continue.' },
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return {
      profiles: [],
      notice: { kind: 'error', message: `Could not read saved profiles: ${reason}` },
    }
  }
}

function loadWidgetPresets(): WidgetPreset[] {
    try {
      const stored = window.localStorage.getItem('awesome-config-studio-widget-presets')
      if (!stored) return []
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []

      return parsed.filter((preset): preset is WidgetPreset =>
        typeof preset === 'object' &&
        preset !== null &&
        typeof (preset as WidgetPreset).id === 'string' &&
        typeof (preset as WidgetPreset).name === 'string' &&
        Array.isArray((preset as WidgetPreset).widgets) &&
        (preset as WidgetPreset).widgets.every((widget) =>
          typeof widget === 'object' &&
          widget !== null &&
          typeof widget.id === 'string' &&
          Object.hasOwn(WIDGET_CATALOG, widget.type) &&
          typeof widget.enabled === 'boolean',
        ),
      )
    } catch {
      return []
    }
}

function loadRecoveryDraft(): { config: AwesomeConfig; savedAt: Date } | null {
    try {
      const stored = window.localStorage.getItem('awesome-config-studio-recovery')
      if (!stored) return null
      const parsed = JSON.parse(stored) as { config?: unknown; savedAt?: unknown }
      if (typeof parsed.savedAt !== 'string') return null
      const config = normalizeAwesomeConfig(parsed.config)
      const savedAt = new Date(parsed.savedAt)
      if (!config || Number.isNaN(savedAt.getTime())) return null
      return { config, savedAt }
    } catch {
      return null
  }
}

function newWidgetId(): string {
  return `widget-${createId()}`
}

function newProfileId(): string {
  return `profile-${createId()}`
}

function createId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function isKeybindingAction(value: string): value is KeybindingAction {
  return Object.hasOwn(KEYBINDING_ACTIONS, value)
}

function iconForWidget(type: WidgetType): string {
  const icons: Record<WidgetType, string> = {
    taglist: '1 2 3',
    tasklist: 'WIN',
    layoutbox: 'LAY',
    textclock: '09',
    systray: 'SYS',
    keyboardlayout: 'KB',
    cpu: 'CPU',
    memory: 'RAM',
    battery: 'BAT',
    volume: 'VOL',
    network: 'NET',
    date: 'DATE',
    separator: '|',
  }
  return icons[type]
}

function previewLabel(type: WidgetType, layout: LayoutName, clockFormat: string): string {
  const now = new Date()
  const labels: Record<WidgetType, string> = {
    taglist: '1   2   3   4   5',
    tasklist: 'Browser   Terminal',
    layoutbox: layout.toUpperCase(),
    textclock: formatClockPreview(clockFormat, now),
    systray: '◉  ◈',
    keyboardlayout: 'US',
    cpu: 'CPU 18%',
    memory: 'MEM 4.2G',
    battery: 'BAT 82%',
    volume: 'VOL 42%',
    network: 'NET wlan0',
    date: formatClockPreview('%a %d %b', now),
    separator: '|',
  }
  return labels[type]
}

function formatClockPreview(format: string, date: Date): string {
  const dateParts = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const parts = Object.fromEntries(dateParts.map((part) => [part.type, part.value]))
  const dayPeriod = new Intl.DateTimeFormat(undefined, { hour: 'numeric', hour12: true })
    .formatToParts(date)
    .find((part) => part.type === 'dayPeriod')?.value ?? ''

  const replacements: Record<string, string> = {
    a: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
    A: new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date),
    b: new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date),
    B: new Intl.DateTimeFormat(undefined, { month: 'long' }).format(date),
    d: parts.day ?? '',
    e: (parts.day ?? '').padStart(2, ' '),
    H: parts.hour ?? '',
    I: String((date.getHours() % 12) || 12).padStart(2, '0'),
    m: String(date.getMonth() + 1).padStart(2, '0'),
    M: parts.minute ?? '',
    p: dayPeriod,
    S: parts.second ?? '',
    w: String(date.getDay()),
    y: String(date.getFullYear()).slice(-2),
    Y: String(date.getFullYear()),
    '%': '%',
  }

  return format.replace(/%([aAbBdeHImMpSwyY%])/g, (_, token: string) => replacements[token] ?? '')
}

function formatSavedAt(savedAt: Date | null): string {
  if (!savedAt || Number.isNaN(savedAt.getTime())) return 'Not saved yet'
  return `Last saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function describeConfigDifferences(current: AwesomeConfig, reference: AwesomeConfig): string[] {
  const differences: string[] = []
  const labels: [keyof AwesomeConfig, string][] = [
    ['terminal', 'Terminal'],
    ['modkey', 'Modifier key'],
    ['layout', 'Default layout'],
    ['gaps', 'Window gaps'],
    ['barPosition', 'Status bar position'],
    ['clockFormat', 'Clock format'],
    ['wallpaper', 'Wallpaper'],
    ['accentColor', 'Accent color'],
    ['backgroundColor', 'Background color'],
  ]
  for (const [key, label] of labels) {
    if (JSON.stringify(current[key]) !== JSON.stringify(reference[key])) differences.push(label)
  }
  if (JSON.stringify(current.widgets) !== JSON.stringify(reference.widgets)) differences.push('Widgets')
  if (JSON.stringify(current.keybindings) !== JSON.stringify(reference.keybindings)) differences.push('Keybindings')
  return differences
}

function App() {
  const [initialState] = useState(loadSavedConfig)
  const [initialProfiles] = useState(loadSavedProfiles)
  const [initialRecovery] = useState(loadRecoveryDraft)
  const [config, setConfig] = useState(initialState.config)
  const [environmentId, setEnvironmentId] = useState<DesktopEnvironmentId>(() => {
    const stored = window.localStorage.getItem('linux-desktop-forge-environment')
    return DESKTOP_ENVIRONMENTS.some((environment) => environment.id === stored)
      ? stored as DesktopEnvironmentId
      : 'awesomewm'
  })
  const environment = DESKTOP_ENVIRONMENTS.find((item) => item.id === environmentId) ?? DESKTOP_ENVIRONMENTS[0]
  const [savedConfigJson, setSavedConfigJson] = useState(() => JSON.stringify(initialState.config))
  const [draftSavedConfigJson, setDraftSavedConfigJson] = useState(() => JSON.stringify(initialState.config))
  const [savedAt, setSavedAt] = useState(() => {
    const stored = window.localStorage.getItem('awesome-config-studio-saved-at')
    if (!stored) return null
    const parsed = new Date(stored)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  })
  const [pastConfigs, setPastConfigs] = useState<AwesomeConfig[]>([])
  const [futureConfigs, setFutureConfigs] = useState<AwesomeConfig[]>([])
  const [widgetPresets, setWidgetPresets] = useState(loadWidgetPresets)
  const [widgetPresetName, setWidgetPresetName] = useState('')
  const [recoveryDraft, setRecoveryDraft] = useState(initialRecovery)
  const [profiles, setProfiles] = useState(initialProfiles.profiles)
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profileSearch, setProfileSearch] = useState('')
  const [profileSort, setProfileSort] = useState<'saved' | 'name'>('saved')
  const [activePage, setActivePage] = useState<Page>('desktop')
  const [selectedPresetId, setSelectedPresetId] = useState(PREBUILT_PRESETS[0].id)
  const [presetSearch, setPresetSearch] = useState('')
  const [presetCategory, setPresetCategory] = useState<PresetCategory | ''>('')
  const [presetSort, setPresetSort] = useState<'popular' | 'name'>('popular')
  const [notice, setNotice] = useState<Notice>(initialState.notice ?? initialProfiles.notice)
  const profileFileInput = useRef<HTMLInputElement>(null)
  const configRef = useRef(config)
  const errors = useMemo(() => validateConfig(config), [config])
  const lua = useMemo(
    () => (errors.length === 0
      ? environmentId === 'awesomewm'
        ? generateLua(config)
        : generateDesktopGuide(environment, config)
      : ''),
    [config, environment, environmentId, errors],
  )
  const deploymentScript = useMemo(
    () => (errors.length === 0
      ? environmentId === 'awesomewm'
        ? createDeploymentScript(lua)
        : createEnvironmentSetupScript(lua, environment.name)
      : ''),
    [environment.name, environmentId, errors, lua],
  )
  const enabledWidgets = config.widgets.filter((widget) => widget.enabled)
  const selectedPreset =
    PREBUILT_PRESETS.find((preset) => preset.id === selectedPresetId) ?? PREBUILT_PRESETS[0]
  const filteredPresets = useMemo(() => {
    const query = presetSearch.trim().toLowerCase()
    const matches = PREBUILT_PRESETS.filter((preset) => {
      if (presetCategory && preset.category !== presetCategory) return false
      if (!query) return true
      return [
        preset.category,
        preset.name,
        preset.sourceName,
        preset.description,
        ...preset.features,
        ...(preset.status ? [preset.status] : []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
    if (presetSort === 'name') return matches.sort((a, b) => a.name.localeCompare(b.name))
    return matches
  }, [presetCategory, presetSearch, presetSort])
  const matchingProfiles = useMemo(() => {
    const query = profileSearch.trim().toLowerCase()
    const matches = profiles.filter((profile) => profile.name.toLowerCase().includes(query))
    if (profileSort === 'name') return matches.sort((a, b) => a.name.localeCompare(b.name))
    return matches
  }, [profileSearch, profileSort, profiles])
  const profileOptions = useMemo(() => {
    const selected = profiles.find((profile) => profile.id === selectedProfileId)
    if (!selected || matchingProfiles.some((profile) => profile.id === selected.id)) return matchingProfiles
    return [selected, ...matchingProfiles]
  }, [matchingProfiles, profiles, selectedProfileId])
  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId)
  const isSelectedProfileDirty = selectedProfile !== undefined &&
    JSON.stringify(selectedProfile.config) !== JSON.stringify(config)
  const copy = pageCopy[activePage]
  const isDirty = JSON.stringify(config) !== savedConfigJson
  const isDraftSaved = JSON.stringify(config) === draftSavedConfigJson
  const profileDifferences = selectedProfile
    ? describeConfigDifferences(config, selectedProfile.config)
    : []

  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!isDirty || errors.length > 0) return

    const timeout = window.setTimeout(() => {
      try {
        const savedAtValue = new Date()
        window.localStorage.setItem(
          'awesome-config-studio-recovery',
          JSON.stringify({ config, savedAt: savedAtValue.toISOString() }),
        )
        window.localStorage.setItem('awesome-config-studio-saved-at', savedAtValue.toISOString())
        setDraftSavedConfigJson(JSON.stringify(config))
        setSavedAt(savedAtValue)
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        setNotice({ kind: 'error', message: `Could not auto-save your setup: ${reason}` })
      }
    }, 750)

    return () => window.clearTimeout(timeout)
  }, [config, errors, isDirty])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (
        event.target instanceof HTMLElement &&
        (event.target.isContentEditable || event.target.closest('input, textarea, select, [contenteditable="true"]'))
      ) return
      if (event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redoConfig()
        else undoConfig()
      } else if (event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redoConfig()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })

  function navigateTo(page: Page) {
    if (page !== activePage && isDirty &&
      !window.confirm('Your edits will stay in the working setup while you navigate, but they are not saved in this browser yet. Continue?')) return
    setActivePage(page)
  }

  function updateConfig<Key extends keyof AwesomeConfig>(
    key: Key,
    value: AwesomeConfig[Key],
  ) {
    commitConfig((current) => ({ ...current, [key]: value }))
  }

  function commitConfig(update: (current: AwesomeConfig) => AwesomeConfig) {
    const current = configRef.current
    const next = update(current)
    if (next === current) return

    setPastConfigs((past) => [...past.slice(-49), current])
    setFutureConfigs([])
    configRef.current = next
    setConfig(next)
    setNotice(null)
  }

  function undoConfig() {
    const previous = pastConfigs[pastConfigs.length - 1]
    if (!previous) return

    setPastConfigs(pastConfigs.slice(0, -1))
    setFutureConfigs([...futureConfigs, configRef.current].slice(-50))
    configRef.current = previous
    setConfig(previous)
    setNotice({ kind: 'success', message: 'Last configuration change undone.' })
  }

  function redoConfig() {
    const next = futureConfigs[futureConfigs.length - 1]
    if (!next) return

    setFutureConfigs(futureConfigs.slice(0, -1))
    setPastConfigs([...pastConfigs, configRef.current].slice(-50))
    configRef.current = next
    setConfig(next)
    setNotice({ kind: 'success', message: 'Configuration change redone.' })
  }

  function persistProfiles(nextProfiles: ConfigProfile[]): boolean {
    if (!isProfileStore({ version: PROFILE_STORE_VERSION, profiles: nextProfiles })) {
      setNotice({ kind: 'error', message: 'Profiles must have unique IDs and valid configurations.' })
      return false
    }

    try {
      window.localStorage.setItem(
        'awesome-config-studio-profiles',
        JSON.stringify({ version: PROFILE_STORE_VERSION, profiles: nextProfiles }),
      )
      setProfiles(nextProfiles)
      return true
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not save profiles: ${reason}` })
      return false
    }
  }

  function saveProfile() {
    const name = profileName.trim()
    if (!name || name.length > 80) {
      setNotice({ kind: 'error', message: 'Profile name must be between 1 and 80 characters.' })
      return
    }
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }

    const existing = profiles.find((profile) => profile.id === selectedProfileId)
    const profile: ConfigProfile = {
      id: existing?.id ?? newProfileId(),
      name,
      config,
    }
    const nextProfiles = existing
      ? profiles.map((item) => item.id === existing.id ? profile : item)
      : [...profiles, profile]

    if (persistProfiles(nextProfiles)) {
      setSelectedProfileId(profile.id)
      setNotice({ kind: 'success', message: `Profile "${name}" saved in this browser.` })
    }
  }

  function selectProfile(id: string) {
    if (isDirty && !window.confirm('Loading this profile will replace your unsaved setup. Continue?')) return
    setSelectedProfileId(id)
    const profile = profiles.find((item) => item.id === id)
    if (!profile) {
      setProfileName('')
      setNotice(null)
      return
    }

    commitConfig(() => profile.config)
    setProfileName(profile.name)
    setNotice({ kind: 'success', message: `Profile "${profile.name}" loaded.` })
  }

  function duplicateProfile() {
    if (!selectedProfileId) return
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }

    const name = `${profileName.trim() || 'Awesome setup'} copy`.slice(0, 80)
    const profile: ConfigProfile = { id: newProfileId(), name, config }
    if (persistProfiles([...profiles, profile])) {
      setSelectedProfileId(profile.id)
      setProfileName(profile.name)
      setNotice({ kind: 'success', message: `Profile "${profile.name}" created.` })
    }
  }

  function deleteProfile() {
    const selected = profiles.find((profile) => profile.id === selectedProfileId)
    if (!selected) return
    if (!window.confirm(`Delete the saved profile "${selected.name}"?`)) return

    if (persistProfiles(profiles.filter((profile) => profile.id !== selected.id))) {
      setSelectedProfileId('')
      setProfileName('')
      setNotice({ kind: 'success', message: `Profile "${selected.name}" deleted.` })
    }
  }

  function exportProfile() {
    try {
      const text = serializeProfile(profileName, config)
      const filename = profileName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      downloadTextFile(`${filename || 'awesome-profile'}.awesomewm.json`, text)
      setNotice({ kind: 'success', message: `Profile "${profileName.trim()}" exported.` })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: reason })
    }
  }

  async function importProfile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (isDirty && !window.confirm('Importing a profile will replace your unsaved setup. Continue?')) {
      event.target.value = ''
      return
    }

    try {
      if (file.size > MAX_PROFILE_IMPORT_BYTES) {
        throw new Error(`Profile file exceeds the ${MAX_PROFILE_IMPORT_BYTES.toLocaleString()} byte limit.`)
      }
      const imported = parseProfileImport(await file.text())
      const uniqueName = uniqueImportedProfileName(
        imported.name,
        profiles.map((profile) => profile.name),
      )
      const profile: ConfigProfile = {
        id: newProfileId(),
        name: uniqueName,
        config: imported.config,
      }
      if (persistProfiles([...profiles, profile])) {
        setSelectedProfileId(profile.id)
        setProfileName(profile.name)
        commitConfig(() => profile.config)
        setNotice({ kind: 'success', message: `Profile "${profile.name}" imported.` })
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not import profile: ${reason}` })
    } finally {
      event.target.value = ''
    }
  }

  function updateKeybinding(id: string, updates: Partial<KeybindingConfig>) {
    updateConfig(
      'keybindings',
      config.keybindings.map((keybinding) =>
        keybinding.id === id ? { ...keybinding, ...updates } : keybinding,
      ),
    )
  }

  function addKeybinding() {
    updateConfig('keybindings', [
      ...config.keybindings,
      { id: `key-${createId()}`, key: 'F2', shift: false, action: 'cycleLayout' },
    ])
  }

  function removeKeybinding(id: string) {
    updateConfig('keybindings', config.keybindings.filter((keybinding) => keybinding.id !== id))
  }

  function applyPrebuiltPreset() {
    if (isDirty && !window.confirm('Loading this preset will replace your unsaved setup. Continue?')) return
    commitConfig(() => ({
      ...selectedPreset.config,
      widgets: selectedPreset.config.widgets.map((widget) => ({
        ...widget,
        id: newWidgetId(),
      })),
    }))
    setNotice({ kind: 'success', message: `${selectedPreset.name} starter loaded. Review it before deployment.` })
    setActivePage('desktop')
  }

  function updateWidget(id: string, updates: Partial<WidgetConfig>) {
    commitConfig((current) => ({
      ...current,
      widgets: current.widgets.map((widget) =>
        widget.id === id ? { ...widget, ...updates } : widget,
      ),
    }))
  }

  function addWidget(type: WidgetType) {
    commitConfig((current) => ({
      ...current,
      widgets: [...current.widgets, { id: newWidgetId(), type, enabled: true }],
    }))
  }

  function removeWidget(id: string) {
    commitConfig((current) => ({
      ...current,
      widgets: current.widgets.filter((widget) => widget.id !== id),
    }))
  }

  function moveWidget(index: number, offset: -1 | 1) {
    commitConfig((current) => {
      const widgets = [...current.widgets]
      const target = index + offset
      if (target < 0 || target >= widgets.length) return current
      ;[widgets[index], widgets[target]] = [widgets[target], widgets[index]]
      return { ...current, widgets }
    })
  }

  function persistWidgetPresets(nextPresets: WidgetPreset[]) {
    try {
      window.localStorage.setItem('awesome-config-studio-widget-presets', JSON.stringify(nextPresets))
      setWidgetPresets(nextPresets)
      return true
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not save widget preset: ${reason}` })
      return false
    }
  }

  function saveWidgetPreset() {
    const name = widgetPresetName.trim()
    if (!name || name.length > 40) {
      setNotice({ kind: 'error', message: 'Widget preset name must be between 1 and 40 characters.' })
      return
    }

    const preset: WidgetPreset = {
      id: `widget-preset-${createId()}`,
      name,
      widgets: config.widgets.map((widget) => ({ ...widget, id: newWidgetId() })),
    }
    if (persistWidgetPresets([...widgetPresets, preset])) {
      setWidgetPresetName('')
      setNotice({ kind: 'success', message: `Widget preset "${name}" saved.` })
    }
  }

  function applyWidgetPreset(preset: WidgetPreset) {
    commitConfig((current) => ({
      ...current,
      widgets: preset.widgets.map((widget) => ({
        ...widget,
        id: newWidgetId(),
      })),
    }))
    setNotice({ kind: 'success', message: `Widget preset "${preset.name}" applied.` })
  }

  function deleteWidgetPreset(id: string) {
    const preset = widgetPresets.find((item) => item.id === id)
    if (!preset) return
    if (!window.confirm(`Delete the widget preset "${preset.name}"?`) ||
      !persistWidgetPresets(widgetPresets.filter((item) => item.id !== id))) return
    setNotice({ kind: 'success', message: `Widget preset "${preset.name}" deleted.` })
  }

  function saveConfig() {
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }

    try {
      const savedAtValue = new Date()
      window.localStorage.setItem('awesome-config-studio', JSON.stringify(config))
      window.localStorage.setItem('awesome-config-studio-saved-at', savedAtValue.toISOString())
      window.localStorage.removeItem('awesome-config-studio-recovery')
      setSavedConfigJson(JSON.stringify(config))
      setDraftSavedConfigJson(JSON.stringify(config))
      setSavedAt(savedAtValue)
      setRecoveryDraft(null)
      setNotice({ kind: 'success', message: 'Setup saved in this browser.' })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not save your setup: ${reason}` })
    }
  }

  function restoreRecoveryDraft() {
    if (!recoveryDraft) return
    commitConfig(() => recoveryDraft.config)
    setRecoveryDraft(null)
    setNotice({ kind: 'success', message: 'Recovered draft restored.' })
  }

  function discardRecoveryDraft() {
    window.localStorage.removeItem('awesome-config-studio-recovery')
    setRecoveryDraft(null)
    setNotice({ kind: 'success', message: 'Recovered draft discarded.' })
  }

  function downloadConfig() {
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }
    const filename = environmentId === 'awesomewm' ? 'rc.lua' : `${environmentId}-setup-guide.md`
    downloadTextFile(filename, lua)
    setNotice({
      kind: 'success',
      message: environmentId === 'awesomewm'
        ? 'Your rc.lua file has been downloaded.'
        : 'Your Linux desktop setup guide has been downloaded.',
    })
  }

  async function copyConfig() {
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }
    try {
      await copyText(lua)
      setNotice({ kind: 'success', message: 'Configuration copied to clipboard.' })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not copy the configuration: ${reason}` })
    }
  }

  async function copyDeploymentScript() {
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }
    try {
      await copyText(deploymentScript)
      setNotice({ kind: 'success', message: 'Deployment script copied to clipboard.' })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not copy the deployment script: ${reason}` })
    }
  }

  async function copyDeploymentCommand(mode: '--dry-run' | '--restore-latest' | '--list-backups') {
    try {
      const filename = environmentId === 'awesomewm'
        ? 'deploy-awesome-config.sh'
        : `deploy-${environmentId}-guide.sh`
      await copyText(`bash ${filename} ${mode}`)
      setNotice({
        kind: 'success',
        message: mode === '--dry-run'
          ? 'Dry-run command copied to clipboard.'
          : mode === '--list-backups'
            ? 'Backup list command copied to clipboard.'
            : 'Restore command copied to clipboard.',
      })
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      setNotice({ kind: 'error', message: `Could not copy the command: ${reason}` })
    }
  }

  function downloadDeploymentScript() {
    if (errors.length > 0) {
      setNotice({ kind: 'error', message: errors[0] })
      return
    }
    downloadTextFile(
      environmentId === 'awesomewm' ? 'deploy-awesome-config.sh' : `deploy-${environmentId}-guide.sh`,
      deploymentScript,
    )
    setNotice({ kind: 'success', message: 'Your deployment script has been downloaded.' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" aria-label="Linux Desktop Forge configuration studio">
          <span className="brand-mark">l.</span>
          <span className="brand-name">
            <strong>Linux Desktop Forge</strong>
            <small>DESKTOP STUDIO</small>
          </span>
        </div>

        <div className="sidebar-label">BUILDER</div>
        <nav className="main-nav" aria-label="Configuration sections">
          {navigation.map((item) => (
            <button
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => navigateTo(item.id)}
              type="button"
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.id === 'code'
                ? environmentId === 'awesomewm' ? 'Lua config' : 'Setup guide'
                : item.label}</span>
              {item.id === 'code' && <span className="nav-arrow">↗</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="status-dot" />
            <span>{environment.name}</span>
            <span className="version-pill">{environment.configFormat}</span>
          </div>
          <p>Made for a desktop<br />that feels like yours.</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">{copy.eyebrow}</div>
            <h1>{copy.title}</h1>
            <p className="page-description">{copy.description}</p>
          </div>
          <div className="top-actions">
            <span
              className={`save-state ${(selectedProfile ? isSelectedProfileDirty : isDirty) ? 'dirty' : 'saved'}`}
              role="status"
              title={formatSavedAt(savedAt)}
            >
              {selectedProfile
                ? isSelectedProfileDirty ? 'Profile not saved' : 'Profile saved'
                : isDraftSaved ? 'Draft saved' : 'Draft not saved'}
            </span>
            <span className="last-saved" role="status">{formatSavedAt(savedAt)}</span>
            <button
              aria-label="Undo configuration change"
              className="button button-quiet history-button"
              disabled={pastConfigs.length === 0}
              onClick={undoConfig}
              title="Undo"
              type="button"
            >
              ↶ Undo
            </button>
            <button
              aria-label="Redo configuration change"
              className="button button-quiet history-button"
              disabled={futureConfigs.length === 0}
              onClick={redoConfig}
              title="Redo"
              type="button"
            >
              ↷ Redo
            </button>
            <button className="button button-quiet" onClick={saveConfig} type="button">
              <span className="button-symbol">↧</span>
              {isDirty ? 'Save setup *' : 'Save setup'}
            </button>
            <button
              className="button button-primary"
              disabled={errors.length > 0}
              onClick={downloadConfig}
              type="button"
            >
              {environmentId === 'awesomewm' ? 'Export rc.lua' : 'Export setup guide'}
              <span className="button-symbol">↓</span>
            </button>
          </div>
        </header>

        {recoveryDraft &&
          JSON.stringify(recoveryDraft.config) !== savedConfigJson && (
            <div className="recovery-banner" role="status">
              <div>
                <strong>Recovered draft available</strong>
                <span>
                  An auto-saved setup from {recoveryDraft.savedAt.toLocaleString()} differs from the explicit save.
                </span>
              </div>
              <button className="button button-primary" onClick={restoreRecoveryDraft} type="button">
                Restore draft
              </button>
              <button className="button button-quiet" onClick={discardRecoveryDraft} type="button">
                Discard
              </button>
            </div>
          )}

        {notice && (
          <div
            className={`notice notice-${notice.kind}`}
            role={notice.kind === 'error' ? 'alert' : 'status'}
          >
            <span>{notice.kind === 'success' ? '✓' : '!'}</span>
            {notice.message}
            <button
              aria-label="Dismiss notification"
              className="notice-dismiss"
              onClick={() => setNotice(null)}
              type="button"
            >
              ×
            </button>
          </div>
        )}

        {activePage === 'desktop' && (
          <div className="desktop-grid">
            <section className="preview-card">
              <div className="card-heading preview-heading">
                <div>
                  <div className="section-kicker">LIVE CONFIG PREVIEW</div>
                  <h2>Your desktop, at a glance</h2>
                </div>
                <span className="screen-badge"><span /> SCREEN 1</span>
              </div>
              <DesktopPreview config={config} />
              <div className="preview-footer">
                <span>RENDERED IN BROWSER</span>
                <span>Updates as you edit <span className="sparkle">✳</span></span>
              </div>
              <div className="preview-stats">
                <div><span className="stat-icon">▦</span><strong>{config.layout}</strong><small>LAYOUT</small></div>
                <div><span className="stat-icon">◫</span><strong>{enabledWidgets.length}</strong><small>WIDGETS</small></div>
                <div><span className="stat-icon">◌</span><strong>{config.gaps}px</strong><small>GAPS</small></div>
              </div>
            </section>

            <section className="settings-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">FOUNDATION</div>
                  <h2>Core settings</h2>
                </div>
                <span className="step-number">01</span>
              </div>
              <button
                className="text-link"
                onClick={() => navigateTo('prebuilt')}
                type="button"
              >
                Start from a community config <span>→</span>
              </button>

              <label className="field-label" htmlFor="desktop-environment">Desktop environment or window manager</label>
              <select
                id="desktop-environment"
                onChange={(event) => {
                  const nextId = event.target.value as DesktopEnvironmentId
                  setEnvironmentId(nextId)
                  window.localStorage.setItem('linux-desktop-forge-environment', nextId)
                }}
                value={environmentId}
              >
                {DESKTOP_ENVIRONMENTS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.category}
                  </option>
                ))}
              </select>
              <p className="field-hint">{environment.description}</p>

              <label className="field-label" htmlFor="terminal">Terminal emulator</label>
              <select
                id="terminal"
                onChange={(event) => {
                  const selected = TERMINAL_OPTIONS.find(
                    (terminal) => terminal.command === event.target.value,
                  )
                  if (selected) updateConfig('terminal', selected.command)
                }}
                value={config.terminal}
              >
                {TERMINAL_OPTIONS.map((terminal) => (
                  <option key={terminal.command} value={terminal.command}>{terminal.label}</option>
                ))}
              </select>
              <p className="field-hint">Launched with your modifier + Enter.</p>

              <label className="field-label" htmlFor="modkey">Modifier key</label>
              <select
                id="modkey"
                onChange={(event) => updateConfig('modkey', event.target.value)}
                value={config.modkey}
              >
                <option value="Mod4">Super (Mod4)</option>
                <option value="Mod1">Alt (Mod1)</option>
                <option value="Control">Control</option>
              </select>

              <div className="field-label field-label-spaced">Default layout</div>
              <div aria-label="Default layout" className="layout-picker" role="group">
                {([
                  ['tile', '▤', 'Tile'],
                  ['floating', '▱', 'Floating'],
                  ['fair', '▦', 'Fair'],
                ] as const).map(([layout, icon, label]) => (
                  <button
                    aria-pressed={config.layout === layout}
                    className={`layout-option ${config.layout === layout ? 'selected' : ''}`}
                    key={layout}
                    onClick={() => updateConfig('layout', layout)}
                    type="button"
                  >
                    <span>{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              <div className="range-heading">
                <label className="field-label" htmlFor="gaps">Window gaps</label>
                <span className="range-value">{config.gaps}<small>px</small></span>
              </div>
              <input
                className="range-input"
                id="gaps"
                max="40"
                min="0"
                onChange={(event) => updateConfig('gaps', Number(event.target.value))}
                type="range"
                value={config.gaps}
              />
              <div className="range-labels"><span>Flush</span><span>Roomy</span></div>

              <div className="divider" />
              <div className="bar-settings-row">
                <div>
                  <div className="field-label">Status bar</div>
                  <p className="field-hint">Choose its screen edge.</p>
                </div>
                <div className="segmented-control">
                  {(['top', 'bottom'] as const).map((position) => (
                    <button
                      aria-pressed={config.barPosition === position}
                      className={config.barPosition === position ? 'selected' : ''}
                      key={position}
                      onClick={() => updateConfig('barPosition', position)}
                      type="button"
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="text-link"
                onClick={() => navigateTo('widgets')}
                type="button"
              >
                Customize your widgets <span>→</span>
              </button>
            </section>
          </div>
        )}

        {activePage === 'prebuilt' && (
          <div className="prebuilt-page">
            <section aria-labelledby="community-configs-heading" className="settings-card community-browser">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">DISCOVER AWESOMEWM BUILDS</div>
                  <h2 id="community-configs-heading">Community configs</h2>
                </div>
                <span className="step-number">{filteredPresets.length.toString().padStart(2, '0')}</span>
              </div>
              <label className="field-label" htmlFor="community-search">Search by name, source, or feature</label>
              <input
                autoComplete="off"
                id="community-search"
                onChange={(event) => setPresetSearch(event.target.value)}
                placeholder="Try “developer”, “minimal”, or a repository name"
                type="search"
                value={presetSearch}
              />
              <div className="community-filter-row">
                <div>
                  <label className="field-label" htmlFor="community-category">Starter direction</label>
                  <select
                    id="community-category"
                    onChange={(event) => {
                      const category = PRESET_CATEGORIES.find((item) => item === event.target.value) ?? ''
                      setPresetCategory(category)
                    }}
                    value={presetCategory}
                  >
                    <option value="">All directions</option>
                    {PRESET_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="community-sort">Sort by</label>
                  <select
                    id="community-sort"
                    onChange={(event) => setPresetSort(event.target.value === 'name' ? 'name' : 'popular')}
                    value={presetSort}
                  >
                    <option value="popular">Curated popularity</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
              {filteredPresets.length > 0 ? (
                <div aria-label="Community configuration results" className="community-config-grid" role="group">
                  {filteredPresets.map((preset) => (
                    <button
                      aria-pressed={selectedPreset.id === preset.id}
                      className={`community-config-card ${selectedPreset.id === preset.id ? 'selected' : ''}`}
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      type="button"
                    >
                      <span className="community-config-heading">
                        <strong>{preset.name}</strong>
                        {preset.stars > 0
                          ? <small>★ {preset.stars.toLocaleString()}</small>
                          : <small>Community</small>}
                      </span>
                      <span className="community-config-source">{preset.sourceName}</span>
                      <span className="community-config-category">{preset.category}</span>
                      <span className="community-config-description">{preset.description}</span>
                      <span className="community-config-footer">
                        {preset.status ?? (preset.sourceUrl ? 'GitHub source' : 'Community starter')}
                        <span>{selectedPreset.id === preset.id ? 'Selected' : 'Preview →'}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="community-empty-state">
                  <p>No community configs match the selected filters.</p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setPresetSearch('')
                      setPresetCategory('')
                    }}
                    type="button"
                  >
                    Clear filters <span>×</span>
                  </button>
                </div>
              )}
              <p className="community-browser-note">
                {filteredPresets.length} of {PREBUILT_PRESETS.length} curated entries. Categories are editorial;
                star counts are snapshot data. Starters are editable translations, not copies of source files.
              </p>
            </section>

            <section className="settings-card preset-preview-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">RENDERED CONFIG PREVIEW</div>
                  <h2>See the desktop arrangement</h2>
                </div>
                <span className="screen-badge"><span /> SCREEN 1</span>
              </div>
              <DesktopPreview config={selectedPreset.config} />
              <div className="preset-preview-stats">
                <div><small>LAYOUT</small><strong>{selectedPreset.config.layout}</strong></div>
                <div><small>TERMINAL</small><strong>{selectedPreset.config.terminal}</strong></div>
                <div><small>WIDGETS</small><strong>{selectedPreset.config.widgets.length}</strong></div>
                <div><small>PALETTE</small><span><i style={{ backgroundColor: selectedPreset.config.backgroundColor }} /><i style={{ backgroundColor: selectedPreset.config.accentColor }} /></span></div>
              </div>
              <p className="preset-ranking-note">
                Popularity is based on GitHub stars from a repository search snapshot. Community scripts are not ranked.
              </p>
              <p className="preset-ranking-note">
                This is a live browser rendering of supported settings, not a running AwesomeWM session. It cannot load local wallpaper files or source-project widgets.
              </p>
            </section>

            <section className="settings-card preset-details-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">CURATED AWESOMEWM BUILDS</div>
                  <h2>Review starter details</h2>
                </div>
                <span className="step-number">{PREBUILT_PRESETS.length.toString().padStart(2, '0')}</span>
              </div>
              <label className="field-label" htmlFor="prebuilt-select">Selected community config</label>
              <select
                id="prebuilt-select"
                onChange={(event) => setSelectedPresetId(event.target.value)}
                value={selectedPreset.id}
              >
                {PREBUILT_PRESETS.map((preset, index) => (
                  <option key={preset.id} value={preset.id}>
                    {index + 1}. {preset.name}{preset.stars > 0 ? ` · ${preset.stars.toLocaleString()} stars` : ' · Community'}
                  </option>
                ))}
              </select>

              <div className="preset-title-row">
                <div>
                  <div className="preset-rank">CURATED RANK #{PREBUILT_PRESETS.indexOf(selectedPreset) + 1}</div>
                  <h3>{selectedPreset.name}</h3>
                </div>
                {selectedPreset.stars > 0 && (
                  <span className="preset-stars">★ {selectedPreset.stars.toLocaleString()}</span>
                )}
              </div>
              <div className="preset-source-row">
                {selectedPreset.sourceUrl ? (
                  <a href={selectedPreset.sourceUrl} rel="noreferrer" target="_blank">
                    {selectedPreset.sourceName} <span>↗</span>
                  </a>
                ) : (
                  <span>{selectedPreset.sourceName}</span>
                )}
                {selectedPreset.status && <span className="source-status">{selectedPreset.status}</span>}
              </div>
              <p className="preset-description">{selectedPreset.description}</p>
              <div className="preset-features">
                <div className="section-kicker">FEATURES IN THE SOURCE PROJECT</div>
                <ul>
                  {selectedPreset.features.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>
              </div>
              <div className="preset-attribution-note">
                This is an original, editable starter in the builder’s supported config model—not a copy of the repository’s files.
                Use a source link, where provided, to explore its full setup, dependencies, and license.
              </div>
              <button className="button button-primary preset-apply" onClick={applyPrebuiltPreset} type="button">
                Load this starter <span className="button-symbol">→</span>
              </button>
            </section>
          </div>
        )}

        {activePage === 'widgets' && (
          <div className="widgets-page">
            <section className="settings-card widget-presets-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">REUSABLE BAR LAYOUTS</div>
                  <h2>Widget presets</h2>
                </div>
                <span className="step-number">{(BUILT_IN_WIDGET_PRESETS.length + widgetPresets.length).toString().padStart(2, '0')}</span>
              </div>
              <div className="widget-preset-grid">
                {BUILT_IN_WIDGET_PRESETS.map((preset) => (
                  <article className="widget-preset" key={preset.id}>
                    <div>
                      <strong>{preset.name}</strong>
                      <span>{preset.widgets.filter((widget) => widget.enabled).length} widgets</span>
                    </div>
                    <button
                      aria-label={`Apply ${preset.name} widget preset`}
                      className="button button-quiet"
                      onClick={() => applyWidgetPreset(preset)}
                      type="button"
                    >
                      Apply
                    </button>
                  </article>
                ))}
                {widgetPresets.map((preset) => (
                  <article className="widget-preset custom" key={preset.id}>
                    <div>
                      <strong>{preset.name}</strong>
                      <span>{preset.widgets.filter((widget) => widget.enabled).length} widgets</span>
                    </div>
                    <button
                      aria-label={`Apply ${preset.name} widget preset`}
                      className="button button-quiet"
                      onClick={() => applyWidgetPreset(preset)}
                      type="button"
                    >
                      Apply
                    </button>
                    <button
                      aria-label={`Delete ${preset.name} widget preset`}
                      className="remove-widget"
                      onClick={() => deleteWidgetPreset(preset.id)}
                      type="button"
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
              <div className="widget-preset-save">
                <label className="visually-hidden" htmlFor="widget-preset-name">Widget preset name</label>
                <input
                  id="widget-preset-name"
                  maxLength={40}
                  onChange={(event) => setWidgetPresetName(event.target.value)}
                  placeholder="Name this widget layout"
                  value={widgetPresetName}
                />
                <button className="button button-quiet" onClick={saveWidgetPreset} type="button">
                  Save current layout
                </button>
              </div>
            </section>
            <div className="widget-columns">
              <section className="settings-card widget-list-card">
                <div className="card-heading">
                  <div>
                    <div className="section-kicker">YOUR STATUS BAR</div>
                    <h2>Added widgets <span className="count-badge">{config.widgets.length}</span></h2>
                  </div>
                  <span className="step-number">01</span>
                </div>
                <p className="card-intro">Move widgets up or down to change their order within each bar section.</p>
                {config.widgets.length === 0 ? (
                  <div className="empty-state">Your bar is empty. Add a widget from the library.</div>
                ) : (
                  <div className="configured-widgets">
                    {config.widgets.map((widget, index) => (
                      <article className={`configured-widget ${!widget.enabled ? 'is-disabled' : ''}`} key={widget.id}>
                        <span className="widget-icon">{iconForWidget(widget.type)}</span>
                        <div className="widget-details">
                          <strong>{WIDGET_CATALOG[widget.type].name}</strong>
                          <span>{WIDGET_CATALOG[widget.type].description}</span>
                        </div>
                        <div className="widget-controls">
                          <button
                            aria-label={`Move ${WIDGET_CATALOG[widget.type].name} up`}
                            disabled={index === 0}
                            onClick={() => moveWidget(index, -1)}
                            type="button"
                          >↑</button>
                          <button
                            aria-label={`Move ${WIDGET_CATALOG[widget.type].name} down`}
                            disabled={index === config.widgets.length - 1}
                            onClick={() => moveWidget(index, 1)}
                            type="button"
                          >↓</button>
                          <label className="switch" title="Toggle widget">
                            <input
                              aria-label={`Enable ${WIDGET_CATALOG[widget.type].name}`}
                              checked={widget.enabled}
                              onChange={(event) => updateWidget(widget.id, { enabled: event.target.checked })}
                              type="checkbox"
                            />
                            <span />
                          </label>
                          <button
                            aria-label={`Remove ${WIDGET_CATALOG[widget.type].name}`}
                            className="remove-widget"
                            onClick={() => removeWidget(widget.id)}
                            type="button"
                          >×</button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="settings-card widget-library-card">
                <div className="card-heading">
                  <div>
                    <div className="section-kicker">BUILT-IN COLLECTION</div>
                    <h2>Widget library</h2>
                  </div>
                  <span className="step-number">02</span>
                </div>
                <p className="card-intro">A starter set of AwesomeWM widgets. More integrations can be added as the catalog grows.</p>
                <div className="widget-catalog">
                  {(Object.entries(WIDGET_CATALOG) as [WidgetType, (typeof WIDGET_CATALOG)[WidgetType]][]).map(([type, item]) => (
                    <article className="catalog-widget" key={type}>
                      <span className="widget-icon">{iconForWidget(type)}</span>
                      <div className="widget-details">
                        <strong>{item.name}</strong>
                        <span>{item.description}</span>
                        {item.dependency && <small>Uses {item.dependency}</small>}
                      </div>
                      <button
                        aria-label={`Add ${item.name}`}
                        className="add-widget"
                        onClick={() => addWidget(type)}
                        type="button"
                      >+</button>
                    </article>
                  ))}
                </div>
                <div className="library-note">
                  <span>i</span>
                  <p>System widgets may need Linux tools or device files: CPU uses <code>top</code>, memory uses <code>free</code>, volume uses <code>wpctl</code>, and network uses <code>nmcli</code>. Battery needs a Linux power-supply device.</p>
                </div>
              </section>
            </div>
          </div>
        )}

        {activePage === 'keybindings' && (
          <div className="keybindings-page">
            <section className="settings-card keybindings-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">SUPPORTED ACTIONS</div>
                  <h2>Keyboard shortcuts</h2>
                </div>
                <span className="step-number">{config.keybindings.length.toString().padStart(2, '0')}</span>
              </div>
              <p className="card-intro">
                Each shortcut uses <kbd>{config.modkey}</kbd> from Desktop settings, with optional Shift.
                Key names are AwesomeWM keysyms such as Return, F1, or space.
              </p>
              {config.keybindings.length === 0 ? (
                <div className="empty-state">No shortcuts yet. Add one of the supported actions below.</div>
              ) : (
                <div className="keybinding-list">
                  {config.keybindings.map((keybinding) => (
                    <article className="keybinding-row" key={keybinding.id}>
                      <div className="keybinding-fields">
                        <div>
                          <label className="field-label" htmlFor={`${keybinding.id}-key`}>Key</label>
                          <input
                            id={`${keybinding.id}-key`}
                            maxLength={32}
                            onChange={(event) => updateKeybinding(keybinding.id, { key: event.target.value })}
                            spellCheck={false}
                            value={keybinding.key}
                          />
                        </div>
                        <label className="keybinding-shift">
                          <input
                            checked={keybinding.shift}
                            onChange={(event) => updateKeybinding(keybinding.id, { shift: event.target.checked })}
                            type="checkbox"
                          />
                          Shift
                        </label>
                        <div className="keybinding-action">
                          <label className="field-label" htmlFor={`${keybinding.id}-action`}>Action</label>
                          <select
                            id={`${keybinding.id}-action`}
                            onChange={(event) => {
                              if (isKeybindingAction(event.target.value)) {
                                updateKeybinding(keybinding.id, { action: event.target.value })
                              }
                            }}
                            value={keybinding.action}
                          >
                            {Object.entries(KEYBINDING_ACTIONS).map(([action, label]) => (
                              <option key={action} value={action}>{label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="keybinding-summary">
                        <kbd>{config.modkey}{keybinding.shift ? ' + Shift' : ''} + {keybinding.key || '…'}</kbd>
                        <button
                          aria-label={`Remove ${KEYBINDING_ACTIONS[keybinding.action]} shortcut`}
                          className="remove-widget"
                          onClick={() => removeKeybinding(keybinding.id)}
                          type="button"
                        >×</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="keybinding-footer">
                <button className="button button-quiet" onClick={addKeybinding} type="button">
                  Add shortcut <span className="button-symbol">+</span>
                </button>
                <span>Generated shortcuts are checked for duplicate keys and valid key names.</span>
              </div>
            </section>
          </div>
        )}

        {activePage === 'appearance' && (
          <div className="appearance-grid">
            <section className="settings-card appearance-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">COLOR PALETTE</div>
                  <h2>Set the tone</h2>
                </div>
                <span className="step-number">01</span>
              </div>
              <p className="card-intro">Choose the colors that define your bar and focused windows.</p>
              <ColorField
                description="Used for focused windows and accents."
                label="Accent color"
                onChange={(value) => updateConfig('accentColor', value)}
                value={config.accentColor}
              />
              <ColorField
                description="The base color for your desktop widgets."
                label="Background color"
                onChange={(value) => updateConfig('backgroundColor', value)}
                value={config.backgroundColor}
              />
              <label className="field-label field-label-spaced" htmlFor="wallpaper">Wallpaper path</label>
              <input
                id="wallpaper"
                onChange={(event) => updateConfig('wallpaper', event.target.value)}
                placeholder="/home/you/Pictures/wallpaper.jpg"
                spellCheck={false}
                value={config.wallpaper}
              />
              <p className="field-hint">Optional. Use an absolute path on the machine running AwesomeWM.</p>
              <label className="field-label field-label-spaced" htmlFor="clock-format">Clock format</label>
              <input
                id="clock-format"
                onChange={(event) => updateConfig('clockFormat', event.target.value)}
                spellCheck={false}
                value={config.clockFormat}
              />
              <p className="field-hint">Uses Lua's strftime-style clock tokens, e.g. %a %d %b  %H:%M.</p>
            </section>

            <section className="appearance-preview-card">
              <div className="section-kicker">PALETTE PREVIEW</div>
              <h2>A little more you.</h2>
              <div className="palette-desktop" style={{ backgroundColor: config.backgroundColor }}>
                <div className="palette-wallpaper">
                  <div className="palette-orbit orbit-one" />
                  <div className="palette-orbit orbit-two" />
                  <div className="palette-window">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="palette-bar" style={{ borderColor: `${config.accentColor}55` }}>
                  <span className="palette-active" style={{ backgroundColor: config.accentColor, color: config.backgroundColor }}>1</span>
                  <span>2</span><span>3</span>
                  <span className="palette-clock">09:41</span>
                </div>
              </div>
              <div className="color-swatches">
                <div><span style={{ backgroundColor: config.backgroundColor }} /><small>BASE</small><code>{config.backgroundColor}</code></div>
                <div><span style={{ backgroundColor: config.accentColor }} /><small>ACCENT</small><code>{config.accentColor}</code></div>
              </div>
              <p className="palette-caption">Colors are applied to AwesomeWM's default theme and generated rc.lua.</p>
            </section>
          </div>
        )}

        {activePage === 'profiles' && (
          <div className="profiles-page">
            <section className="settings-card profile-manager-card">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">LOCAL & PORTABLE</div>
                  <h2>Manage setup profiles</h2>
                </div>
                <span className="step-number">{profiles.length.toString().padStart(2, '0')}</span>
              </div>
              <p className="card-intro">
                Profiles stay in this browser until exported. Import a JSON profile to move it to another machine.
              </p>
              <label className="field-label" htmlFor="saved-profile">Saved profiles</label>
              <div className="profile-browse-controls">
                <input
                  aria-label="Search saved profiles"
                  autoComplete="off"
                  onChange={(event) => setProfileSearch(event.target.value)}
                  placeholder="Search profiles"
                  type="search"
                  value={profileSearch}
                />
                <label className="visually-hidden" htmlFor="profile-sort">Sort profiles</label>
                <select
                  id="profile-sort"
                  onChange={(event) => setProfileSort(event.target.value === 'name' ? 'name' : 'saved')}
                  value={profileSort}
                >
                  <option value="saved">Saved order</option>
                  <option value="name">Name A–Z</option>
                </select>
              </div>
              <p className="field-hint">
                Showing {matchingProfiles.length} of {profiles.length} saved profiles.
              </p>
              <select
                id="saved-profile"
                onChange={(event) => selectProfile(event.target.value)}
                value={selectedProfileId}
              >
                <option value="">Current working setup</option>
                {profileOptions.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}{profile.id === selectedProfileId && !matchingProfiles.some((item) => item.id === profile.id) ? ' (current)' : ''}
                  </option>
                ))}
              </select>

              <label className="field-label field-label-spaced" htmlFor="profile-name">Profile name</label>
              <input
                id="profile-name"
                maxLength={80}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="My Awesome desktop"
                value={profileName}
              />
              <p className="field-hint">
                {selectedProfile
                  ? isSelectedProfileDirty
                    ? 'This working setup differs from the saved profile. Choose Save profile to update it.'
                    : 'This working setup matches the saved profile.'
                  : 'This is a working setup. Save it as a named profile to keep a separate copy.'}
              </p>
              {selectedProfile && (
                <div className="profile-comparison" role="status">
                  <strong>{profileDifferences.length === 0 ? 'No differences' : `${profileDifferences.length} sections differ`}</strong>
                  {profileDifferences.length > 0 && (
                    <span>{profileDifferences.join(' · ')}</span>
                  )}
                </div>
              )}
              <div className="profile-actions">
                <button className="button button-primary" onClick={saveProfile} type="button">
                  Save profile
                </button>
                <button
                  className="button button-quiet"
                  disabled={!selectedProfileId}
                  onClick={duplicateProfile}
                  type="button"
                >
                  Duplicate
                </button>
                <button
                  className="button button-quiet profile-delete"
                  disabled={!selectedProfileId}
                  onClick={deleteProfile}
                  type="button"
                >
                  Delete
                </button>
              </div>
              <div className="divider" />
              <div className="profile-file-actions">
                <button
                  className="button button-quiet"
                  disabled={errors.length > 0 || !profileName.trim()}
                  onClick={exportProfile}
                  type="button"
                >
                  Export JSON <span className="button-symbol">↓</span>
                </button>
                <button
                  className="button button-quiet"
                  onClick={() => profileFileInput.current?.click()}
                  type="button"
                >
                  Import JSON <span className="button-symbol">↑</span>
                </button>
                <input
                  ref={profileFileInput}
                  accept=".json,application/json"
                  aria-label="Choose a profile JSON file"
                  className="visually-hidden"
                  onChange={importProfile}
                  type="file"
                />
              </div>
              {errors.length > 0 && (
                <div className="validation-panel">
                  <strong>Fix the current setup before exporting it</strong>
                  {errors.map((error) => <p key={error}>• {error}</p>)}
                </div>
              )}
            </section>
            <aside className="profile-format-note">
              <div className="section-kicker">PROFILE FILES</div>
              <h2>Move your setup safely.</h2>
              <p>Exports include your visual settings, widgets, and keybindings as validated JSON. They do not contain Lua code or run anything when imported.</p>
              <span>FORMAT VERSION 1</span>
            </aside>
          </div>
        )}

        {activePage === 'code' && (
          <div className="code-page">
            <section className="code-card">
              <div className="code-toolbar">
                <div className="file-tab"><span className="file-dot" /> {environmentId === 'awesomewm' ? 'rc.lua' : `${environmentId}-setup-guide.md`} <span className="file-path">{environment.targetPath}</span></div>
                <div className="code-actions">
                  <span className="code-language">{environment.configFormat.toUpperCase()}</span>
                  <button className="button button-quiet" onClick={copyConfig} type="button">Copy</button>
                  <button className="button button-primary" disabled={errors.length > 0} onClick={downloadConfig} type="button">Download</button>
                </div>
              </div>
              {errors.length > 0 ? (
                <div className="validation-panel">
                  <strong>Fix these settings to generate your config</strong>
                  {errors.map((error) => <p key={error}>• {error}</p>)}
                </div>
              ) : (
                <pre className="code-output"><code>{lua}</code></pre>
              )}
              <div className="code-footer">
                <span><span className="status-dot" /> Generated from your current setup</span>
                <span>{lua.split('\n').length} lines</span>
              </div>
            </section>
            <div className="install-note">
              <span className="install-number">!</span>
              <div>
                <strong>Review before you replace your config</strong>
                <p>
                  Save a backup before changing {environment.name}. Generated native configuration
                  {environmentId === 'awesomewm'
                    ? <> should be placed at <code>{environment.targetPath}</code>.</>
                    : ' will vary by distribution and package; use the review guide first.'}
                </p>
                <button className="text-link" onClick={() => navigateTo('deploy')} type="button">
                  Create a deployment script <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activePage === 'deploy' && (
          <div className="deploy-page">
            <section className="settings-card deploy-overview">
              <div className="card-heading">
                <div>
                  <div className="section-kicker">GUARDED INSTALL</div>
                  <h2>Review, confirm, then deploy.</h2>
                </div>
                <span className="deploy-shield">!</span>
              </div>
              <p className="card-intro">
                The downloaded script contains your current setup. AwesomeWM installations include guarded
                validation and restore commands; other environments receive a reviewable setup guide.
              </p>
              <div className="deployment-steps">
                <div><span>01</span><strong>Preview</strong><small>--dry-run</small></div>
                <div><span>02</span><strong>{environmentId === 'awesomewm' ? 'Confirm' : 'Review'}</strong><small>{environmentId === 'awesomewm' ? 'interactive prompt' : environment.name}</small></div>
                <div><span>03</span><strong>{environmentId === 'awesomewm' ? 'Back up' : 'Backup'}</strong><small>{environmentId === 'awesomewm' ? 'timestamped rc.lua' : 'native config'}</small></div>
                <div><span>04</span><strong>{environmentId === 'awesomewm' ? 'Restore' : 'Apply'}</strong><small>{environmentId === 'awesomewm' ? '--restore-latest' : 'outside this app'}</small></div>
              </div>
              <div className="deployment-actions">
                <button
                  className="button button-quiet"
                  disabled={errors.length > 0}
                  onClick={copyDeploymentScript}
                  type="button"
                >
                  Copy script
                </button>
                <button
                  className="button button-primary"
                  disabled={errors.length > 0}
                  onClick={downloadDeploymentScript}
                  type="button"
                >
                  Download deploy.sh <span className="button-symbol">↓</span>
                </button>
              </div>
              <div className="deploy-cli-actions">
                <button
                  className="button button-quiet"
                  disabled={errors.length > 0}
                  onClick={() => copyDeploymentCommand('--dry-run')}
                  type="button"
                >
                  Copy dry-run command
                </button>
                {environmentId === 'awesomewm' && (
                  <>
                    <button
                      className="button button-quiet"
                      disabled={errors.length > 0}
                      onClick={() => copyDeploymentCommand('--restore-latest')}
                      type="button"
                    >
                      Copy restore command
                    </button>
                    <button
                      className="button button-quiet"
                      onClick={() => copyDeploymentCommand('--list-backups')}
                      type="button"
                    >
                      Copy backup-list command
                    </button>
                  </>
                )}
              </div>
            </section>

            <section className="code-card deploy-script-card">
              <div className="code-toolbar">
                <div className="file-tab">
                  <span className="file-dot" /> {environmentId === 'awesomewm' ? 'deploy-awesome-config.sh' : `deploy-${environmentId}-guide.sh`}
                  <span className="file-path">self-contained</span>
                </div>
                <span className="code-language">BASH</span>
              </div>
              {errors.length > 0 ? (
                <div className="validation-panel">
                  <strong>Fix these settings to create a deployment script</strong>
                  {errors.map((error) => <p key={error}>• {error}</p>)}
                </div>
              ) : (
                <pre className="code-output"><code>{deploymentScript}</code></pre>
              )}
              <div className="code-footer">
                <span><span className="status-dot" /> Contains the current generated config</span>
                <span>{deploymentScript.split('\n').length} lines</span>
              </div>
            </section>

            <div className="install-note">
              <span className="install-number">i</span>
              <div>
                <strong>Nothing runs from this page</strong>
                <p>
                  {environmentId === 'awesomewm' ? (
                    <>
                      Review the downloaded script first. Run <code>bash deploy-awesome-config.sh --dry-run</code>
                      {' '}to validate without changing configuration files, or run
                      {' '}<code>bash deploy-awesome-config.sh</code> to install. To list backups, run
                      {' '}<code>bash deploy-awesome-config.sh --list-backups</code>. Restore with
                      {' '}<code>bash deploy-awesome-config.sh --restore-latest</code>. The script targets
                      {' '}<code>$XDG_CONFIG_HOME/awesome/rc.lua</code> or <code>~/.config/awesome/rc.lua</code>
                      {' '}and never restarts AwesomeWM.
                    </>
                  ) : (
                    <>
                      The generated script prints a review guide for {environment.name}; it does not modify
                      files or install packages. Back up <code>{environment.targetPath}</code> and apply the
                      native settings manually for this environment.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {errors.length > 0 && activePage !== 'code' && (
          <div className="validation-inline" role="alert">
            <strong>One setting needs attention:</strong> {errors[0]}
          </div>
        )}

        <footer className="page-footer">
          <span>AWEFORGE <span className="footer-separator">/</span> DESIGN YOUR AWESOMEWM DESKTOP</span>
          <button onClick={() => navigateTo('code')} type="button">View generated Lua <span>→</span></button>
        </footer>
      </main>
    </div>
  )
}

function DesktopPreview({ config }: { config: AwesomeConfig }) {
  const enabled = config.widgets.filter((widget) => widget.enabled)
  const left = enabled.filter((widget) => WIDGET_CATALOG[widget.type].region === 'left')
  const center = enabled.filter((widget) => WIDGET_CATALOG[widget.type].region === 'center')
  const right = enabled.filter((widget) => WIDGET_CATALOG[widget.type].region === 'right')
  const accent = config.accentColor
  const background = config.backgroundColor

  return (
    <div className="monitor">
      <div
        className={`mock-desktop ${config.barPosition === 'bottom' ? 'bar-at-bottom' : ''}`}
        style={{
          background: `radial-gradient(ellipse at 74% 77%, ${accent}40 0%, transparent 42%), linear-gradient(132deg, ${background}, ${background}ee)`,
          borderColor: `${accent}66`,
        }}
      >
        <div
          className={`mock-bar ${config.barPosition === 'bottom' ? 'mock-bar-bottom' : ''}`}
          style={{ backgroundColor: `${background}ee`, borderColor: `${accent}66` }}
        >
          <div className="mock-bar-region mock-region-left">
            {left.map((widget) => (
              <PreviewWidget
                accent={accent}
                background={background}
                clockFormat={config.clockFormat}
                key={widget.id}
                layout={config.layout}
                widget={widget}
              />
            ))}
          </div>
          <div className="mock-bar-region mock-region-center">
            {center.map((widget) => (
              <PreviewWidget
                accent={accent}
                background={background}
                clockFormat={config.clockFormat}
                key={widget.id}
                layout={config.layout}
                widget={widget}
              />
            ))}
          </div>
          <div className="mock-bar-region mock-region-right">
            {right.map((widget) => (
              <PreviewWidget
                accent={accent}
                background={background}
                clockFormat={config.clockFormat}
                key={widget.id}
                layout={config.layout}
                widget={widget}
              />
            ))}
          </div>
        </div>
        <div className={`mock-workspace layout-${config.layout}`} style={{ gap: `${config.gaps * 1.5}px` }}>
          <div className="mock-window window-one" style={{ borderColor: `${accent}99` }}>
            <div className="window-title" style={{ backgroundColor: `${accent}22` }}><span /><span /><span /><small>files — ~/projects</small></div>
            <div className="window-content">
              <div className="mock-line line-short" style={{ backgroundColor: accent }} /><div className="mock-line" />
              <div className="mock-line line-medium" /><div className="mock-line line-short" />
              <div className="mock-code-block" style={{ borderColor: accent }}><i /><i /><i /><i /></div>
              <div className="mock-line" /><div className="mock-line line-medium" />
            </div>
          </div>
          <div className="mock-window window-two">
            <div className="window-title" style={{ backgroundColor: `${accent}22` }}><span /><span /><span /><small>terminal</small></div>
            <div className="terminal-content">
              <span style={{ color: accent }}>~</span> {config.terminal} --version<br /><em>awesome v4.3</em><br />
              <span>~</span> <b>_</b>
            </div>
          </div>
          <div className="desktop-label"><span>01</span> WORKSPACE ONE</div>
          <div className="wallpaper-shape shape-a" style={{ backgroundColor: `${accent}18` }} />
          <div className="wallpaper-shape shape-b" style={{ backgroundColor: `${accent}0d` }} />
        </div>
      </div>
      <div className="monitor-neck" />
      <div className="monitor-foot" />
    </div>
  )
}

function PreviewWidget({
  widget,
  layout,
  accent,
  background,
  clockFormat,
}: {
  widget: WidgetConfig
  layout: LayoutName
  accent: string
  background: string
  clockFormat: string
}) {
  return (
    <span
      className={`mock-widget mock-widget-${widget.type}`}
      style={
        widget.type === 'taglist'
          ? { color: background, backgroundColor: accent }
          : widget.type === 'layoutbox'
            ? { color: accent }
            : undefined
      }
    >
      {previewLabel(widget.type, layout, clockFormat)}
    </span>
  )
}

function ColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="color-field">
      <div><label className="field-label">{label}</label><p className="field-hint">{description}</p></div>
      <label className="color-input-wrap">
        <input aria-label={label} onChange={(event) => onChange(event.target.value)} type="color" value={value} />
        <code>{value}</code>
      </label>
    </div>
  )
}

export default App
