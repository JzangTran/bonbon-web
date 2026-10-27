import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { headingsOf, type Block, type Heading } from '@/entities/article'
import { cn } from '@/shared/lib/utils'
import { SiteFooter, SiteHeader } from '@/widgets/site-chrome'
import { Breadcrumb, TagList } from './parts'

/** Bold text written as **like this**. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => (part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part))}
    </>
  )
}

/** The text and pictures of an article; headings get the ids the "Trong bài này" list jumps to. */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  const headings = headingsOf(blocks)
  let h = 0
  return (
    <div className="flex flex-col gap-4 text-[1.0625rem] leading-8 text-ink">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h2':
            return (
              <h2 key={i} id={headings[h++].id} className="mt-6 scroll-mt-6 text-[1.5rem] leading-9 font-bold tracking-[-0.01em]">
                {b.text}
              </h2>
            )
          case 'h3':
            return (
              <h3 key={i} id={headings[h++].id} className="mt-2 scroll-mt-6 text-[1.1875rem] leading-8 font-bold">
                {b.text}
              </h3>
            )
          case 'p':
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            )
          case 'ul':
            return (
              <ul key={i} className="flex list-disc flex-col gap-2 pl-6 marker:text-primary">
                {b.items.map((item) => (
                  <li key={item}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="flex list-decimal flex-col gap-2 pl-6 marker:font-semibold marker:text-primary">
                {b.items.map((item) => (
                  <li key={item}>
                    <Inline text={item} />
                  </li>
                ))}
              </ol>
            )
          case 'img':
            return (
              <figure key={i} className="my-2 flex flex-col gap-2">
                <img src={b.src} alt={b.alt} loading="lazy" decoding="async" className="w-full rounded-lg bg-image-slot object-cover" />
                {b.caption ? <figcaption className="text-sm leading-6 text-muted-foreground">{b.caption}</figcaption> : null}
              </figure>
            )
          case 'note':
            return (
              <p key={i} role="note" className="rounded-lg bg-brand-50 px-4 py-3 text-base leading-7 text-brand-900">
                <Inline text={b.text} />
              </p>
            )
        }
      })}
    </div>
  )
}

/** The heading nearest the top of the screen, to mark it in the list. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | undefined>(ids[0])
  const key = ids.join(',')
  useEffect(() => {
    if (ids.length === 0) return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = ids.find((id) => visible.has(id))
        if (first) setActive(first)
      },
      { rootMargin: '-10% 0px -70% 0px' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

/** "Trong bài này": jumps to the headings of the article. A fold-out above the text on narrow screens, a sticky list beside it on wide ones. */
export function Toc({ headings }: { headings: Heading[] }) {
  const active = useActiveHeading(headings.map((h) => h.id))
  if (headings.length === 0) return null
  const list = (
    <ul className="flex flex-col gap-0.5 text-[0.9375rem]">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            aria-current={active === h.id ? 'location' : undefined}
            className={cn(
              'block rounded-sm py-1.5 pr-2 leading-5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
              h.level === 3 ? 'pl-6' : 'pl-3',
              active === h.id && 'bg-brand-50 font-semibold text-brand-800',
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  )
  return (
    <>
      <details className="rounded-lg bg-card lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-[0.9375rem] font-semibold marker:hidden">Trong bài này</summary>
        <nav aria-label="Trong bài này" className="px-2 pb-3">
          {list}
        </nav>
      </details>
      <nav aria-label="Trong bài này" className="sticky top-6 hidden max-h-[calc(100svh-3rem)] overflow-y-auto lg:block">
        <p className="mb-2 pl-3 text-sm font-semibold text-foreground">Trong bài này</p>
        {list}
      </nav>
    </>
  )
}

/**
 * The menu of a documentation section, as on gitbook.com: small upper-case group names and the pages under them; the current page
 * is marked in the accent colour. Sticky beside the text on wide screens.
 */
export function DocsSidebar({ groups, current }: { groups: { title: string; items: { label: string; to: string }[] }[]; current: string }) {
  return (
    <nav aria-label="Mục lục hướng dẫn" className="sticky top-24 flex max-h-[calc(100svh-7rem)] flex-col gap-6 overflow-y-auto pr-2">
      {groups.map((g) => (
        <div key={g.title} className="flex flex-col gap-0.5">
          <p className="mb-1 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{g.title}</p>
          {g.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={item.to === current ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-1.5 text-[0.9375rem] leading-5 text-foreground/80 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                item.to === current && 'bg-brand-50 font-semibold text-brand-800 hover:bg-brand-50',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}

/** Header, page container and footer shared by the content pages. */
export function ContentPage({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-ink">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}

/**
 * A content page in one format: breadcrumb, title, text and pictures on the left (the larger part), the list of headings on the
 * right, optional cards to what comes next, and the page's tags at the very end.
 */
export function ArticleView({
  trail,
  title,
  meta,
  blocks,
  tags,
  after,
  sidebar,
}: {
  trail: { name: string; path: string }[]
  title: string
  meta?: string
  blocks: Block[]
  tags: string[]
  /** Cards to the next steps, shown after the text. */
  after?: ReactNode
  /** The menu of the section on the left (documentation layout); the page has two columns without it. */
  sidebar?: ReactNode
}) {
  const headings = headingsOf(blocks)
  return (
    <ContentPage>
      <main
        id="main"
        className={cn('mx-auto grid w-full gap-x-12 px-4 pt-8 pb-16 sm:px-6 lg:pt-10', sidebar ? 'max-w-[1360px] xl:grid-cols-[15rem_minmax(0,1fr)]' : 'max-w-[1200px]')}
      >
        {sidebar ? <aside className="hidden xl:block">{sidebar}</aside> : null}
        <div className="min-w-0">
        <Breadcrumb trail={trail} />
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
          <article className="min-w-0 max-w-3xl">
            <h1 className="text-[2rem] leading-[2.5rem] font-bold tracking-[-0.025em] sm:text-[2.5rem] sm:leading-[3rem]">{title}</h1>
            {meta ? <p className="mt-3 text-sm text-muted-foreground">{meta}</p> : null}
            <div className="mt-8">
              <ArticleBody blocks={blocks} />
            </div>
            {after}
            {tags.length > 0 ? (
              <footer className="mt-12 border-t pt-6">
                <TagList tags={tags} />
              </footer>
            ) : null}
          </article>
          <aside className="order-first lg:order-last">
            <Toc headings={headings} />
          </aside>
        </div>
        </div>
      </main>
    </ContentPage>
  )
}
