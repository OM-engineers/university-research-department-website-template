import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { NewsDetailPage } from './NewsDetail'
import { NewsPage } from './News'
import { LangContext } from '../lib/lang'
import { getData, LANGS, type Lang } from '../lib/data'
import { formatDate } from '../lib/format'
import { ui } from '../lib/ui'

afterEach(cleanup)

function renderAt(path: string, lang: Lang) {
  return render(
    <LangContext.Provider value={{ lang, setLang: () => {} }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
        </Routes>
      </MemoryRouter>
    </LangContext.Provider>,
  )
}

describe.each(LANGS)('News detail page, S-08 (T-152, %s)', (lang) => {
  const news = getData(lang, 'news')
  const site = getData(lang, 'site')

  it.each(news.items.map((item) => [item.id, item] as const))('%s shows its title, type, date, location and summary', (id, item) => {
    renderAt(`/news/${id}`, lang)
    const view = within(screen.getByRole('main'))
    expect(view.getByRole('heading', { level: 1 }).textContent).toBe(item.title)
    expect(view.getByText(ui[lang].newsType[item.type])).toBeTruthy()
    expect(view.getByText(formatDate(item.date, lang)).getAttribute('dateTime')).toBe(item.date)
    expect(view.getByText(item.location)).toBeTruthy()
    expect(view.getByText(item.summary)).toBeTruthy()
    expect(view.getByRole('img', { name: item.title }).getAttribute('src')).toBe(item.image)
  })

  it('links back to the News and events page', () => {
    renderAt(`/news/${news.items[0].id}`, lang)
    expect(screen.getByRole('link', { name: ui[lang].backToNews }).getAttribute('href')).toBe('/news')
  })

  it('shows the 404 page for an unknown id', () => {
    renderAt('/news/news-999', lang)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(site.notFound.title)
  })
})

describe('From the News and events list to the detail page (BUG-18)', () => {
  it('the card link of every item opens its detail page', () => {
    renderAt('/news', 'en')
    for (const item of getData('en', 'news').items) {
      const link = screen.getByRole('link', { name: `${ui.en.readMore}: ${item.title}` })
      expect(link.getAttribute('href')).toBe(`/news/${item.id}`)
    }
  })
})
