import { makePreset } from './shared'

export default makePreset({
  id: 'hellfire',
  name: 'Hellfire',
  category: 'Developer-focused',
  sourceName: 'User-provided Hellfire deployment script',
  sourceUrl: undefined,
  stars: 0,
  status: 'Community script — unverified upstream',
  description:
    'A developer-focused Obsidian and Ember starter inspired by the attached Hellfire deployment script.',
  features: [
    'Obsidian, ember, orange, and molten-gold palette',
    'Alacritty, Mod1, tiling, and compact top-bar workflow',
    'CPU, memory, clock, tray, and layout widgets',
  ],
  terminal: 'alacritty',
  modkey: 'Mod1',
  layout: 'tile',
  gaps: 5,
  barPosition: 'top',
  accentColor: '#FF6B00',
  backgroundColor: '#0B0C10',
  clockFormat: '%a %b %d  %H:%M',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'memory', 'textclock', 'systray', 'layoutbox'],
})
