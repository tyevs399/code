export type EnvironmentCategory = 'Desktop environment' | 'Tiling window manager' | 'Stacking window manager'

export type DesktopEnvironmentId =
  | 'awesomewm' | 'i3' | 'sway' | 'hyprland' | 'bspwm' | 'river' | 'dwm'
  | 'niri' | 'xmonad' | 'qtile' | 'wayfire' | 'labwc' | 'openbox' | 'fluxbox'
  | 'icewm' | 'herbstluftwm' | 'leftwm' | 'enlightenment'
  | 'gnome' | 'kde' | 'xfce' | 'cinnamon' | 'mate' | 'budgie' | 'cosmic'
  | 'lxde' | 'lxqt' | 'pantheon' | 'deepin' | 'phosh'

export type DesktopEnvironment = {
  id: DesktopEnvironmentId
  name: string
  category: EnvironmentCategory
  description: string
  configFormat: 'Lua' | 'Text' | 'Shell' | 'C' | 'Desktop settings'
  targetPath: string
  features: string[]
}

export type EnvironmentCapabilityStatus = 'native' | 'partial' | 'guide'

export type EnvironmentExtra = {
  id: string
  name: string
  description: string
  status: EnvironmentCapabilityStatus
}

export const ENVIRONMENT_EXTRA_CATALOG: EnvironmentExtra[] = [
  { id: 'workspaces', name: 'Workspaces', description: 'Virtual desktops, tags, groups, or activities.', status: 'native' },
  { id: 'window-rules', name: 'Window rules', description: 'Rules for launching, floating, assigning, or minimizing applications.', status: 'partial' },
  { id: 'monitors', name: 'Monitor layout', description: 'Resolution, scaling, refresh rate, and per-output placement.', status: 'partial' },
  { id: 'panel', name: 'Panel or bar', description: 'Status-bar, dock, panel, or shell integration.', status: 'native' },
  { id: 'widgets', name: 'Desktop widgets', description: 'Native applets, modules, plugins, or status widgets.', status: 'partial' },
  { id: 'launcher', name: 'Application launcher', description: 'A native or third-party application launcher.', status: 'guide' },
  { id: 'notifications', name: 'Notifications', description: 'Notification daemon, center, style, and history integration.', status: 'partial' },
  { id: 'gestures', name: 'Touch gestures', description: 'Touchpad, touchscreen, and input gestures.', status: 'partial' },
  { id: 'lock-screen', name: 'Lock and session', description: 'Lock screen, suspend, logout, and session integration.', status: 'native' },
  { id: 'screenshots', name: 'Screenshots', description: 'Region, screen, window, and clipboard capture.', status: 'native' },
  { id: 'effects', name: 'Effects and animations', description: 'Compositing effects, transitions, and visual animations.', status: 'partial' },
  { id: 'extensions', name: 'Extensions or plugins', description: 'Environment-specific modules, plugins, or shell extensions.', status: 'guide' },
]

const environmentExtraIds: Partial<Record<DesktopEnvironmentId, string[]>> = {
  awesomewm: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  i3: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  sway: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  hyprland: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'effects', 'lock-screen', 'screenshots'],
  niri: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  xmonad: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen'],
  qtile: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen'],
  bspwm: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen'],
  river: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  dwm: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  herbstluftwm: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen'],
  leftwm: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen'],
  wayfire: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'effects', 'lock-screen', 'screenshots'],
  labwc: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  openbox: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  fluxbox: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'lock-screen'],
  icewm: ['workspaces', 'window-rules', 'monitors', 'panel', 'launcher', 'lock-screen'],
  gnome: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects', 'extensions'],
  kde: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects'],
  xfce: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects'],
  cinnamon: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects', 'extensions'],
  mate: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen', 'screenshots', 'effects'],
  budgie: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects'],
  cosmic: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects'],
  lxde: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  lxqt: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen', 'screenshots'],
  pantheon: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects'],
  deepin: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'gestures', 'lock-screen', 'screenshots', 'effects'],
  enlightenment: ['workspaces', 'window-rules', 'monitors', 'panel', 'widgets', 'launcher', 'notifications', 'lock-screen', 'screenshots', 'effects', 'extensions'],
  phosh: ['workspaces', 'window-rules', 'monitors', 'notifications', 'gestures', 'lock-screen', 'screenshots'],
}

export function getEnvironmentExtras(environmentId: DesktopEnvironmentId): EnvironmentExtra[] {
  const ids = environmentExtraIds[environmentId] ?? []
  return ENVIRONMENT_EXTRA_CATALOG.filter((extra) => ids.includes(extra.id))
}

