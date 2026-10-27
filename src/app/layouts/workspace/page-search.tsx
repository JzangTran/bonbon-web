import { SearchIcon } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import type { ExtraPage, NavParent } from './types'

type Hit = { to: string; label: string; group?: string }

/** Lower case without Vietnamese marks, so "don huy" finds "Đơn hủy". */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()

/**
 * The search field in the middle of the header, after the GitBook docs: it finds a page of this workspace by its name (or its group's
 * name) and opens it. Ctrl K or ⌘K puts the cursor in it; arrows move through the results, Enter opens one, Esc leaves.
 */
export function PageSearch({ nav, extras, className }: { nav: NavParent[]; extras: ExtraPage[]; className?: string }) {
  const navigate = useNavigate()
  const listId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const pages = useMemo<Hit[]>(() => {
    const all: Hit[] = []
    for (const p of nav) {
      if (p.to) all.push({ to: p.to, label: p.label })
      for (const c of p.children ?? []) all.push({ to: c.to, label: c.label, group: p.label })
    }
    for (const e of extras) if (!all.some((h) => h.to === e.to)) all.push({ to: e.to, label: e.label, group: nav.find((p) => p.key === e.parentKey)?.label })
    return all
  }, [nav, extras])

  const hits = useMemo(() => {
    const q = fold(query.trim())
    if (!q) return pages
    return pages.filter((h) => fold(`${h.label} ${h.group ?? ''}`).includes(q))
  }, [pages, query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (hit: Hit | undefined) => {
    if (!hit) return
    navigate(hit.to)
    setQuery('')
    setOpen(false)
    input.current?.blur()
  }

  const shown = open && hits.length > 0
  return (
    <div className={cn('relative', className)}>
      <div className="flex h-10 items-center gap-2 rounded-full border border-grey-300 bg-white px-3.5 text-muted-foreground focus-within:border-primary">
        <SearchIcon className="size-4 shrink-0" aria-hidden="true" />
        <input
          ref={input}
          role="combobox"
          aria-label="Tìm trang"
          aria-expanded={shown}
          aria-controls={listId}
          aria-activedescendant={shown ? `${listId}-${active}` : undefined}
          value={query}
          placeholder="Tìm trang..."
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((i) => Math.min(i + 1, hits.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              go(hits[active])
            } else if (e.key === 'Escape') {
              setOpen(false)
              input.current?.blur()
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-ui text-ink outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden rounded border border-grey-300 px-1.5 font-mono text-[0.6875rem] leading-4 text-muted-foreground lg:inline">Ctrl K</kbd>
      </div>
      {shown ? (
        <ul id={listId} role="listbox" aria-label="Trang" className="bb-pop-menu absolute inset-x-0 top-12 z-50 max-h-80 overflow-y-auto rounded-xl bg-popover p-1.5 shadow-float">
          {hits.map((hit, i) => (
            <li
              key={hit.to}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                go(hit)
              }}
              onMouseEnter={() => setActive(i)}
              className={cn('flex cursor-pointer items-baseline justify-between gap-3 rounded-lg px-2.5 py-2 text-ui', i === active ? 'bg-grey-100 text-ink' : 'text-ink')}
            >
              <span className="truncate">{hit.label}</span>
              {hit.group ? <span className="shrink-0 text-caption text-muted-foreground">{hit.group}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
