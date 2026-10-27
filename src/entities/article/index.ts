import { BLOG } from './content/blog'
import { MANAGE } from './content/manage'
import { START } from './content/start'
import type { Article, Collection } from './types'

export { articlePath, COLLECTION_BASE, COLLECTION_TITLE } from './paths'
export { blocksFromText, headingId, headingsOf } from './headings'
export type { Article, Block, Collection, Heading } from './types'

const ALL: Article[] = [...START, ...MANAGE, ...BLOG]

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
