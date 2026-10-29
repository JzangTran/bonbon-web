import { CONTENT } from './content'
import { COMPONENTS } from './components/registry'
import { TABS, componentPath, pagePath, type TabKey } from './site'

export type SearchEntry = {
  tab: TabKey
  title: string
  /** where it sits: "Design › Color" */
  trail: string
  path: string
  /** a heading inside a page, not the page itself */
  heading: boolean
  /** lower-case text without diacritics, for matching */
  haystack: string
  /** the same for the title alone, which ranks higher */
  titleKey: string
}

/** Lower case without Vietnamese marks, so "mau" finds "Màu" and "đơn" finds "don". */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase()

function build(): SearchEntry[] {
  const out: SearchEntry[] = []
  for (const tab of TABS) {
    for (const section of tab.sections) {
      if (section.key === 'components') {
        for (const c of COMPONENTS) {
          const trail = `${tab.title} › Components`
          out.push({ tab: tab.key, title: c.name, trail, path: componentPath(c.slug), heading: false, haystack: fold(`${c.name} ${c.summary}`), titleKey: fold(c.name) })
        }
        continue
      }
      for (const page of section.pages) {
        const doc = CONTENT[tab.key][section.key]?.[page.slug]
        if (!doc) continue
        const path = pagePath(tab.key, section.key, page.slug)
        const trail = `${tab.title} › ${section.title}`
        out.push({ tab: tab.key, title: doc.title, trail, path, heading: false, haystack: fold(`${doc.title} ${doc.summary} ${section.title}`), titleKey: fold(doc.title) })
        for (const s of doc.sections) {
          out.push({ tab: tab.key, title: s.title, trail: `${trail} › ${doc.title}`, path: `${path}#${s.id}`, heading: true, haystack: fold(`${s.title} ${doc.title}`), titleKey: fold(s.title) })
        }
      }
    }
  }
  return out
}

let index: SearchEntry[] | null = null

/** The best matches for a query: every word must appear; titles first, pages before headings. */
export function searchResources(query: string, scope: TabKey | 'all', limit = 8): SearchEntry[] {
  index ??= build()
  const words = fold(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  return index
    .filter((e) => (scope === 'all' || e.tab === scope) && words.every((w) => e.haystack.includes(w)))
    .map((e) => ({ e, score: (words.every((w) => e.titleKey.includes(w)) ? 0 : 2) + (e.titleKey.startsWith(words[0]) ? 0 : 1) + (e.heading ? 1 : 0) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.e)
}

/** What the box offers before anything is typed. */
export function suggestedResources(scope: TabKey | 'all'): SearchEntry[] {
  index ??= build()
  const wanted = ["What's new", 'Color', 'Button', 'Overview', 'Errors']
  return index.filter((e) => !e.heading && wanted.includes(e.title) && (scope === 'all' || e.tab === scope))
}
