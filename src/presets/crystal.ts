import { makePreset } from './shared'

export default makePreset({
  id: 'crystal',
  name: 'Crystal — NixOS',
  category: 'Minimal',
  sourceName: 'namishh/crystal',
  sourceUrl: 'https://github.com/namishh/crystal',
  stars: 889,
  description: 'A cool, restrained desktop profile inspired by a Nix-oriented dotfiles environment.',
  features: ['Nix flake-based configuration', 'Host and home profiles', 'AwesomeWM among a wider set of desktop tools'],
  terminal: 'kitty',
  layout: 'fair',
  gaps: 6,
  barPosition: 'top',
  accentColor: '#87b6d8',
  backgroundColor: '#1b2430',
  widgetTypes: ['taglist', 'tasklist', 'keyboardlayout', 'cpu', 'textclock', 'systray', 'layoutbox'],
})
