// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => {
  window.localStorage.clear()
  vi.spyOn(window, 'confirm').mockImplementation(() => true)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('configuration studio interactions', () => {
  it('offers Linux desktop and window manager environments', () => {
    render(<App />)

    const environment = screen.getByLabelText('Desktop environment or window manager')
    fireEvent.change(environment, { target: { value: 'sway' } })

    expect(screen.getByText(/Wayland compositor compatible with i3 workflows/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Setup guide/ }))
    expect(screen.getByText(/Linux Desktop Forge setup guide/)).toBeTruthy()
  })

  it('auto-saves valid draft changes and records the save timestamp', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Floating/ }))

    await waitFor(() => {
      expect(screen.getByText('Draft saved')).toBeTruthy()
    }, { timeout: 1500 })

    const recovery = JSON.parse(window.localStorage.getItem('awesome-config-studio-recovery') ?? '{}')
    expect(recovery.config.layout).toBe('floating')
    expect(recovery.savedAt).toBeTruthy()
    expect(screen.getByText(/Last saved/)).toBeTruthy()
  })

  it('shows dirty state and supports undoing a layout change', () => {
    render(<App />)

    expect(screen.getByText('Draft saved')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Floating/ }))

    expect(screen.getByText('Draft not saved')).toBeTruthy()
    const undo = screen.getByRole('button', { name: 'Undo configuration change' })
    expect((undo as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(undo)

    expect(screen.getByText('Draft saved')).toBeTruthy()
  })

  it('accurately explains that unsaved edits remain in the working setup during navigation', () => {
    vi.mocked(window.confirm).mockReturnValue(false)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Floating/ }))
    fireEvent.click(screen.getByRole('button', { name: /Profiles/ }))

    expect(window.confirm).toHaveBeenCalledWith(
      'Your edits will stay in the working setup while you navigate, but they are not saved in this browser yet. Continue?',
    )
    expect(screen.getByRole('heading', { name: 'Desktop setup' })).toBeTruthy()

    vi.mocked(window.confirm).mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: /Profiles/ }))
    expect(screen.getByRole('heading', { name: 'Profiles' })).toBeTruthy()
  })

  it('does not intercept undo while focus is in an editable field', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Floating/ }))
    fireEvent.click(screen.getByRole('button', { name: /Profiles/ }))
    const profileName = screen.getByLabelText('Profile name')
    fireEvent.change(profileName, { target: { value: 'Studio profile' } })
    fireEvent.keyDown(profileName, { key: 'z', ctrlKey: true })

    expect(screen.getByText('Draft not saved')).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Undo configuration change' }) as HTMLButtonElement).disabled)
      .toBe(false)
  })

  it('searches and previews community configurations', () => {
    const { container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Community/ }))
    const communityPage = container.querySelector('.prebuilt-page')
    expect(
      Array.from(communityPage?.children ?? []).map((child) =>
        child.classList.contains('community-browser')
          ? 'browse'
          : child.classList.contains('preset-preview-card')
            ? 'preview'
            : 'details',
      ),
    ).toEqual(['browse', 'preview', 'details'])
    fireEvent.change(screen.getByRole('combobox', { name: 'Starter direction' }), {
      target: { value: 'Developer-focused' },
    })
    const search = screen.getByRole('searchbox', { name: /Search by name/ })
    fireEvent.change(search, { target: { value: 'Hellfire' } })

    expect(screen.getByText(/1 of 11 curated entries/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Hellfire/ }))

    expect(screen.getByRole('heading', { name: 'Hellfire' })).toBeTruthy()
    expect(screen.getAllByText('User-provided Hellfire deployment script')).toHaveLength(2)
    expect(container.querySelector('.mock-desktop')?.getAttribute('style')).toContain('rgb(11, 12, 16)')
    expect(container.querySelector('.mock-widget-taglist')?.textContent).toContain('1   2   3')
    expect(container.querySelector('.terminal-content')?.textContent).toContain('alacritty --version')

    fireEvent.change(search, { target: { value: 'no matching config' } })
    fireEvent.click(screen.getByRole('button', { name: /Clear filters/ }))
    expect(screen.getByText(/11 of 11 curated entries/)).toBeTruthy()
  })

  it('applies and saves reusable widget presets', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Widgets/ }))

    fireEvent.click(screen.getByRole('button', { name: 'Apply Minimal widget preset' }))
    expect(screen.getByText('4')).toBeTruthy()

    const presetName = screen.getByLabelText('Widget preset name')
    fireEvent.change(presetName, { target: { value: 'My bar' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save current layout' }))

    expect(screen.getByText('My bar')).toBeTruthy()
  })

  it('searches profiles without hiding the currently selected profile', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Profiles/ }))

    const nameInput = screen.getByLabelText('Profile name')
    fireEvent.change(nameInput, { target: { value: 'Alpha' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(screen.getByText('Profile saved')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Saved profiles'), { target: { value: '' } })
    fireEvent.change(nameInput, { target: { value: 'Beta' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save profile' }))
    expect(screen.getByText('Profile saved')).toBeTruthy()
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search saved profiles' }), {
      target: { value: 'Alpha' },
    })

    expect(screen.getByText('Showing 1 of 2 saved profiles.')).toBeTruthy()
    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toContain('Alpha')
    expect(options).toContain('Beta (current)')
  })
})
