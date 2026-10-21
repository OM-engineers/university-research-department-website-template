import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { HomePage } from './Home'
import { LangContext } from '../lib/lang'
import { getData, getNewestNews, LANGS } from '../lib/data'

afterEach(cleanup)

describe.each(LANGS)('Home (%s)', (lang) => {
  const home = getData(lang, 'home')

  function renderHome() {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </LangContext.Provider>,
    )
    return within(screen.getByRole('main'))
  }

  const href = (el: HTMLElement) => el.getAttribute('href')

  it('has one H1, the hero title', () => {
    const view = renderHome()
    const h1 = view.getAllByRole('heading', { level: 1 })
    expect(h1).toHaveLength(1)
    expect(h1[0].textContent).toBe(home.hero.title)
  })

  it('links the hero CTAs', () => {
    const view = renderHome()
    for (const cta of home.hero.ctas) {
      expect(href(view.getByRole('link', { name: cta.label }))).toBe(cta.link)
    }
  })

  it('shows the four feature cards with their links', () => {
    const view = renderHome()
    for (const feature of home.features) {
      expect(href(view.getByRole('link', { name: feature.title }))).toBe(feature.link)
    }
  })

  it('links the mission to About us and the latest block to all news', () => {
    const view = renderHome()
    expect(href(view.getByRole('link', { name: home.mission.readMore.label }))).toBe(
      home.mission.readMore.link,
    )
    expect(href(view.getByRole('link', { name: home.latest.seeAll.label }))).toBe(
      home.latest.seeAll.link,
    )
  })

  it('shows the newest news and events, each linked to its detail page', () => {
    const view = renderHome()
    const newest = getNewestNews(lang, home.latest.count)
    expect(newest).toHaveLength(3)
    for (const item of newest) {
      expect(view.getByRole('heading', { level: 3, name: item.title })).toBeTruthy()
      expect(view.getByRole('img', { name: item.title })).toBeTruthy()
      expect(href(view.getByRole('link', { name: new RegExp(`: ${item.title}$`) }))).toBe(
        `/news/${item.id}`,
      )
    }
  })
})
