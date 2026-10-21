import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { Filter } from '../components/Filter'
import { getData, getNewsYears, LANGS } from './data'
import { LangContext } from './lang'
import { languageFilterOptions, matchesLanguage, matchesValue, matchesYear, yearOptions } from './filters'
import type { Lang, NewsLanguage, NewsType } from './types'

/**
 * T-117, part 1: the News filters Type, Year and Language (D-18), tested on the real
 * news.json and site.json of both languages. The News page is built in T-112; this file
 * tests the rules and the Filter K-06 with the real data, so the page can rely on them.
 * Expected ids are written by hand from news.json: if the data changes, the test says so.
 */

afterEach(cleanup)

/** The three filters of the News page, wired like the page will wire them. */
function NewsList({ lang }: { lang: Lang }) {
  const { filters } = getData(lang, 'site')
  const news = getData(lang, 'news')
  const [type, setType] = useState<NewsType | null>(null)
  const [year, setYear] = useState<string | null>(null)
  const [language, setLanguage] = useState<NewsLanguage | null>(null)

  const shown = news.items.filter(
    (n) => matchesValue(n.type, type) && matchesYear(n.date, year) && matchesLanguage(n.language, language),
  )

  return (
    <>
      <Filter variant="dropdown" label={filters.type.label} options={filters.type.options} value={type} onChange={setType} />
      <Filter
        variant="dropdown"
        label={filters.year.label}
        options={yearOptions(getNewsYears(lang))}
        value={year}
        onChange={setYear}
      />
      <Filter
        variant="dropdown"
        label={filters.language.label}
        options={languageFilterOptions(filters.language.options)}
        value={language}
        onChange={setLanguage}
      />
      {shown.length === 0 ? (
        <p>{news.emptyState}</p>
      ) : (
        <ul>
          {shown.map((n) => (
            <li key={n.id}>{n.id}</li>
          ))}
        </ul>
      )}
    </>
  )
}

describe.each(LANGS)('News filters on the real data (%s)', (lang) => {
  const site = getData(lang, 'site')
  const news = getData(lang, 'news')

  function renderNews() {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <NewsList lang={lang} />
      </LangContext.Provider>,
    )
  }
  const ids = () => screen.queryAllByRole('listitem').map((li) => li.textContent)
  const select = (name: string) => screen.getByRole<HTMLSelectElement>('combobox', { name })
  const choose = (name: string, value: string) => fireEvent.change(select(name), { target: { value } })
  const visibleOptions = (name: string) =>
    [...select(name).options].filter((o) => !o.hidden).map((o) => o.textContent)

  it('shows all six items when nothing is selected', () => {
    renderNews()
    expect(ids()).toEqual(['news-001', 'news-002', 'news-003', 'news-004', 'news-005', 'news-006'])
  })

  it('offers All plus the options of D-18, with the labels of this language', () => {
    renderNews()
    expect(visibleOptions(site.filters.type.label)).toEqual([site.filters.all, ...site.filters.type.options.map((o) => o.label)])
    expect(visibleOptions(site.filters.year.label)).toEqual([site.filters.all, '2027', '2026', '2025'])
    // "both" is only a card label (EN + IT): it is not an option of the Language filter.
    expect(visibleOptions(site.filters.language.label)).toEqual([
      site.filters.all,
      ...site.filters.language.options.filter((o) => o.value !== 'both').map((o) => o.label),
    ])
    expect(visibleOptions(site.filters.language.label)).toHaveLength(3)
  })

  it('filters by type', () => {
    renderNews()
    choose(site.filters.type.label, 'news')
    expect(ids()).toEqual(['news-001', 'news-003'])
    choose(site.filters.type.label, 'event')
    expect(ids()).toEqual(['news-002', 'news-004', 'news-005', 'news-006'])
  })

  it('filters by year, taken from the date', () => {
    renderNews()
    choose(site.filters.year.label, '2025')
    expect(ids()).toEqual(['news-001'])
    choose(site.filters.year.label, '2026')
    expect(ids()).toEqual(['news-002', 'news-003', 'news-004', 'news-005'])
    choose(site.filters.year.label, '2027')
    expect(ids()).toEqual(['news-006'])
  })

  it('filters by language: an item in both languages appears under English and under Italian', () => {
    renderNews()
    choose(site.filters.language.label, 'en')
    expect(ids()).toEqual(['news-001', 'news-002', 'news-004', 'news-006'])
    choose(site.filters.language.label, 'it')
    expect(ids()).toEqual(['news-002', 'news-003', 'news-004', 'news-005'])
  })

  it('combines the three filters (AND)', () => {
    renderNews()
    choose(site.filters.type.label, 'event')
    choose(site.filters.year.label, '2026')
    choose(site.filters.language.label, 'it')
    expect(ids()).toEqual(['news-002', 'news-004', 'news-005'])
  })

  it('shows the empty message of news.json when nothing matches, and recovers with All', () => {
    renderNews()
    choose(site.filters.type.label, 'news')
    choose(site.filters.year.label, '2027')
    expect(ids()).toEqual([])
    expect(screen.getByText(news.emptyState)).toBeTruthy()

    choose(site.filters.year.label, '')
    expect(ids()).toEqual(['news-001', 'news-003'])
    expect(screen.queryByText(news.emptyState)).toBeNull()
  })

  it('keeps the selection of each filter when another one changes', () => {
    renderNews()
    choose(site.filters.type.label, 'event')
    choose(site.filters.year.label, '2026')
    expect(select(site.filters.type.label).value).toBe('event')
    choose(site.filters.language.label, 'en')
    expect(select(site.filters.type.label).value).toBe('event')
    expect(select(site.filters.year.label).value).toBe('2026')
    expect(ids()).toEqual(['news-002', 'news-004'])
  })
})

describe('News filter rules on the real data', () => {
  it('the year options cover exactly the years of the items, newest first, in both languages', () => {
    for (const lang of LANGS) {
      const fromItems = [...new Set(getData(lang, 'news').items.map((n) => Number(n.date.slice(0, 4))))].sort((a, b) => b - a)
      expect(getNewsYears(lang)).toEqual(fromItems)
      expect(getNewsYears(lang)).toEqual([2027, 2026, 2025])
    }
  })

  it('every item matches at least one real option of each filter (no item is unreachable)', () => {
    for (const lang of LANGS) {
      const { filters } = getData(lang, 'site')
      const years = getNewsYears(lang).map(String)
      const languages = languageFilterOptions(filters.language.options).map((o) => o.value)
      for (const item of getData(lang, 'news').items) {
        expect(filters.type.options.some((o) => matchesValue(item.type, o.value))).toBe(true)
        expect(years.some((y) => matchesYear(item.date, y))).toBe(true)
        expect(languages.some((l) => matchesLanguage(item.language, l))).toBe(true)
      }
    }
  })

  it('the filter results are the same in English and in Italian (same ids, only the texts change)', () => {
    const run = (lang: Lang) =>
      getData(lang, 'news')
        .items.filter((n) => matchesValue(n.type, 'event') && matchesYear(n.date, '2026') && matchesLanguage(n.language, 'it'))
        .map((n) => n.id)
    expect(run('it')).toEqual(run('en'))
  })

  it('does not treat a year as a number: a year that is not in the data matches nothing', () => {
    const items = getData('en', 'news').items
    expect(items.filter((n) => matchesYear(n.date, '2024'))).toEqual([])
    expect(items.filter((n) => matchesYear(n.date, '20260'))).toEqual([])
  })
})
