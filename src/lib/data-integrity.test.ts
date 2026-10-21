import { describe, expect, it } from 'vitest'
import { FILE_NAMES, LANGS } from './data'

/**
 * Data integrity of src/data (en and it).
 * Reads the raw JSON files: getData() merges English into Italian, which would hide
 * exactly the differences these tests look for.
 */

// ---------- Fixed lists of values (D-18, 2026-10-09) ----------
// Wireframes, data files and tests must use the same words.
const STATUS = ['planned', 'active', 'completed', 'cancelled']
const NEWS_TYPE = ['news', 'event']
const NEWS_LANGUAGE = ['en', 'it', 'both']
const PERSON_GROUP = ['board', 'committee', 'members']

const raw = import.meta.glob<unknown>('../data/*/*.json', { eager: true, import: 'default' })
const file = (lang: string, name: string) => raw[`../data/${lang}/${name}.json`]

type Rec = Record<string, unknown>
const list = (lang: string, name: string) => (file(lang, name) as { items: Rec[] }).items

// ---------- Helpers ----------

/** Every `id` in the value with its place in the file, e.g. "nav[1].children[0].id = mission-vision". */
function collectIds(value: unknown, path: string): string[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => collectIds(item, `${path}[${i}]`))
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) =>
    key === 'id' && typeof child === 'string' ? [`${path}.id = ${child}`] : collectIds(child, `${path}.${key}`),
  )
}

/** Every array of objects that have an `id`, with its ids in order. */
function collectIdLists(value: unknown, path: string): { path: string; ids: string[] }[] {
  if (Array.isArray(value)) {
    const own = value.every((v) => typeof v === 'object' && v !== null && typeof (v as Rec).id === 'string')
      && value.length > 0
      ? [{ path, ids: value.map((v) => (v as Rec).id as string) }]
      : []
    return [...own, ...value.flatMap((item, i) => collectIdLists(item, `${path}[${i}]`))]
  }
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) => collectIdLists(child, `${path}.${key}`))
}

const duplicates = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i)

/** Values stored under the keys image, photo and logo (image paths), with their place in the file. */
function collectImages(value: unknown, path: string): { path: string; src: string }[] {
  if (Array.isArray(value)) return value.flatMap((item, i) => collectImages(item, `${path}[${i}]`))
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) =>
    ['image', 'photo', 'logo'].includes(key) && typeof child === 'string'
      ? [{ path: `${path}.${key}`, src: child }]
      : collectImages(child, `${path}.${key}`),
  )
}

// ---------- Tests ----------

describe('data integrity: ids', () => {
  it.each(FILE_NAMES)('%s has the same ids in en and it', (name) => {
    expect(collectIds(file('it', name), name)).toEqual(collectIds(file('en', name), name))
  })

  it.each(LANGS.flatMap((lang) => FILE_NAMES.map((name) => [lang, name] as const)))(
    '%s/%s has unique ids in every list',
    (lang, name) => {
      for (const { path, ids } of collectIdLists(file(lang, name), name)) {
        expect(duplicates(ids), `${lang}: duplicate ids in ${path}`).toEqual([])
      }
    },
  )

  it.each(LANGS)('%s: projects, people and news ids are unique across the site', (lang) => {
    const ids = ['projects', 'people', 'news'].flatMap((name) => list(lang, name).map((item) => item.id as string))
    expect(duplicates(ids)).toEqual([])
  })
})

