import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HeaderNav } from '../components/HeaderNav'
import { Footer } from '../components/Footer'
import { getData } from './data'
import { LangProvider } from './LangProvider'
import { LANG_STORAGE_KEY } from './lang'

function renderApp() {
  render(
    <LangProvider>
      <MemoryRouter>
        <HeaderNav />
        <Footer />
      </MemoryRouter>
    </LangProvider>,
  )
}

const clickLang = (name: 'IT' | 'EN') =>
  fireEvent.click(within(screen.getByRole('group', { name: /Language|Lingua/ })).getByRole('button', { name }))

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  document.documentElement.removeAttribute('lang')
})

describe('LangProvider', () => {
  it('starts in English', () => {
    renderApp()
    expect(screen.getAllByRole('navigation', { name: 'Main navigation' })).toHaveLength(1)
    expect(document.documentElement.lang).toBe('en')
  })

  it('switches menu and footer to Italian and back', () => {
    renderApp()
    const it = getData('it', 'site')
    const en = getData('en', 'site')
    const footer = () => within(screen.getByRole('contentinfo'))

    clickLang('IT')
    expect(screen.getAllByRole('navigation', { name: 'Navigazione principale' })).toHaveLength(1)
    expect(footer().getByRole('heading', { name: it.footer.quickLinks.title })).toBeTruthy()
    expect(footer().getByRole('heading', { name: it.footer.contact.title })).toBeTruthy()
    expect(footer().getByText(it.footer.description)).toBeTruthy()
    expect(footer().getByText(it.footer.copyright)).toBeTruthy()
    expect(footer().getByRole('link', { name: it.footer.university.label })).toBeTruthy()
    expect(document.documentElement.lang).toBe('it')

    clickLang('EN')
    expect(footer().getByRole('heading', { name: en.footer.quickLinks.title })).toBeTruthy()
    expect(footer().getByText(en.footer.copyright)).toBeTruthy()
    expect(document.documentElement.lang).toBe('en')
  })

  it('saves the language and restores it on the next visit', () => {
    renderApp()
    clickLang('IT')
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('it')
    cleanup()

    renderApp()
    expect(screen.getAllByRole('navigation', { name: 'Navigazione principale' })).toHaveLength(1)
  })

  it('ignores an invalid saved value', () => {
    window.localStorage.setItem(LANG_STORAGE_KEY, 'fr')
    renderApp()
    expect(screen.getAllByRole('navigation', { name: 'Main navigation' })).toHaveLength(1)
  })
})
