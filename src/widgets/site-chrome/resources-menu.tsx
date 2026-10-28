import { ArrowRightIcon, ChevronDownIcon, StoreIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { articlePath, articlesOf } from '@/entities/article'
import { siteUrl } from '@/shared/config/sites'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { OrangeRings } from '@/shared/ui/orange-rings'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { RESOURCE_COLUMNS, type ResourceLink } from './resources'

/**
 * "Tài nguyên" in the public bar, after the gitbook.com menus: columns under small orange upper-case labels split by faint lines,
 * the newest blog post as a card on the right, and an orange band at the bottom inviting shops to open.
 */
export function ResourcesMenu({ current, renderLink }: { current: boolean; renderLink: (link: ResourceLink, className: string, onClick: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const latest = [...articlesOf('blog')].sort((a, b) => b.updated.localeCompare(a.updated))[0]
  const link = 'block rounded-md py-1.5 text-ui text-muted-foreground outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[0.9375rem] font-medium text-ink outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted',
          current && 'text-primary hover:bg-transparent',
        )}
      >
        Tài nguyên
        <ChevronDownIcon className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={10} className="w-[min(58rem,calc(100vw-2rem))] min-w-0 rounded-2xl border border-grey-200 p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <nav aria-label="Tài nguyên" className="grid gap-6 sm:grid-cols-3 sm:gap-0">
            {RESOURCE_COLUMNS.map((col, i) => (
              <div key={col.label} className={cn('flex flex-col gap-2', i > 0 && 'sm:border-l sm:border-grey-200 sm:pl-6', i < RESOURCE_COLUMNS.length - 1 && 'sm:pr-6')}>
                <p className="mb-1 font-mono text-caption font-medium tracking-wide text-primary uppercase">{col.label}</p>
                {col.links.map((l) => (
                  <div key={l.label}>{renderLink(l, link, close)}</div>
                ))}
              </div>
            ))}
          </nav>
          {latest ? (
            <div className="flex flex-col gap-3 rounded-xl border border-grey-200 bg-beige-50 p-3">
              <img src={latest.image} alt={latest.imageAlt} className="aspect-[16/9] w-full rounded-lg bg-image-slot object-cover" />
              <p className="px-1 text-small text-primary">{formatDate(latest.updated)}</p>
              <p className="line-clamp-3 px-1 text-ui text-ink">{latest.title}</p>
              {renderLink(
                { label: 'Đọc bài', to: articlePath('blog', latest.slug) },
                'mt-auto flex h-10 items-center justify-center gap-2 rounded-full bg-button text-ui font-medium text-button-foreground outline-none hover:bg-button-hover focus-visible:ring-2 focus-visible:ring-ring',
                close,
              )}
            </div>
          ) : null}
        </div>
        <a
          href={siteUrl('merchant', '/register')}
          onClick={close}
          className="group relative mt-6 flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-primary px-5 py-4 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <OrangeRings className="pointer-events-none absolute -top-40 right-24 w-96 opacity-40 mix-blend-screen" />
          <span className="relative flex items-center gap-3">
            <StoreIcon className="size-7 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-body font-medium">Mở quán trên bonbon</span>
              <span className="text-small text-white/85">Bán cho cư dân trong toà và trong khu, hoa hồng thấp, tự giao.</span>
            </span>
          </span>
          <span className="relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-ui font-medium text-ink sm:inline-flex">
            Bắt đầu
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </a>
      </PopoverContent>
    </Popover>
  )
}
