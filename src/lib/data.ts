import { prefixAssets } from './base'
import type { DataFiles, FileName, Lang, NewsItem, Project } from './types'

// Names used by the rest of the app (HeaderNav, format.ts, lang.ts, ui.ts).
export type { Lang }
export type DataName = FileName

export const LANGS = ['en', 'it'] as const satisfies readonly Lang[]
export const DEFAULT_LANG: Lang = 'en'

export const FILE_NAMES = [
  'site',
  'home',
  'about',
  'people',
  'networking',
  'projects',
  'news',
  'contact',
] as const satisfies readonly FileName[]

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

// All JSON files are bundled at build time (eager), so there are no network requests.
const modules = import.meta.glob<unknown>('../data/*/*.json', {
  eager: true,
  import: 'default',
})

function load(lang: Lang, file: FileName): unknown {
  return modules[`../data/${lang}/${file}.json`]
}

// ---------- English fallback ----------

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function idOf(value: unknown): string | undefined {
  return isRecord(value) && typeof value.id === 'string' ? value.id : undefined
}

/**
 * Returns `primary` where it has a value and `fallback` where it has none
 * (undefined, null or an empty string). 0 and false are valid values.
 *
 * The structure of `fallback` (English) decides what exists: lists follow the
 * English order and length. List items with an `id` are matched by id, the
 * others by position. Items that exist only in `primary` are ignored.
 */
export function mergeWithFallback<T>(primary: unknown, fallback: T): T {
  return merge(primary, fallback) as T
}

function merge(primary: unknown, fallback: unknown): unknown {
  if (isMissing(primary)) return fallback

  if (Array.isArray(fallback)) {
    if (!Array.isArray(primary)) return fallback
    return fallback.map((item, index) => {
      const id = idOf(item)
      const own = id !== undefined ? primary.find((p) => idOf(p) === id) : primary[index]
      return merge(own, item)
    })
  }

  if (isRecord(fallback)) {
    if (!isRecord(primary)) return fallback
    const result: Record<string, unknown> = {}
    for (const key of new Set([...Object.keys(fallback), ...Object.keys(primary)])) {
      const value = merge(primary[key], fallback[key])
      if (value !== undefined) result[key] = value
    }
    return result
  }

  return primary
}

// ---------- Loader ----------

const cache = new Map<string, unknown>()

/**
 * Data of one file in one language. Missing Italian texts (or a missing
 * Italian file) are replaced by the English ones.
 */
export function getData<F extends FileName>(lang: Lang, file: F): DataFiles[F] {
  const key = `${lang}/${file}`
  const cached = cache.get(key)
  if (cached !== undefined) return cached as DataFiles[F]

  const english = load(DEFAULT_LANG, file)
  if (english === undefined) {
    throw new Error(`Missing data file: src/data/${DEFAULT_LANG}/${file}.json`)
  }

  let result: unknown = english
  if (lang !== DEFAULT_LANG) {
    const own = load(lang, file)
    if (own === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`Missing src/data/${lang}/${file}.json: showing English.`)
      }
    } else {
      result = merge(own, english)
    }
  }

  result = prefixAssets(result)
  cache.set(key, result)
  return result as DataFiles[F]
}

/** All files of one language. */
export function getAllData(lang: Lang): DataFiles {
  return Object.fromEntries(FILE_NAMES.map((file) => [file, getData(lang, file)])) as unknown as DataFiles
}

// ---------- Helpers ----------

/** The newest news and events, newest first (for the Home page and the News dropdown). */
export function getNewestNews(lang: Lang, limit: number): NewsItem[] {
  return [...getData(lang, 'news').items]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, limit)
}

/** The newest projects, newest year first (for the Projects dropdown). */
export function getNewestProjects(lang: Lang, limit: number): Project[] {
  return [...getData(lang, 'projects').items]
    .sort((a, b) => b.year - a.year || b.id.localeCompare(a.id))
    .slice(0, limit)
}

/** Years for the year filter of News & Events, built from the dates, newest first. */
export function getNewsYears(lang: Lang): number[] {
  const years = new Set(getData(lang, 'news').items.map((item) => Number(item.date.slice(0, 4))))
  return [...years].sort((a, b) => b - a)
}
