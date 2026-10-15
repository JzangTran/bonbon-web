import { cn } from '@/shared/lib/utils'

type Chip<T extends string> = { id: T; label: string }

/**
 * A filter inside the page content (status, period): small pills, one selected. Not for the page's business parts, which are
 * the tabs of the workspace (`PageTabs`).
 */
export function FilterChips<T extends string>({ label, chips, value, onChange }: { label: string; chips: Chip<T>[]; value: T; onChange: (id: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.id || 'all'}
          type="button"
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
          className={cn(
            'h-8 rounded-full px-3.5 text-[13px] whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === c.id ? 'bg-primary font-semibold text-primary-foreground' : 'bg-ws-fill text-foreground hover:bg-muted',
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
