import { makePreset } from './shared'

export default makePreset({
  id: 'chocolate-bread',
  name: 'ChocolateBread — Macindows',
  category: 'Media-focused',
  sourceName: 'ChocolateBread799/dotfiles',
  sourceUrl: 'https://github.com/ChocolateBread799/dotfiles',
  stars: 749,
  description: 'A warm, media-friendly desktop starter inspired by a collection of AwesomeWM theme variants.',
  features: ['Bling player widget and layout integrations', 'Theme and color-scheme variants', 'Media, screenshot, and application shortcuts'],
  terminal: 'wezterm',
  layout: 'tile',
  gaps: 7,
  barPosition: 'top',
  accentColor: '#e8b796',
  backgroundColor: '#2a211e',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'memory', 'textclock', 'systray', 'keyboardlayout', 'layoutbox'],
})
