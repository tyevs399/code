import { makePreset } from './shared'

export default makePreset({
  id: 'raven2cz',
  name: 'Raven2cz — Multicolor',
  category: 'Colorful',
  sourceName: 'raven2cz/awesomewm-config',
  sourceUrl: 'https://github.com/raven2cz/awesomewm-config',
  stars: 439,
  description: 'A richly configurable starter with a cool multicolor palette and a dashboard-like status bar.',
  features: ['Multiple color schemes and wallpaper switching', 'HiDPI and multi-monitor support', 'Dashboard with media, task, and system widgets'],
  terminal: 'kitty',
  layout: 'fair',
  gaps: 7,
  barPosition: 'top',
  accentColor: '#b2c5ef',
  backgroundColor: '#1f2430',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'memory', 'keyboardlayout', 'textclock', 'systray', 'layoutbox'],
})
