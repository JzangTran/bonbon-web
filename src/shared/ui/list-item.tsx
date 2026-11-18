import { ChevronRightIcon } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * One row of a list: an optional leading picture or icon, a title, an optional description, and trailing content (a value, a badge,
 * a switch). With `onClick` or `href` the whole row is one target and shows a chevron; rows never hold two competing targets.
 */
export function ListItem({
  title,
  description,
  leading,
  trailing,
  onClick,
  href,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
}) {
  const interactive = !!onClick || !!href
  const body = (
    <>
      {leading ? <span className="flex shrink-0 items-center text-text-secondary [&_svg]:size-5">{leading}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
        <span className="truncate text-body text-text">{title}</span>
        {description ? <span className="text-body-sm text-text-secondary">{description}</span> : null}
      </span>
      {trailing ? <span className="flex shrink-0 items-center gap-2 text-body-sm text-text-secondary">{trailing}</span> : null}
      {interactive ? <ChevronRightIcon aria-hidden="true" className="size-5 shrink-0 text-text-tertiary" /> : null}
    </>
  )
  const base = cn('flex min-h-14 w-full items-center gap-3 px-4 py-3', className)
  if (href)
    return (
      <a data-slot="list-item" href={href} className={cn(base, 'transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring')}>
        {body}
      </a>
    )
  if (onClick)
    return (
      <button data-slot="list-item" type="button" onClick={onClick} className={cn(base, 'transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring')}>
        {body}
      </button>
    )
  return (
    <div data-slot="list-item" className={base}>
      {body}
    </div>
  )
}
