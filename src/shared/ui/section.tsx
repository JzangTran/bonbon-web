import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * The spacing rule of the consoles: things that belong together sit close (a group: 8–16 px), separate groups sit far apart
 * (a page: 48 px between sections). A page is a column of sections; a section is a heading, an optional line under it, and its
 * content; controls that act together are one action group.
 */
export function PageStack({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-12', className)}>{children}</div>
}

export function Section({ title, description, actions, className, children }: {
  title?: ReactNode
  description?: ReactNode
  /** controls for the whole section, on the right of its heading */
  actions?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cn('flex flex-col gap-4', className)}>
      {title || description || actions ? (
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="flex max-w-2xl flex-col gap-1">
            {title ? <h2 className="text-h3 font-medium">{title}</h2> : null}
            {description ? <p className="text-ui text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

/** Controls used together (search and its filter, save and cancel): 8 px apart. */
export function ActionGroup({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>
}

/** A row of action groups: the groups 24 px apart, so each reads as one cluster. */
export function Toolbar({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-wrap items-center gap-x-6 gap-y-3', className)}>{children}</div>
}

/**
 * The light beige ground of statistics (figures, charts, their tables) so they stand apart from the forms and lists around them.
 */
export function StatsPanel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-col gap-6 rounded-xl bg-beige-50 p-5 sm:p-6', className)}>{children}</div>
}

/** One figure: a label, the value, and an optional line under it (a comparison or what it counts). */
export function StatTile({ label, value, hint, className }: { label: ReactNode; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-small text-muted-foreground">{label}</span>
      <span className="text-[1.75rem] leading-9 font-semibold tracking-[-0.02em] text-ink">{value}</span>
      {hint ? <span className="text-small text-muted-foreground">{hint}</span> : null}
    </div>
  )
}

/** Tiles side by side, divided by thin lines, on the beige panel. */
export function StatRow({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('grid gap-6 sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] sm:[&>*+*]:border-l sm:[&>*+*]:border-grey-200 sm:[&>*+*]:pl-6', className)}>{children}</div>
}

/**
 * A choice among a few options shown together (a chart's measure, bar or line, a time step): a grey pill with the options in it;
 * the chosen one is orange text.
 */
export function Segmented<T extends string>({ label, options, value, onChange, className }: {
  label: string
  options: { id: T; label: ReactNode }[]
  value: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('inline-flex items-center gap-0.5 rounded-full bg-grey-100 p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          onClick={() => onChange(o.id)}
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-full px-3 text-small whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3.5',
            o.id === value ? 'bg-white font-medium text-primary' : 'text-muted-foreground hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
