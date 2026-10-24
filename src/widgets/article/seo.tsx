import type { Site } from '@/shared/config/sites'
import { absoluteUrl } from './url'

/**
 * Title, description, canonical address, share tags and structured data of a content page (React 19 moves these into the
 * document head). `trail` is the breadcrumb as names and paths; `article` adds the Article structured data.
 */
export function PageSeo({
  title,
  description,
  path,
  image,
  trail,
  article,
  site = 'public',
}: {
  title: string
  description: string
  path: string
  image?: string
  trail?: { name: string; path: string; site?: Site }[]
  article?: { updated: string; tags: string[] }
  /** The site the page belongs to, for its canonical address. */
  site?: Site
}) {
  const fullTitle = `${title} | bonbon`
  const graph: Record<string, unknown>[] = []
  if (trail && trail.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: absoluteUrl(t.path, t.site ?? site) })),
    })
  }
  if (article) {
    graph.push({
      '@type': 'Article',
      headline: title,
      description,
      dateModified: article.updated,
      keywords: article.tags.join(', '),
      inLanguage: 'vi',
      ...(image ? { image: absoluteUrl(image) } : {}),
      mainEntityOfPage: absoluteUrl(path, site),
      publisher: { '@type': 'Organization', name: 'bonbon' },
    })
  }
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={absoluteUrl(path, site)} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={absoluteUrl(path, site)} />
      {image ? <meta property="og:image" content={absoluteUrl(image)} /> : null}
      {graph.length > 0 ? <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script> : null}
    </>
  )
}
