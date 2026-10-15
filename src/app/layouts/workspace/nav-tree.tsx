import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/utils'
import type { Location } from './locate'
import type { NavParent } from './types'

const rowBase = 'flex min-h-9 w-full items-center justify-between gap-3 px-5 text-left text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'

function readOpen(storageKey: string): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(storageKey) ?? '{}') as Record<string, boolean>
  } catch {
    return {}
  }
}

/**
 * The left navigation: parents with an icon, children under them. Flush to the edges and square. The current page is shown in
 * green text; a light fill marks a single-page parent that is current, or a collapsed group that contains the current page.
 */
export function NavTree({ nav, location, storageKey, onNavigate }: {
  nav: NavParent[]
  location: Location
  storageKey: string
  onNavigate?: () => void
}) {
  const [stored, setStored] = useState(() => readOpen(storageKey))

  const toggle = (key: string, open: boolean) => {
    const next = { ...stored, [key]: !open }
    setStored(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // The choice just does not persist.
    }
  }

  return (
    <ul className="flex flex-col">
      {nav.map((parent) => {
        const Icon = parent.icon
        const here = location.parent?.key === parent.key
        if (!parent.children) {
          return (
            <li key={parent.key}>
              <NavLink
                to={parent.to!}
                end
                onClick={onNavigate}
                aria-current={location.page?.to === parent.to ? 'page' : 'false'}
                className={cn(rowBase, 'justify-start hover:bg-ws-fill', here && 'bg-ws-fill font-semibold text-brand-700')}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  {parent.label}
                </span>
              </NavLink>
            </li>
          )
        }
        const open = stored[parent.key] ?? (here || (parent.defaultOpen ?? true))
        const listId = `nav-${parent.key}`
        return (
          <li key={parent.key}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => toggle(parent.key, open)}
              className={cn(rowBase, 'hover:bg-ws-fill', here && !open && 'bg-ws-fill font-semibold text-brand-700')}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {parent.label}
              </span>
              <ChevronDownIcon
                className={cn('size-3.5 shrink-0 transition-transform', open ? 'text-muted-foreground' : '-rotate-90', here && !open && 'text-brand-700')}
                aria-hidden="true"
              />
            </button>
            {open ? (
              <ul id={listId} className="flex flex-col">
                {parent.children.map((child) => {
                  const current = location.page?.to === child.to
                  return (
                    <li key={child.to}>
                      <NavLink
                        to={child.to}
                        onClick={onNavigate}
                        aria-current={current ? 'page' : 'false'}
                        className={() =>
                          cn(
                            'flex min-h-9 items-center pr-5 pl-[50px] text-[13px] text-muted-foreground outline-none hover:bg-ws-fill focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                            current && 'font-semibold text-brand-700',
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
