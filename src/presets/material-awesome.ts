import { makePreset } from './shared'

export default makePreset({
  id: 'material-awesome',
  name: 'Material and Mouse',
  category: 'Material-inspired',
  sourceName: 'material-shell/material-awesome',
  sourceUrl: 'https://github.com/material-shell/material-awesome',
  stars: 678,
  status: 'Unmaintained source',
  description: 'A material-inspired, mouse-friendly workflow adapted to the builder’s core settings and widgets.',
  features: ['Material Design-inspired desktop UI', 'Mouse and keyboard workflow', 'Panels and an exit screen'],
  terminal: 'xterm',
  layout: 'fair',
  gaps: 8,
  barPosition: 'top',
  accentColor: '#80cbc4',
  backgroundColor: '#212121',
  widgetTypes: ['taglist', 'tasklist', 'keyboardlayout', 'cpu', 'textclock', 'systray', 'layoutbox'],
})
