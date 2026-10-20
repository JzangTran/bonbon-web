/** A piece of an article body. Headings (`h2`, `h3`) become the "Trong bài này" list on the right. */
export type Block =
  | { t: 'h2' | 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'img'; src: string; alt: string; caption?: string }
  | { t: 'note'; text: string }

export type Collection = 'bat-dau' | 'quan-ly-cua-hang' | 'blog'

export type Article = {
  collection: Collection
  slug: string
  title: string
  /** One or two sentences: the card text under the title is not used, this is the meta description. */
  description: string
  /** Card and share image (a path under /guides or /mock). */
  image: string
  imageAlt: string
  tags: string[]
  /** ISO date of the last change. */
  updated: string
  blocks: Block[]
  /** Next steps shown as cards after the body ("collection/slug"), at most two. */
  next?: string[]
}

export type Heading = { id: string; text: string; level: 2 | 3 }
