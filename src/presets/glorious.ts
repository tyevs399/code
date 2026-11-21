import { makePreset } from './shared'

export default makePreset({
  id: 'glorious',
  name: 'The Glorious — GNawesOME',
  category: 'Desktop environment',
  sourceName: 'eromatiya/the-glorious-dotfiles',
  sourceUrl: 'https://github.com/eromatiya/the-glorious-dotfiles',
  stars: 2688,
  description: 'A maximal desktop concept with a distinctive dashboard and a hybrid desktop-inspired look.',
  features: ['Multiple named desktop themes', 'Dynamic wallpaper and multi-monitor support', 'Dashboard, notification center, and utility widgets'],
  terminal: 'kitty',
  layout: 'fair',
  gaps: 8,
  barPosition: 'top',
  accentColor: '#89a8de',
  backgroundColor: '#1c2433',
  widgetTypes: ['taglist', 'tasklist', 'cpu', 'memory', 'textclock', 'systray', 'keyboardlayout', 'layoutbox'],
})