export function getRecommendedWidgetTypes(environmentId: DesktopEnvironmentId): string[] {
  if (environmentId === 'awesomewm' || environmentId === 'qtile' || environmentId === 'xmonad') {
    return ['Workspaces', 'Window list', 'Layout', 'Clock', 'System tray', 'CPU', 'Memory', 'Battery', 'Volume', 'Network']
  }
  if (environmentExtraIds[environmentId]?.includes('widgets')) {
    return ['Clock', 'Workspace switcher', 'Application launcher', 'System tray', 'Network', 'Volume', 'Battery']
  }
  return ['Clock', 'Workspace switcher', 'Application launcher', 'Network', 'Volume', 'Battery']
}

export const DESKTOP_ENVIRONMENTS: DesktopEnvironment[] = [
  { id: 'awesomewm', name: 'AwesomeWM', category: 'Tiling window manager', description: 'A Lua-configurable tiling window manager.', configFormat: 'Lua', targetPath: '~/.config/awesome/rc.lua', features: ['Lua configuration', 'Widgets', 'Workspaces', 'Tiling layouts'] },
  { id: 'i3', name: 'i3', category: 'Tiling window manager', description: 'A lightweight, X11 tiling window manager.', configFormat: 'Text', targetPath: '~/.config/i3/config', features: ['X11', 'Tiling', 'IPC', 'Simple text config'] },
  { id: 'sway', name: 'Sway', category: 'Tiling window manager', description: 'A Wayland compositor compatible with i3 workflows.', configFormat: 'Text', targetPath: '~/.config/sway/config', features: ['Wayland', 'i3-compatible', 'Scratchpads', 'Multiple outputs'] },
  { id: 'hyprland', name: 'Hyprland', category: 'Tiling window manager', description: 'A dynamic Wayland tiling compositor.', configFormat: 'Text', targetPath: '~/.config/hypr/hyprland.conf', features: ['Dynamic tiling', 'Animations', 'Plugins', 'Wayland'] },
  { id: 'bspwm', name: 'bspwm', category: 'Tiling window manager', description: 'A binary space partitioning window manager.', configFormat: 'Shell', targetPath: '~/.config/bspwm/bspwmrc', features: ['Binary splitting', 'sxhkd integration', 'Shell configuration'] },
  { id: 'river', name: 'River', category: 'Tiling window manager', description: 'A dynamic Wayland compositor with a programmable layout system.', configFormat: 'Shell', targetPath: '~/.config/river/init', features: ['Wayland', 'Tags', 'Shell configuration'] },
  { id: 'dwm', name: 'dwm', category: 'Tiling window manager', description: 'A minimal C-based tiling window manager from suckless.', configFormat: 'C', targetPath: '~/.config/dwm/config.h', features: ['Small codebase', 'C patches', 'Source-based builds'] },
  { id: 'niri', name: 'Niri', category: 'Tiling window manager', description: 'A scrollable-tiling Wayland compositor.', configFormat: 'Text', targetPath: '~/.config/niri/config.kdl', features: ['Scrollable tiling', 'KDL config', 'Wayland', 'Window overview'] },
  { id: 'xmonad', name: 'XMonad', category: 'Tiling window manager', description: 'A Haskell-based, dynamically tiling X11 window manager.', configFormat: 'Text', targetPath: '~/.xmonad/xmonad.hs', features: ['Haskell configuration', 'Dynamic tiling', 'X11', 'Extensions'] },
  { id: 'qtile', name: 'Qtile', category: 'Tiling window manager', description: 'A tiling window manager configured entirely in Python.', configFormat: 'Text', targetPath: '~/.config/qtile/config.py', features: ['Python configuration', 'X11 and Wayland', 'Widgets', 'Layouts'] },
  { id: 'herbstluftwm', name: 'herbstluftwm', category: 'Tiling window manager', description: 'A manual tiling X11 window manager controlled through a shell interface.', configFormat: 'Shell', targetPath: '~/.config/herbstluftwm/autostart', features: ['Manual tiling', 'Shell control', 'Tags', 'X11'] },
  { id: 'leftwm', name: 'LeftWM', category: 'Tiling window manager', description: 'A tiling window manager written in Rust.', configFormat: 'Text', targetPath: '~/.config/leftwm/config.ron', features: ['RON config', 'Themes', 'X11', 'Rust'] },
  { id: 'wayfire', name: 'Wayfire', category: 'Stacking window manager', description: 'A customizable Wayland compositor with 3D-style effects.', configFormat: 'Text', targetPath: '~/.config/wayfire.ini', features: ['Wayland', 'Wayfire plugins', 'Effects', 'Flexible tiling'] },
  { id: 'labwc', name: 'labwc', category: 'Stacking window manager', description: 'A lightweight Wayland compositor inspired by Openbox.', configFormat: 'Text', targetPath: '~/.config/labwc/rc.xml', features: ['Wayland', 'Openbox-style XML', 'Lightweight', 'Wayland protocols'] },
  { id: 'openbox', name: 'Openbox', category: 'Stacking window manager', description: 'A highly configurable, standards-compliant X11 stacking window manager.', configFormat: 'Text', targetPath: '~/.config/openbox/rc.xml', features: ['X11', 'XML config', 'Right-click menu', 'Lightweight'] },
  { id: 'fluxbox', name: 'Fluxbox', category: 'Stacking window manager', description: 'A lightweight X11 window manager based on Blackbox conventions.', configFormat: 'Text', targetPath: '~/.fluxbox/init', features: ['X11', 'Tabs', 'Slit', 'Lightweight'] },
  { id: 'icewm', name: 'IceWM', category: 'Stacking window manager', description: 'A fast and traditional X11 window manager.', configFormat: 'Text', targetPath: '~/.icewm/preferences', features: ['X11', 'Traditional desktop', 'Low resource use', 'Themes'] },
  { id: 'enlightenment', name: 'Enlightenment', category: 'Desktop environment', description: 'A composited desktop shell and window manager known for visual effects.', configFormat: 'Desktop settings', targetPath: 'Enlightenment Settings', features: ['Compositing', 'Modules', 'Shelves', 'Virtual desktops'] },
  { id: 'gnome', name: 'GNOME', category: 'Desktop environment', description: 'A modern, keyboard-centered Linux desktop.', configFormat: 'Desktop settings', targetPath: 'GNOME Settings / dconf', features: ['GNOME Settings', 'Extensions', 'Touchpad gestures', 'Activities'] },
  { id: 'kde', name: 'KDE Plasma', category: 'Desktop environment', description: 'A highly customizable desktop for X11 and Wayland.', configFormat: 'Desktop settings', targetPath: '~/.config and KDE Settings', features: ['KWin', 'KDE Settings', 'Widgets', 'Wayland'] },
  { id: 'xfce', name: 'Xfce', category: 'Desktop environment', description: 'A lightweight and traditional Linux desktop.', configFormat: 'Desktop settings', targetPath: '~/.config/xfce4', features: ['Panels', 'Lightweight', 'Thunar', 'XFWM'] },
  { id: 'cinnamon', name: 'Cinnamon', category: 'Desktop environment', description: 'A traditional desktop from the Linux Mint project.', configFormat: 'Desktop settings', targetPath: 'Cinnamon Settings / dconf', features: ['Panels', 'Applets', 'Nemo', 'Muffin'] },
  { id: 'mate', name: 'MATE', category: 'Desktop environment', description: 'A continuation of the classic GNOME 2 desktop.', configFormat: 'Desktop settings', targetPath: 'MATE Control Center / dconf', features: ['Classic layout', 'Panels', 'Caja', 'Marco'] },
  { id: 'budgie', name: 'Budgie', category: 'Desktop environment', description: 'A clean and modular desktop based on GNOME technologies.', configFormat: 'Desktop settings', targetPath: 'Budgie Desktop Settings', features: ['Raven', 'Panels', 'Applets', 'GNOME integration'] },
  { id: 'cosmic', name: 'COSMIC', category: 'Desktop environment', description: 'A Rust-based desktop built by System76.', configFormat: 'Desktop settings', targetPath: '~/.config/cosmic', features: ['Wayland', 'Tilings', 'Rust', 'System76'] },
  { id: 'lxde', name: 'LXDE', category: 'Desktop environment', description: 'A lightweight traditional desktop built around Openbox.', configFormat: 'Desktop settings', targetPath: '~/.config/lxde', features: ['Openbox', 'LXPanel', 'Lightweight', 'Traditional'] },
  { id: 'lxqt', name: 'LXQt', category: 'Desktop environment', description: 'A lightweight Qt-based desktop environment.', configFormat: 'Desktop settings', targetPath: '~/.config/lxqt', features: ['Qt', 'Openbox or KWin', 'Lightweight', 'LXPanel'] },
  { id: 'pantheon', name: 'Pantheon', category: 'Desktop environment', description: 'The elementary OS desktop environment.', configFormat: 'Desktop settings', targetPath: 'Pantheon Settings / dconf', features: ['Dock', 'Wingpanel', 'Gala', 'Elementary design'] },
  { id: 'deepin', name: 'Deepin', category: 'Desktop environment', description: 'A Qt-based desktop environment with a modern visual style.', configFormat: 'Desktop settings', targetPath: 'Deepin Control Center / dconf', features: ['Qt', 'Dock', 'Control Center', 'Deepin WM'] },
  { id: 'phosh', name: 'Phosh', category: 'Desktop environment', description: 'A mobile Linux shell based on GNOME technologies.', configFormat: 'Desktop settings', targetPath: 'GNOME and Phosh settings', features: ['Wayland', 'Mobile shell', 'Phone UI', 'GNOME integration'] },
]