describe('data integrity: fixed lists (D-18)', () => {
  it.each(LANGS)('%s: project status is one of the fixed values', (lang) => {
    for (const project of list(lang, 'projects')) {
      expect(STATUS, `${project.id}: status "${String(project.status)}"`).toContain(project.status)
    }
  })

  it.each(LANGS)('%s: news type and language are fixed values', (lang) => {
    for (const item of list(lang, 'news')) {
      expect(NEWS_TYPE, `${item.id}: type "${String(item.type)}"`).toContain(item.type)
      expect(NEWS_LANGUAGE, `${item.id}: language "${String(item.language)}"`).toContain(item.language)
    }
  })

  it.each(LANGS)('%s: people group is a fixed value', (lang) => {
    for (const person of list(lang, 'people')) {
      expect(PERSON_GROUP, `${person.id}: group "${String(person.group)}"`).toContain(person.group)
    }
  })

  it.each(LANGS)('%s: dates are YYYY-MM-DD and projects have a year', (lang) => {
    for (const item of list(lang, 'news')) expect(item.date, String(item.id)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    for (const project of list(lang, 'projects')) expect(Number.isInteger(project.year), String(project.id)).toBe(true)
  })

  it.each(LANGS)('%s: the filter lists of site.json use the fixed values', (lang) => {
    const { filters, groups } = file(lang, 'site') as {
      filters: Record<'status' | 'type' | 'language', { options: { value: string }[] }>
      groups: { value: string }[]
    }
    const values = (options: { value: string }[]) => options.map((o) => o.value)
    expect(values(filters.status.options)).toEqual(STATUS)
    expect(values(filters.type.options)).toEqual(NEWS_TYPE)
    expect(values(filters.language.options)).toEqual(NEWS_LANGUAGE)
    expect(values(groups)).toEqual(PERSON_GROUP)
  })
})

describe('data integrity: images', () => {
  // Non-eager: only the file names are needed, so the test needs no file system access.
  const publicFiles = new Set(Object.keys(import.meta.glob('/public/**/*', { query: '?url' })))

  it.each(LANGS.flatMap((lang) => FILE_NAMES.map((name) => [lang, name] as const)))(
    '%s/%s: every image exists in public/',
    (lang, name) => {
      for (const { path, src } of collectImages(file(lang, name), name)) {
        expect(src, `${lang}: ${path}`).toMatch(/^\/images\//)
        expect(publicFiles.has(`/public${src}`), `${lang}: ${path} -> public${src} not found`).toBe(true)
      }
    },
  )

  it('finds the images it should check', () => {
    // Guards against a test that passes because it checks nothing.
    const count = FILE_NAMES.flatMap((name) => collectImages(file('en', name), name)).length
    expect(count).toBeGreaterThan(20)
    expect(publicFiles.size).toBeGreaterThan(0)
  })
})

describe('data integrity: template texts (D-22)', () => {
  // Texts copied from a template and never replaced. Placeholder content must still read like
  // real content: realistic names and complete sentences (D-22, HANDOFF_NOTES 5).
  const TEMPLATE_TEXTS: [label: string, pattern: RegExp][] = [
    ['lorem ipsum', /lorem ipsum|dolor sit amet/i],
    ['"short description" (en)', /short description/i],
    ['"in two lines"', /in two lines|in due righe/i],
    ['"description placeholder" (en, it)', /description placeholder|descrizione segnaposto|breve descrizione segnaposto/i],
    ['"placeholder image" alt text (en, it)', /placeholder image|immagine segnaposto/i],
    ['"map placeholder" (en, it)', /map placeholder|segnaposto mappa/i],
    ['"text/title here" (en, it)', /\b(?:text|title|name|description) here\b|\b(?:testo|titolo|nome) qui\b/i],
    ['"Department name"', /^department name\b|^nome del dipartimento\b/i],
    ['TODO / TBD / XXX', /\b(?:todo|tbd|xxx)\b/i],
    ['"Name Surname" / bare "Item N"', /\bname surname\b|\bnome cognome\b|^(?:item|card|person|project|news) ?\d+$/i],
    ['zeroed address', /\b(?:street|via|viale|piazza)\b[^,]*\s0+(?:,|$)|\b0{5}\b/i],
    ['zeroed phone number', /\b0{3}\b.*\b0{4}\b/],
  ]

  /** Every string value in the file with its place, e.g. "site.footer.description". Keys are not checked. */
  function collectTexts(value: unknown, path: string): { path: string; text: string }[] {
    if (typeof value === 'string') return [{ path, text: value }]
    if (Array.isArray(value)) return value.flatMap((item, i) => collectTexts(item, `${path}[${i}]`))
    if (typeof value !== 'object' || value === null) return []
    return Object.entries(value).flatMap(([key, child]) => collectTexts(child, `${path}.${key}`))
  }

  it.each(LANGS.flatMap((lang) => FILE_NAMES.map((name) => [lang, name] as const)))(
    '%s/%s: no template text is left in the data',
    (lang, name) => {
      const found = collectTexts(file(lang, name), name).flatMap(({ path, text }) =>
        TEMPLATE_TEXTS.filter(([, pattern]) => pattern.test(text)).map(([label]) => `${path} = "${text}" (${label})`),
      )
      expect(found, `${lang}: template texts found`).toEqual([])
    },
  )

  it('recognises each kind of template text', () => {
    // Guards against a pattern that never matches anything.
    const samples = [
      'Lorem ipsum dolor sit amet',
      'Short description in two lines.',
      'Department name, short description placeholder.',
      'Placeholder image 16:9',
      'Immagine segnaposto 16:9',
      'Map placeholder',
      'Title here',
      'TODO',
      'Name Surname',
      'Street 00, 00000 City, Country',
      '+00 000 000 0000',
      'Via Roma 00, 00100 Roma, Italia',
      '+39 000 000 0000',
    ]
    for (const sample of samples) {
      expect(
        TEMPLATE_TEXTS.some(([, pattern]) => pattern.test(sample)),
        sample,
      ).toBe(true)
    }
    // Real placeholder content is allowed: the form fields keep their `placeholder` key and hint texts.
    for (const ok of ['Enter your full name', 'Write your message here...', 'name@example.com', 'Search the site', 'Via Roma 8, 00100 Roma, Italia', '+39 06 1234 5678']) {
      expect(
        TEMPLATE_TEXTS.some(([, pattern]) => pattern.test(ok)),
        ok,
      ).toBe(false)
    }
  })

  it('reads texts from every file', () => {
    const count = FILE_NAMES.flatMap((name) => collectTexts(file('en', name), name)).length
    expect(count).toBeGreaterThan(200)
  })
})
