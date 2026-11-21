import { makePreset } from './shared'

export default makePreset({
  id: 'calla',
  name: 'Calla Desktop',
  category: 'Desktop environment',
  sourceName: 'Stardust-kyun/calla',
  sourceUrl: 'https://github.com/Stardust-kyun/calla',
  stars: 751,
  description: 'A cohesive desktop environment concept with a settings-first approach and a soft blue palette.',
  features: ['Settings app for theme, fonts, and wallpaper', 'Control center, launcher, and lock screen', 'Volume and brightness popups'],
  terminal: 'alacritty',
  layout: 'tile',
  gaps: 8,
  barPosition: 'bottom',
  accentColor: '#9ac7ff',
  backgroundColor: '#18212a',
  widgetTypes: ['taglist', 'tasklist', 'keyboardlayout', 'textclock', 'systray', 'layoutbox'],
})
