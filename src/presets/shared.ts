import {
  DEFAULT_CONFIG,
  type AwesomeConfig,
  type LayoutName,
  type TerminalName,
  type WidgetType,
} from '../model'

export interface PrebuiltPreset {
  id: string
  name: string
  category: PresetCategory
  sourceName: string
  sourceUrl?: string
  stars: number
  description: string
  features: string[]
  status?: string
  config: AwesomeConfig
}

export type PresetCategory =
  | 'Colorful'
  | 'Cool-toned'
  | 'Developer-focused'
  | 'Desktop environment'
  | 'Material-inspired'
  | 'Media-focused'
  | 'Minimal'
  | 'Pastel'

interface PresetDefinition extends Omit<PrebuiltPreset, 'config'> {
  terminal: TerminalName
  layout: LayoutName
  gaps: number
  barPosition: 'top' | 'bottom'
  accentColor: string
  backgroundColor: string
  widgetTypes: WidgetType[]
  modkey?: 'Mod1' | 'Mod4' | 'Control'
  clockFormat?: string
}

export function makePreset(definition: PresetDefinition): PrebuiltPreset {
  const { widgetTypes, ...metadata } = definition

  return {
    ...metadata,
    config: {
      ...DEFAULT_CONFIG,
      terminal: definition.terminal,
      modkey: definition.modkey ?? DEFAULT_CONFIG.modkey,
      layout: definition.layout,
      gaps: definition.gaps,
      barPosition: definition.barPosition,
      accentColor: definition.accentColor,
      backgroundColor: definition.backgroundColor,
      clockFormat: definition.clockFormat ?? DEFAULT_CONFIG.clockFormat,
      widgets: widgetTypes.map((type, index) => ({
        id: `${definition.id}-widget-${index + 1}`,
        type,
        enabled: true,
      })),
    },
  }
}
