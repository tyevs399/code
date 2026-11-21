import { makePreset } from './shared'

export default makePreset({
  id: 'saimoo',
  name: 'Saimoo — Arch desktop',
  category: 'Desktop environment',
  sourceName: 'saimoomedits/dotfiles',
  sourceUrl: 'https://github.com/saimoomedits/dotfiles',
  stars: 1174,
  description: 'A modular AwesomeWM setup with separate theme, layout, and helper components.',
  features: ['Custom layout and helper modules', 'Dedicated theme and signal folders', 'Arch-focused desktop dotfiles'],
  terminal: 'kitty',
  layout: 'tile',
  gaps: 6,
  barPosition: 'bottom',
  accentColor: '#a7c7b9',
  backgroundColor: '#1d282c',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'memory', 'textclock', 'systray', 'layoutbox'],
})
