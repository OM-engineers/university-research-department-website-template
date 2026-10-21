import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HeaderNav } from './HeaderNav'
import { LangContext } from '../lib/lang'
import type { Lang } from '../lib/data'

function renderHeader({ lang = 'en' as Lang, path = '/', setLang = vi.fn() } = {}) {
  render(
    <LangContext.Provider value={{ lang, setLang }}>
      <MemoryRouter initialEntries={[path]}>
        <HeaderNav />
      </MemoryRouter>
    </LangContext.Provider>,
  )
  return { setLang }
}

const desktopNav = () => screen.getAllByRole('navigation', { name: 'Main navigation' })[0]

afterEach(cleanup)

describe('HeaderNav', () => {
  it('shows the five menu entries', () => {
    renderHeader()
    const links = within(desktopNav())
      .getAllByRole('link')
      .map((a) => a.textContent)
    expect(links).toEqual(['Home', 'About us', 'Networking', 'Projects', 'News & events'])
  })

  it('opens and closes a dropdown with the button and Escape', () => {
    renderHeader()
    const toggle = within(desktopNav()).getByRole('button', { name: 'About us submenu' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Regulations' }).getAttribute('href')).toBe('/about#regulations')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
  })

  it('has the 4 items of the About us dropdown (Catalogue K-01), two of them scroll to #mission and #regulations', () => {
    renderHeader()
    const toggle = within(desktopNav()).getByRole('button', { name: 'About us submenu' })
    fireEvent.click(toggle)
    const links = within(document.getElementById(toggle.getAttribute('aria-controls')!)!).getAllByRole('link')
    expect(links.map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['Mission and vision', '/about#mission'],
      ['Regulations', '/about#regulations'],
      ['People', '/people'],
      ['Contact and join us', '/contact'],
    ])
  })

  it('lists the latest 3 projects and "View all" in the Projects dropdown', () => {
    renderHeader()
    const toggle = within(desktopNav()).getByRole('button', { name: 'Projects submenu' })
    fireEvent.click(toggle)
    const links = within(document.getElementById(toggle.getAttribute('aria-controls')!)!).getAllByRole('link')
    expect(links).toHaveLength(4)
    expect(links[0].getAttribute('href')).toMatch(/^\/projects\/proj-/)
    expect(links[3].textContent).toContain('View all')
  })

  it('marks the current section', () => {
    renderHeader({ path: '/people' })
    expect(within(desktopNav()).getByRole('link', { name: 'About us' }).getAttribute('aria-current')).toBe('page')
  })

  it('switches the language', () => {
    const { setLang } = renderHeader()
    const group = screen.getByRole('group', { name: 'Language' })
    expect(within(group).getByRole('button', { name: 'EN' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(within(group).getByRole('button', { name: 'IT' }))
    expect(setLang).toHaveBeenCalledWith('it')
  })

  it('shows Italian labels', () => {
    renderHeader({ lang: 'it' })
    const nav = screen.getAllByRole('navigation', { name: 'Navigazione principale' })[0]
    expect(within(nav).getByRole('link', { name: 'Chi siamo' })).toBeTruthy()
  })

  it('opens and closes the phone menu', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getAllByRole('navigation', { name: 'Main navigation' })).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getAllByRole('navigation', { name: 'Main navigation' })).toHaveLength(1)
  })

  it('renders the page content below the header', () => {
    render(
      <MemoryRouter>
        <HeaderNav>
          <main>Page content</main>
        </HeaderNav>
      </MemoryRouter>,
    )
    const main = screen.getByRole('main')
    expect(main.textContent).toBe('Page content')
    expect(screen.getByRole('banner').nextElementSibling).toBe(main)
  })

  it('shows the search icon, disabled while search is off', () => {
    renderHeader()
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Search' }).disabled).toBe(true)
  })
})
