import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Footer } from './Footer'
import { LangContext } from '../lib/lang'
import { getData, LANGS } from '../lib/data'

afterEach(cleanup)

describe.each(LANGS)('Footer (%s)', (lang) => {
  const { footer, logo } = getData(lang, 'site')

  function renderFooter() {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      </LangContext.Provider>,
    )
    return within(screen.getByRole('contentinfo'))
  }

  it('shows the texts of site.json', () => {
    const view = renderFooter()
    expect(view.getByRole('link', { name: logo.text })).toBeTruthy()
    expect(view.getByText(footer.description)).toBeTruthy()
    expect(view.getByRole('heading', { name: footer.contact.title })).toBeTruthy()
    expect(view.getByText(footer.contact.address)).toBeTruthy()
    expect(view.getByRole('link', { name: footer.contact.email }).getAttribute('href')).toBe(`mailto:${footer.contact.email}`)
    expect(view.getByText(footer.contact.phone)).toBeTruthy()
    expect(view.getByRole('heading', { name: footer.quickLinks.title })).toBeTruthy()
    expect(view.getByText(footer.copyright)).toBeTruthy()
  })

  it('lists every quick link with its route', () => {
    const view = renderFooter()
    for (const item of footer.quickLinks.items) {
      const links = view.getAllByRole('link', { name: item.label })
      expect(links.some((a) => a.getAttribute('href') === item.link)).toBe(true)
    }
  })

  it('shows the social and university links', () => {
    const view = renderFooter()
    for (const s of footer.social) {
      expect(view.getByRole('link', { name: s.label }).getAttribute('href')).toBe(s.link)
    }
    expect(view.getByRole('link', { name: footer.university.label })).toBeTruthy()
  })
})
