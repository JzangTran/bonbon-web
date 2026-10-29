import { ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { cn } from '@/shared/lib/utils'

export type TreeSection = { key: string; title: string; items: { label: string; to: string }[] }

/**
 * The left menu of a resources tab, after the GitBook docs: each section is a row that opens to its pages (the second and third levels).
 * The section holding the current page starts open; the current page is orange beside an orange piece of the rail.
 */
export function ResourceTree({ sections, current, label }: { sections: TreeSection[]; current: string; label: string }) {
  const holding = sections.find((s) => s.items.some((i) => i.to === current))?.key
  const [open, setOpen] = useState<Set<string>>(() => new Set(holding ? [holding] : []))
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  return (
    <nav aria-label={label} className="flex flex-col gap-0.5">
      {sections.map((s) => {
        const expanded = open.has(s.key)
        const listId = `tree-${s.key}`
        return (
          <div key={s.key} className="flex flex-col">
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={listId}
              onClick={() => toggle(s.key)}
              className={cn(
                'flex min-h-9 items-center justify-between gap-2 rounded-md px-3 py-1.5 text-left text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring',
                s.key === holding ? 'font-medium text-ink' : 'text-muted-foreground',
              )}
            >
              {s.title}
              <ChevronRightIcon className={cn('size-4 shrink-0 transition-transform motion-reduce:transition-none', expanded && 'rotate-90')} aria-hidden="true" />
            </button>
            {expanded ? (
              <ul id={listId} className="mt-0.5 mb-2 ml-3 flex flex-col border-l border-grey-200">
                {s.items.map((item) => {
                  const on = item.to === current
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={on ? 'page' : undefined}
                        className={cn(
                          '-ml-px flex min-h-8 items-center rounded-r-md border-l py-1.5 pr-1.5 pl-3 text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                          on ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground hover:border-grey-400',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
