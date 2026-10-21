import type { FilterOption, IsoDate, NewsLanguage } from './types'

/**
 * Matching rules of the Filter K-06, with the fixed lists of D-18.
 * `selected` is the value of the Filter: null = All.
 */

/** Status, type and theme: the item has the selected value. */
export function matchesValue<V extends string>(itemValue: V, selected: V | null) {
  return selected === null || itemValue === selected
}

/** Language: an item in both languages appears under English and under Italian. */
export function matchesLanguage(itemLang: NewsLanguage, selected: NewsLanguage | null) {
  return selected === null || itemLang === selected || itemLang === 'both'
}

/** Year: taken from the date (YYYY-MM-DD). */
export function matchesYear(date: IsoDate, selected: string | null) {
  return selected === null || date.slice(0, 4) === selected
}

/** The language filter is All, English, Italian: "both" is only a card label (EN + IT), not an option. */
export function languageFilterOptions(options: FilterOption<NewsLanguage>[]) {
  return options.filter((o) => o.value !== 'both')
}

/** Year options from a list of years (see getNewsYears), in the same order. */
export function yearOptions(years: number[]): FilterOption[] {
  return years.map((year) => ({ value: String(year), label: String(year) }))
}
