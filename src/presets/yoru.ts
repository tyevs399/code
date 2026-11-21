import { makePreset } from './shared'

export default makePreset({
  id: 'yoru',
  name: 'Yoru',
  category: 'Cool-toned',
  sourceName: 'raexera/yoru',
  sourceUrl: 'https://github.com/raexera/yoru',
  stars: 3571,
  status: 'Archived source',
  description: 'A custom Linux environment built around AwesomeWM, with a quiet, cool-toned desktop feel.',
  features: ['AwesomeWM desktop environment', 'Companion music and terminal configs', 'Widget-friendly status bar'],
  terminal: 'wezterm',
  layout: 'fair',
  gaps: 9,
  barPosition: 'top',
  accentColor: '#b8c2f0',
  backgroundColor: '#1a1b24',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'memory', 'keyboardlayout', 'textclock', 'systray', 'layoutbox'],
})
