import { describe, expect, it } from 'vitest'
import { matchPath } from 'react-router'
import { FILE_NAMES, LANGS } from './data'

/**
 * Internal link audit: every link written in src/data/<lang>/*.json and every
 * link the app builds from data (`/projects/:id`, `/news/:id`) must reach a
 * real route, and every #anchor must exist in the data of the target page.
 * Reads the raw JSON (no English fallback) so Italian-only mistakes show up.
 */

type Rec = Record<string, unknown>
const raw = import.meta.glob<unknown>('../data/*/*.json', { eager: true, import: 'default' })
const file = (lang: string, name: string) => raw[`../data/${lang}/${name}.json`] as Rec

// Routes are read from App.tsx so this test cannot drift from the router.
const appSource = Object.values(
  import.meta.glob('../App.tsx', { query: '?raw', import: 'default', eager: true }),
)[0] as string
const ROUTES = [...appSource.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((p) => p !== '*')

/** Every value under a key named `link` (or `profilelink`), with its place in the file. */
function collectLinks(value: unknown, path: string): { path: string; link: string }[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => collectLinks(v, `${path}[${i}]`))
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) =>
    ['link', 'profilelink'].includes(key) && typeof child === 'string'
      ? [{ path: `${path}.${key}`, link: child }]
      : collectLinks(child, `${path}.${key}`),
  )
}

/** Anchors a page defines in its data: `anchor` fields and `id` fields of its sections. */
function collectAnchors(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectAnchors)
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) =>
    key === 'anchor' && typeof child === 'string' ? [child] : collectAnchors(child),
  )
}

const isInternal = (link: string) => link.startsWith('/') && !/\.\w{2,4}$/.test(link.split('#')[0])
const routeExists = (pathname: string) => ROUTES.some((r) => matchPath({ path: r, end: true }, pathname))
const idsOf = (lang: string, name: string) => ((file(lang, name).items as Rec[]) ?? []).map((i) => i.id)

const PAGE_DATA: Record<string, string> = { '/about': 'about', '/networking': 'networking', '/contact': 'contact' }

describe('internal links: setup', () => {
  it('reads the routes of App.tsx', () => {
    expect(ROUTES).toEqual(expect.arrayContaining(['/', '/people', '/projects', '/projects/:id']))
  })
  it('finds the links it should check', () => {
    const count = FILE_NAMES.flatMap((n) => collectLinks(file('en', n), n)).filter((l) => isInternal(l.link)).length
    expect(count).toBeGreaterThan(20)
  })
})

describe.each(LANGS)('internal links (%s)', (lang) => {
  const links = FILE_NAMES.flatMap((n) => collectLinks(file(lang, n), n)).filter((l) => isInternal(l.link))

  it('every internal link points to an existing route', () => {
    const broken = links.filter((l) => !routeExists(l.link.split('#')[0] || '/')).map((l) => `${l.path} -> ${l.link}`)
    expect(broken).toEqual([])
  })

  it('every #anchor on a page exists in that page data', () => {
    const broken = links
      .filter((l) => l.link.includes('#') && PAGE_DATA[l.link.split('#')[0]])
      .filter((l) => {
        const [page, anchor] = l.link.split('#')
        const defined = [...collectAnchors(file(lang, PAGE_DATA[page])), ...collectIds(file(lang, PAGE_DATA[page]))]
        return !defined.includes(anchor)
      })
      .map((l) => `${l.path} -> ${l.link}`)
    expect(broken).toEqual([])
  })

  it('same-page anchors ("#something") exist on their own page', () => {
    for (const name of FILE_NAMES) {
      const own = [...collectAnchors(file(lang, name)), ...collectIds(file(lang, name))]
      const broken = collectLinks(file(lang, name), name)
        .filter((l) => /^#.+/.test(l.link))
        .filter((l) => !own.includes(l.link.slice(1)))
        .map((l) => `${l.path} -> ${l.link}`)
      expect(broken, `${lang}/${name}`).toEqual([])
    }
  })
})

/** Same-file ids that can be a link target (e.g. contact.json form id). */
function collectIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectIds)
  if (typeof value !== 'object' || value === null) return []
  return Object.entries(value).flatMap(([key, child]) =>
    key === 'id' && typeof child === 'string' ? [child] : collectIds(child),
  )
}

describe('anchors are the same in every language', () => {
  // An anchor is part of the URL, so it is not translated: /networking#partnerships must work in en and it.
  it.each(Object.values(PAGE_DATA))('%s: en and it use the same anchors', (name) => {
    expect(collectAnchors(file('it', name))).toEqual(collectAnchors(file('en', name)))
  })
})

describe.each(LANGS)('detail links built from data (%s)', (lang) => {
  it('every project and news id gives a /projects/:id and /news/:id link that matches a route', () => {
    for (const id of idsOf(lang, 'projects')) expect(routeExists(`/projects/${id}`), `/projects/${id}`).toBe(true)
    for (const id of idsOf(lang, 'news')) expect(routeExists(`/news/${id}`), `/news/${id}`).toBe(true)
  })

  it('every person listed on a project exists, and every project has at least one person', () => {
    const people = new Set(idsOf(lang, 'people'))
    for (const p of file(lang, 'projects').items as { id: string; people: string[] }[]) {
      expect(p.people.length, `${p.id} has no people`).toBeGreaterThan(0)
      expect(p.people.filter((id) => !people.has(id)), `${p.id}: unknown people`).toEqual([])
    }
  })

  it('every person is on at least one project or is a board/committee member (no orphans)', () => {
    const used = new Set((file(lang, 'projects').items as { people: string[] }[]).flatMap((p) => p.people))
    const orphans = (file(lang, 'people').items as { id: string; group: string }[])
      .filter((p) => p.group === 'members' && !used.has(p.id))
      .map((p) => p.id)
    expect(orphans).toEqual([])
  })
})

describe('placeholder links ("#") that still need a real target', () => {
  // Not failures today (the prototype uses "#" on purpose), but listed so they are not forgotten.
  it('reports how many project and person links are still "#"', () => {
    const open = LANGS.flatMap((lang) => [
      ...(file(lang, 'projects').items as Rec[]).filter((p) => p.link === '#').map((p) => `${lang}:${p.id}`),
      ...(file(lang, 'people').items as Rec[]).filter((p) => p.profilelink === '#').map((p) => `${lang}:${p.id}`),
    ])
    expect(open.length).toBeGreaterThanOrEqual(0)
    console.info(`Placeholder "#" links: ${open.length}`)
  })
})
