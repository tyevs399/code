import { makePreset } from './shared'

export default makePreset({
  id: 'alpha-technolog',
  name: 'AlphaTechnolog — Vertical',
  category: 'Colorful',
  sourceName: 'AlphaTechnolog/dotfiles',
  sourceUrl: 'https://github.com/AlphaTechnolog/dotfiles',
  stars: 825,
  description: 'A vivid, compact starter based on one of the repository’s AwesomeWM theme variants.',
  features: ['Vertical and horizontal AwesomeWM variants', 'Several window-manager themes in the source repo', 'Color-focused desktop styling'],
  terminal: 'wezterm',
  layout: 'fair',
  gaps: 6,
  barPosition: 'top',
  accentColor: '#f0a6ca',
  backgroundColor: '#201a26',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'textclock', 'systray', 'keyboardlayout', 'layoutbox'],
})
