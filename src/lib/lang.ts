import { createContext, useContext } from 'react'
import { getData, type DataName, type Lang } from './data'
import type { DataFiles } from './types'
import { ui } from './ui'

export type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void }

export const LangContext = createContext<LangContextValue>({ lang: 'en', setLang: () => {} })

export const LANG_STORAGE_KEY = 'lang'

export function useLang() {
  return useContext(LangContext)
}

/** Data file in the current language. */
export function useData<F extends DataName>(name: F): DataFiles[F] {
  return getData(useLang().lang, name)
}

/** Interface strings that are not part of the content files. */
export function useUi() {
  return ui[useLang().lang]
}
