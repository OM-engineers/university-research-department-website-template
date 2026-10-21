import type { Lang } from './data'
import type { NewsLanguage } from './types'

/** Label of the language of a news item, e.g. "EN + IT". */
export const LANGUAGE_LABEL: Record<NewsLanguage, string> = { en: 'EN', it: 'IT', both: 'EN + IT' }

/** Formats an ISO date (YYYY-MM-DD) for display, e.g. "15 December 2025" or, short, "15 Dec 2025". */
export function formatDate(iso: string, lang: Lang, month: 'long' | 'short' = 'long') {
  return new Intl.DateTimeFormat(lang === 'it' ? 'it-IT' : 'en-GB', {
    day: 'numeric',
    month,
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

/** Label for a filter value, falling back to the raw value. */
export function optionLabel(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value
}

/** True for links the router should not handle (external, files, placeholders). */
export function isExternal(link: string) {
  return /^(https?:|mailto:|tel:)/.test(link) || link === '#' || /\.\w{2,4}$/.test(link)
}

/** File size for a download label, e.g. "609 B", "120 KB", "1.5 MB" (decimal comma in Italian). */
export function formatFileSize(bytes: number, lang: Lang) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  const mb = new Intl.NumberFormat(lang === 'it' ? 'it-IT' : 'en-GB', { maximumFractionDigits: 1 }).format(
    bytes / (1024 * 1024),
  )
  return `${mb} MB`
}
