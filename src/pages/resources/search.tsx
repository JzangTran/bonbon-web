import { CheckIcon, ChevronDownIcon, ChevronRightIcon, ComponentIcon, FileTextIcon, HashIcon, InfinityIcon, SearchIcon } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { tx } from '@/shared/i18n'
import { searchResources, suggestedResources, type SearchEntry } from './search-index'
import { TABS, type TabKey } from './site'

type Scope = TabKey | 'all'

const SCOPES: { id: Scope; label: string; hint?: string }[] = [
  { id: 'all', label: tx('Tất cả tài nguyên', 'All resources'), hint: tx('Mọi phần của tài nguyên', 'Every part of the resources') },
  ...TABS.map((x) => ({ id: x.key as Scope, label: x.title })),
]

/**
 * The resources search, after the GitBook docs: a pill in the header that opens a panel of results under it, filtered to all resources
 * or one tab, driven by the arrow keys, Enter and Esc; Ctrl K (⌘K) jumps to it from anywhere on the page.
 */
export function ResourceSearch({ tab }: { tab: TabKey }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<Scope>(tab)
  const [scopeOpen, setScopeOpen] = useState(false)
  const [active, setActive] = useState(0)
  const box = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()

  const results = useMemo(() => (query.trim() ? searchResources(query, scope) : suggestedResources(scope)), [query, scope])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        input.current?.focus()
        setOpen(true)
      }
    }
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) {
        setOpen(false)
        setScopeOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [])

  const go = (entry: SearchEntry) => {
    setOpen(false)
    setQuery('')
    input.current?.blur()
    navigate(entry.path)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
      input.current?.blur()
    }
  }

  const scopeLabel = SCOPES.find((s) => s.id === scope)!.label

  return (
    <div ref={box} className="relative w-full max-w-md">
      <div className="flex h-10 items-center gap-2 rounded-full border border-grey-300 bg-white px-4 transition-colors focus-within:border-ink hover:border-grey-400">
        <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <input
          ref={input}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
          aria-label={tx('Tìm trong tài nguyên', 'Search resources')}
          placeholder={tx('Tìm…', 'Search…')}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-muted-foreground"
        />
        <kbd className="hidden shrink-0 rounded-xs border border-grey-300 px-1.5 font-mono text-caption text-muted-foreground sm:inline">Ctrl K</kbd>
      </div>

      {open ? (
        <div className="absolute top-12 left-1/2 z-50 flex w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 flex-col rounded-2xl border border-grey-200 bg-popover shadow-float">
          <ul id={listId} role="listbox" aria-label={tx('Kết quả', 'Results')} className="flex max-h-96 flex-col gap-0.5 overflow-y-auto p-2">
            {results.length ? (
              results.map((r, i) => {
                const Icon = r.heading ? HashIcon : r.path.includes('/components/') ? ComponentIcon : FileTextIcon
                return (
                  <li
                    key={r.path}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(r)}
                    className={cn('flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5', i === active ? 'bg-accent' : 'hover:bg-grey-100')}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-ui text-ink">{r.title}</span>
                      <span className="truncate text-caption text-muted-foreground">{r.trail}</span>
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </li>
                )
              })
            ) : (
              <li className="px-3 py-6 text-center text-ui text-muted-foreground">{tx('Không có kết quả.', 'No results.')}</li>
            )}
          </ul>

          <div className="relative flex items-center justify-between gap-3 rounded-b-2xl border-t border-grey-200 bg-grey-50 px-4 py-2.5 text-ui text-muted-foreground">
            <span className="flex items-center gap-2">
              {tx('Lọc', 'Filter')}
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={scopeOpen}
                onClick={() => setScopeOpen((o) => !o)}
                className="flex items-center gap-1 rounded-full bg-grey-100 px-3 py-1 text-ink outline-none hover:bg-grey-200 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {scopeLabel}
                <ChevronDownIcon className={cn('size-3.5 transition-transform', scopeOpen && 'rotate-180')} aria-hidden="true" />
              </button>
            </span>
            <span className="hidden items-center gap-3 sm:flex">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-xs border border-grey-300 px-1 font-mono text-caption">↑</kbd>
                <kbd className="rounded-xs border border-grey-300 px-1 font-mono text-caption">↓</kbd>
                {tx('Chọn', 'Navigate')}
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-xs border border-grey-300 px-1 font-mono text-caption">Esc</kbd>
                {tx('Đóng', 'Close')}
              </span>
            </span>

            {scopeOpen ? (
              <ul role="listbox" aria-label={tx('Lọc', 'Filter')} className="absolute bottom-12 left-4 flex w-60 flex-col rounded-xl border border-grey-200 bg-popover p-1.5 shadow-float">
                {SCOPES.map((s) => (
                  <li key={s.id} role="option" aria-selected={s.id === scope}>
                    <button
                      type="button"
                      onClick={() => {
                        setScope(s.id)
                        setScopeOpen(false)
                        setActive(0)
                        input.current?.focus()
                      }}
                      className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left outline-none hover:bg-grey-100 focus-visible:ring-2 focus-visible:ring-ring', s.id === scope && 'bg-accent')}
                    >
                      {s.id === 'all' ? <InfinityIcon className="size-4 text-muted-foreground" aria-hidden="true" /> : null}
                      <span className="flex flex-1 flex-col">
                        <span className="text-ui text-ink">{s.label}</span>
                        {s.hint ? <span className="text-caption text-muted-foreground">{s.hint}</span> : null}
                      </span>
                      {s.id === scope ? <CheckIcon className="size-4 text-primary" aria-hidden="true" /> : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
