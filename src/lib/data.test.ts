import { describe, expect, it } from 'vitest'
import { FILE_NAMES, LANGS, getAllData, getData, getNewestNews, getNewsYears, mergeWithFallback } from './data'

function kind(value: unknown): string {
  return value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
}

/** Paths where Italian differs from English in type, keys or list length. Values are not compared. */
function structureDiff(english: unknown, italian: unknown, path: string): string[] {
  if (kind(english) !== kind(italian)) return [`${path}: ${kind(english)} in en, ${kind(italian)} in it`]
  if (Array.isArray(english) && Array.isArray(italian)) {
    const length = english.length === italian.length ? [] : [`${path}: ${english.length} items in en, ${italian.length} in it`]
    return [...length, ...english.slice(0, italian.length).flatMap((item, i) => structureDiff(item, italian[i], `${path}[${i}]`))]
  }
  if (kind(english) === 'object') {
    const a = english as Record<string, unknown>
    const b = italian as Record<string, unknown>
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((key) =>
      !(key in a) ? [`${path}.${key}: only in it`]
      : !(key in b) ? [`${path}.${key}: only in en`]
      : structureDiff(a[key], b[key], `${path}.${key}`),
    )
  }
  return []
}

describe('data files', () => {
  it.each(LANGS)('every file exists in %s', (lang) => {
    for (const file of FILE_NAMES) {
      expect(getData(lang, file), `${lang}/${file}`).toBeDefined()
    }
  })

  // Compares the raw files: getData merges English in, which would hide every difference.
  it.each(FILE_NAMES)('it/%s has the same structure as en', (file) => {
    const raw = import.meta.glob<unknown>('../data/*/*.json', { eager: true, import: 'default' })
    expect(structureDiff(raw[`../data/en/${file}.json`], raw[`../data/it/${file}.json`], file)).toEqual([])
  })

  it.each(['projects', 'people', 'news'] as const)('%s have the same ids in en and it', (file) => {
    const ids = (lang: 'en' | 'it') => getData(lang, file).items.map((item) => item.id)
    expect(ids('it')).toEqual(ids('en'))
  })

  it('has the five menu entries of the sitemap', () => {
    const nav = getData('en', 'site').nav.map((n) => n.id)
    expect(nav).toEqual(['home', 'about', 'networking', 'projects', 'news'])
  })

  it('references are valid', () => {
    const all = getAllData('en')
    const people = new Set(all.people.items.map((p) => p.id))
    const themes = new Set(all.site.filters.theme.options.map((o) => o.value))
    const statuses = all.site.filters.status.options.map((o) => o.value)
    for (const project of all.projects.items) {
      expect(project.people.every((id) => people.has(id))).toBe(true)
      expect(themes.has(project.theme)).toBe(true)
      expect(statuses).toContain(project.status)
    }
    for (const person of all.people.items) expect(person.topics.every((t) => themes.has(t))).toBe(true)
  })

  it('has the fixed list sizes of the schema', () => {
    const { home, contact } = getAllData('en')
    expect(home.features).toHaveLength(4)
    expect(home.mission.sentences).toHaveLength(3)
    expect(contact.joinUs.steps).toHaveLength(3)
  })

  it('builds the news years and the newest news', () => {
    expect(getNewsYears('en')).toEqual([...getNewsYears('en')].sort((a, b) => b - a))
    const newest = getNewestNews('en', 3)
    expect(newest).toHaveLength(3)
    expect(newest[0].date >= newest[1].date).toBe(true)
  })
})

describe('English fallback', () => {
  const en = {
    title: 'Title',
    count: 0,
    items: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
    steps: ['One', 'Two'],
  }

  it('uses the Italian text when it exists', () => {
    expect(mergeWithFallback({ title: 'Titolo' }, en).title).toBe('Titolo')
  })

  it('uses English for missing and empty texts', () => {
    expect(mergeWithFallback({ title: '' }, en).title).toBe('Title')
    expect(mergeWithFallback({}, en).title).toBe('Title')
  })

  it('keeps 0 and false', () => {
    expect(mergeWithFallback({ count: 0 }, { count: 5 }).count).toBe(0)
    expect(mergeWithFallback({ on: false }, { on: true }).on).toBe(false)
  })

  it('merges list items by id and by position', () => {
    const result = mergeWithFallback(
      { items: [{ id: 'b', text: 'Bi' }, { id: 'a' }], steps: ['Uno'] },
      en,
    )
    expect(result.items).toEqual([
      { id: 'a', text: 'A' },
      { id: 'b', text: 'Bi' },
    ])
    expect(result.steps).toEqual(['Uno', 'Two'])
  })

  it('returns English for a missing file', () => {
    expect(mergeWithFallback(undefined, en)).toEqual(en)
  })
})
