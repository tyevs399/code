export type EnvironmentCategory = 'Desktop environment' | 'Tiling window manager' | 'Stacking window manager'

export type DesktopEnvironmentId =
  | 'awesomewm' | 'i3' | 'sway' | 'hyprland' | 'bspwm' | 'river' | 'dwm'
  | 'gnome' | 'kde' | 'xfce' | 'cinnamon' | 'mate' | 'budgie' | 'cosmic'

export type DesktopEnvironment = {
  id: DesktopEnvironmentId
  name: string
  category: EnvironmentCategory
  description: string
  configFormat: 'Lua' | 'Text' | 'Shell' | 'C' | 'Desktop settings'
  targetPath: string
  features: string[]
}

export const DESKTOP_ENVIRONMENTS: DesktopEnvironment[] = [
  { id: 'awesomewm', name: 'AwesomeWM', category: 'Tiling window manager', description: 'A Lua-configurable tiling window manager.', configFormat: 'Lua', targetPath: '~/.config/awesome/rc.lua', features: ['Lua configuration', 'Widgets', 'Workspaces', 'Tiling layouts'] },
  { id: 'i3', name: 'i3', category: 'Tiling window manager', description: 'A lightweight, X11 tiling window manager.', configFormat: 'Text', targetPath: '~/.config/i3/config', features: ['X11', 'Tiling', 'IPC', 'Simple text config'] },
  { id: 'sway', name: 'Sway', category: 'Tiling window manager', description: 'A Wayland compositor compatible with i3 workflows.', configFormat: 'Text', targetPath: '~/.config/sway/config', features: ['Wayland', 'i3-compatible', 'Scratchpads', 'Multiple outputs'] },
  { id: 'hyprland', name: 'Hyprland', category: 'Tiling window manager', description: 'A dynamic Wayland tiling compositor.', configFormat: 'Text', targetPath: '~/.config/hypr/hyprland.conf', features: ['Dynamic tiling', 'Animations', 'Plugins', 'Wayland'] },
  { id: 'bspwm', name: 'bspwm', category: 'Tiling window manager', description: 'A binary space partitioning window manager.', configFormat: 'Shell', targetPath: '~/.config/bspwm/bspwmrc', features: ['Binary splitting', 'sxhkd integration', 'Shell configuration'] },
  { id: 'river', name: 'River', category: 'Tiling window manager', description: 'A dynamic Wayland compositor with a programmable layout system.', configFormat: 'Shell', targetPath: '~/.config/river/init', features: ['Wayland', 'Tags', 'Shell configuration'] },
  { id: 'dwm', name: 'dwm', category: 'Tiling window manager', description: 'A minimal C-based tiling window manager from suckless.', configFormat: 'C', targetPath: '~/.config/dwm/config.h', features: ['Small codebase', 'C patches', 'Source-based builds'] },
  { id: 'gnome', name: 'GNOME', category: 'Desktop environment', description: 'A modern, keyboard-centered Linux desktop.', configFormat: 'Desktop settings', targetPath: 'GNOME Settings / dconf', features: ['GNOME Settings', 'Extensions', 'Touchpad gestures', 'Activities'] },
  { id: 'kde', name: 'KDE Plasma', category: 'Desktop environment', description: 'A highly customizable desktop for X11 and Wayland.', configFormat: 'Desktop settings', targetPath: '~/.config and KDE Settings', features: ['KWin', 'KDE Settings', 'Widgets', 'Wayland'] },
  { id: 'xfce', name: 'Xfce', category: 'Desktop environment', description: 'A lightweight and traditional Linux desktop.', configFormat: 'Desktop settings', targetPath: '~/.config/xfce4', features: ['Panels', 'Lightweight', 'Thunar', 'XFWM'] },
  { id: 'cinnamon', name: 'Cinnamon', category: 'Desktop environment', description: 'A traditional desktop from the Linux Mint project.', configFormat: 'Desktop settings', targetPath: 'Cinnamon Settings / dconf', features: ['Panels', 'Applets', 'Nemo', 'Muffin'] },
  { id: 'mate', name: 'MATE', category: 'Desktop environment', description: 'A continuation of the classic GNOME 2 desktop.', configFormat: 'Desktop settings', targetPath: 'MATE Control Center / dconf', features: ['Classic layout', 'Panels', 'Caja', 'Marco'] },
  { id: 'budgie', name: 'Budgie', category: 'Desktop environment', description: 'A clean and modular desktop based on GNOME technologies.', configFormat: 'Desktop settings', targetPath: 'Budgie Desktop Settings', features: ['Raven', 'Panels', 'Applets', 'GNOME integration'] },
  { id: 'cosmic', name: 'COSMIC', category: 'Desktop environment', description: 'A Rust-based desktop built by System76.', configFormat: 'Desktop settings', targetPath: '~/.config/cosmic', features: ['Wayland', 'Tilings', 'Rust', 'System76'] },
]
