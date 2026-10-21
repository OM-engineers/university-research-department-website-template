import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LANG, isLang, type Lang } from './data'
import { LANG_STORAGE_KEY, LangContext } from './lang'

/** Saved language, or English when nothing valid is saved or the storage is blocked. */
function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY)
    if (isLang(stored)) return stored
  } catch {
    // Storage blocked (private mode, browser settings): keep the default.
  }
  return DEFAULT_LANG
}

/**
 * Holds the current language (IT | EN) for the whole app.
 * The choice is saved in the browser and set on <html lang>.
 */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next)
    } catch {
      // Not saved: the language still changes for this visit.
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
