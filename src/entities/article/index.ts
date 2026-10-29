import { BLOG } from './content/blog'
import { MANAGE } from './content/manage'
import { EN_ARTICLES } from './content/en'
import { START } from './content/start'
import { locale } from '@/shared/i18n'
import type { Article, Collection } from './types'

export { articlePath, COLLECTION_BASE, COLLECTION_TITLE } from './paths'
export { LEGACY_SLUGS } from './legacy'
export { blocksFromText, headingId, headingsOf } from './headings'
export type { Article, Block, Collection, Heading } from './types'

// the guides and posts in the chosen language: English swaps the words, everything else stays the Vietnamese article's
const ALL: Article[] = [...START, ...MANAGE, ...BLOG].map((a) => (locale === 'en' && EN_ARTICLES[a.slug] ? { ...a, ...EN_ARTICLES[a.slug] } : a))

export const articlesOf = (collection: Collection): Article[] => ALL.filter((a) => a.collection === collection)

export const findArticle = (collection: Collection, slug: string | undefined): Article | undefined =>
  ALL.find((a) => a.collection === collection && a.slug === slug)

/** "collection/slug" references (the `next` of an article) turned into articles. */
export const resolveArticles = (refs: string[] | undefined): Article[] =>
  (refs ?? []).flatMap((ref) => {
    const [collection, slug] = ref.split('/') as [Collection, string]
    const found = findArticle(collection, slug)
    return found ? [found] : []
  })
