import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NotFoundPage } from './NotFound'
import { LangContext } from '../lib/lang'
import { getData, LANGS } from '../lib/data'

afterEach(cleanup)

describe.each(LANGS)('404 page (%s)', (lang) => {
  const { notFound } = getData(lang, 'site')

  it('shows the title and the text of site.json and a link back to Home', () => {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <MemoryRouter>
          <NotFoundPage />
        </MemoryRouter>
      </LangContext.Provider>,
    )
    const view = within(screen.getByRole('main'))
    expect(view.getByRole('heading', { level: 1 }).textContent).toBe(notFound.title)
    expect(view.getByText(notFound.text)).toBeTruthy()
    expect(view.getByRole('link', { name: notFound.cta.label }).getAttribute('href')).toBe('/')
  })
})
