import { cn } from '@/shared/lib/utils'
import { Card } from './card'

export type Bar = { key: string; label: string; value: number; title: string }

/** A bar per period, scaled to the tallest; no chart library for a single series. */
export function BarChart({ bars, ariaLabel, format }: { bars: Bar[]; ariaLabel: string; format: (value: number) => string }) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  // About eight labels, whatever the number of bars.
  const every = Math.max(1, Math.ceil(bars.length / 8))
  return (
    <Card className="p-4">
      <div className="flex h-56 items-end gap-px sm:gap-1" role="img" aria-label={ariaLabel}>
        {bars.map((b) => (
          <div key={b.key} className="group relative flex h-full min-w-0 flex-1 items-end" title={b.title}>
            <div
              className={cn('w-full rounded-t-sm bg-primary transition-colors group-hover:bg-primary-hover', b.value === 0 && 'bg-muted')}
              style={{ height: `${Math.max(2, Math.round((b.value / max) * 100))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-px text-[0.6875rem] text-muted-foreground sm:gap-1">
        {bars.map((b, i) => (
          <span key={b.key} className="min-w-0 flex-1 overflow-visible text-center whitespace-nowrap">
            {i % every === 0 ? b.label : ''}
          </span>
        ))}
      </div>
      <p className="mt-2 text-right text-xs text-muted-foreground">Cột cao nhất: {format(max)}</p>
    </Card>
  )
}
