import { ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { articlePath, type Article } from '@/entities/article'
import { cn } from '@/shared/lib/utils'

/** The trail above a page: Trang chủ / Hướng dẫn / … The last item is the page itself. */
export function Breadcrumb({ trail }: { trail: { name: string; path: string }[] }) {
  const away = (path: string) => /^https?:/.test(path)
  return (
    <nav aria-label="Đường dẫn" className="text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {trail.map((item, i) => {
          const last = i === trail.length - 1
          return (
            <li key={`${i}-${item.name}`} className="flex items-center gap-1.5">
              {i > 0 ? <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden="true" /> : null}
              {last ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.name}
                </span>
              ) : (
                (away(item.path) ? (
                  <a href={item.path} className="underline-offset-4 hover:text-foreground hover:underline">
                    {item.name}
                  </a>
                ) : (
                  <Link to={item.path} className="underline-offset-4 hover:text-foreground hover:underline">
                    {item.name}
                  </Link>
                ))
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Tags on one line (a card) or wrapping (the end of a page). */
export function TagList({ tags, oneLine, className }: { tags: string[]; oneLine?: boolean; className?: string }) {
  return (
    <ul aria-label="Thẻ" className={cn('flex gap-1.5', oneLine ? 'flex-nowrap overflow-hidden' : 'flex-wrap', className)}>
      {tags.map((tag) => (
        <li key={tag} className="shrink-0 rounded-full bg-grey-100 px-2.5 py-0.5 text-caption whitespace-nowrap text-grey-600">
          {tag}
        </li>
      ))}
    </ul>
  )
}

/** A card: the picture, the tags on one line, then the title. */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <li className="min-w-0">
      <Link
        to={articlePath(article.collection, article.slug)}
        className="group flex h-full flex-col gap-3 rounded-xl bg-card p-2.5 outline-none transition-colors hover:bg-grey-50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="aspect-[16/10] overflow-hidden rounded-lg bg-image-slot">
          <img
            src={article.image}
            alt={article.imageAlt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
        </div>
        <TagList tags={article.tags} oneLine />
        <h3 className="px-0.5 pb-1 text-[1.0625rem] leading-6 font-semibold text-ink">{article.title}</h3>
      </Link>
    </li>
  )
}

/** Cards three to a row on a wide screen; the first rows show, "Xem thêm" shows more. */
export function CardGrid({ articles, initial = 6, step = 6 }: { articles: Article[]; initial?: number; step?: number }) {
  const [shown, setShown] = useState(initial)
  const visible = articles.slice(0, shown)
  return (
    <div className="flex flex-col items-center gap-8">
      <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => (
          <ArticleCard key={`${a.collection}/${a.slug}`} article={a} />
        ))}
      </ul>
      {shown < articles.length ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + step)}
          className="min-h-11 rounded-sm bg-ink px-6 text-[0.9375rem] font-semibold text-white outline-none hover:bg-ink/90 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Xem thêm ({articles.length - shown})
        </button>
      ) : null}
    </div>
  )
}
