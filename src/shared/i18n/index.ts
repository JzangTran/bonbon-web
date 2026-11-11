// Vietnamese and English. The Vietnamese text in the code is the key; en.ts maps it to English.
// The choice is read once when the app loads (so text built at module load is translated too) and changing it reloads the page.
import { EN } from './en'

export type Locale = 'vi' | 'en'
export const LOCALES: readonly Locale[] = ['vi', 'en']
const STORAGE_KEY = 'bonbon.locale'

function detect(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'vi' || saved === 'en') return saved
  } catch {
    // storage blocked: fall back to the browser language
  }
  const langs = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])
  return langs.some((l) => l?.toLowerCase().startsWith('vi')) ? 'vi' : 'en'
}

export const locale: Locale = detect()
if (typeof document !== 'undefined') document.documentElement.lang = locale

/** The BCP 47 tag for Intl formatters: dates and numbers read the way the chosen language writes them. */
export const intlLocale = locale === 'vi' ? 'vi-VN' : 'en-GB'

export function setLocale(next: Locale) {
  if (next === locale) return
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // the choice lasts for this page only
  }
  window.location.reload()
}

/** Long-form text written in both languages side by side (the brand guidelines), where a dictionary entry per paragraph would drift. */
export function tx(vi: string, en: string): string {
  return locale === 'en' ? en : vi
}

/** Translates a Vietnamese source string; `{name}` placeholders take values from `vars`. */
export function t(vi: string, vars?: Record<string, unknown>): string {
  const text = locale === 'en' ? (EN[vi] ?? vi) : vi
  return vars ? text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : text
}
