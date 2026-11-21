import { makePreset } from './shared'

export default makePreset({
  id: 'awesome-dotfiles',
  name: 'Awesome Dotfiles — Pastel',
  category: 'Pastel',
  sourceName: 'WillPower3309/awesome-dotfiles',
  sourceUrl: 'https://github.com/WillPower3309/awesome-dotfiles',
  stars: 1340,
  description: 'A lightweight pastel desktop starter, adapted from a multi-theme AwesomeWM setup.',
  features: ['Pastel and Mirage theme variants', 'i3-like keyboard workflow', 'Touch and multi-monitor considerations'],
  terminal: 'alacritty',
  layout: 'tile',
  gaps: 7,
  barPosition: 'top',
  accentColor: '#d8b9db',
  backgroundColor: '#25242e',
  widgetTypes: ['taglist', 'tasklist', 'keyboardlayout', 'textclock', 'systray', 'layoutbox'],
})
