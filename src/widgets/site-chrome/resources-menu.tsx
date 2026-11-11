import { ArrowRightIcon, ChevronDownIcon, StoreIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { articlePath, type Article } from '@/entities/article'
import { siteUrl } from '@/shared/config/sites'
import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { OrangeRibbon } from '@/shared/ui/orange-ribbon'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import type { ResourceColumn, ResourceLink } from './resources'
import { t } from '@/shared/i18n'

type RenderLink = (link: ResourceLink, className: string, onClick: () => void) => ReactNode

/** The trigger of a menu in the public bar: the same small grey text and slightly rounded hover ground as the plain links. */
export const barItemClass =
  'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-ui font-medium text-muted-foreground outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-grey-100 data-[state=open]:text-ink'

/**
 * Every menu of the public bar opens the same panel, after the gitbook.com menus: columns under small orange upper-case labels
 * split by faint lines, an article as a card on the right, and an orange band at the bottom inviting shops to open.
 */
export function MegaMenu({ label, current, columns, feature, renderLink }: {
  label: string
  current: boolean
  columns: ResourceColumn[]
  /** the article shown as a card, with the line above its title (a date, or what it is) */
  feature?: { article: Article; kicker?: string; action: string }
  renderLink: RenderLink
}) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const link = '-mx-2 block rounded-md px-2 py-1.5 text-ui text-muted-foreground outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(barItemClass, current && 'text-primary')}>
        {label}
        <ChevronDownIcon className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="center" sideOffset={10} className="w-[min(56rem,calc(100vw-2rem))] min-w-0 rounded-xl border border-grey-200 p-6">
        <div className={cn('grid gap-6', feature && 'lg:grid-cols-[minmax(0,1fr)_16rem]')}>
          <nav aria-label={label} className={cn('grid gap-6 sm:gap-0', columns.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
            {columns.map((col, i) => (
              <div key={col.label} className={cn('flex flex-col gap-1', i > 0 && 'sm:border-l sm:border-grey-200 sm:pl-6', i < columns.length - 1 && 'sm:pr-6')}>
                <p className="mb-2 font-mono text-caption font-medium tracking-wide text-primary uppercase">{col.label}</p>
                {col.links.map((l) => (
                  <div key={l.label}>{renderLink(l, link, close)}</div>
                ))}
              </div>
            ))}
          </nav>
          {feature ? (
            <div className="flex flex-col gap-3 rounded-lg border border-grey-200 bg-beige-50 p-3">
              <img src={feature.article.image} alt={feature.article.imageAlt} className="aspect-[16/9] w-full rounded-md bg-image-slot object-cover" />
              <p className="px-1 text-small text-primary">{feature.kicker ?? formatDate(feature.article.updated)}</p>
              <p className="line-clamp-3 px-1 text-ui text-ink">{feature.article.title}</p>
              {renderLink(
                { label: feature.action, to: articlePath(feature.article.collection, feature.article.slug) },
                'mt-auto flex h-9 items-center justify-center gap-2 rounded-full bg-button text-ui font-medium text-button-foreground outline-none hover:bg-button-hover focus-visible:ring-2 focus-visible:ring-ring',
                close,
              )}
            </div>
          ) : null}
        </div>
        <a
          href={siteUrl('merchant', '/register')}
          onClick={close}
          className="group relative mt-6 flex items-center justify-between gap-4 overflow-hidden rounded-lg bg-primary px-5 py-4 text-white outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <OrangeRibbon variant="sweep" className="pointer-events-none absolute -top-32 right-0 w-80 opacity-40 mix-blend-screen" />
          <span className="relative flex items-center gap-3">
            <StoreIcon className="size-7 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            <span className="flex flex-col">
              <span className="text-body font-medium">{t('Mở quán trên bonbon')}</span>
              <span className="text-small text-white/85">{t('Bán cho cư dân trong toà và trong khu, hoa hồng thấp, tự giao.')}</span>
            </span>
          </span>
          <span className="relative hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-ui font-medium text-ink sm:inline-flex">
            {t('Bắt đầu')}
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </a>
      </PopoverContent>
    </Popover>
  )
}
