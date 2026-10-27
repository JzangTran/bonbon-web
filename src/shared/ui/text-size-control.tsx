import { TEXT_SCALES, setTextScale, useTextScale } from '@/shared/lib/text-scale'
import { cn } from '@/shared/lib/utils'

/** "Cỡ chữ": three sizes (100, 125 and 150 %), saved on this device. */
export function TextSizeControl({ className, tone = 'default' }: { className?: string; tone?: 'default' | 'light' }) {
  const scale = useTextScale()
  return (
    <div role="group" aria-label="Cỡ chữ" className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-sm', tone === 'light' ? 'text-white/70' : 'text-muted-foreground')}>Cỡ chữ</span>
      <div className="flex gap-0.5">
        {TEXT_SCALES.map((s, i) => {
          const selected = scale === s.id
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={selected}
              aria-label={`Cỡ chữ ${s.label.toLowerCase()} (${s.percent}%)`}
              title={`${s.label} (${s.percent}%)`}
              onClick={() => setTextScale(s.id)}
              className={cn(
                'flex size-8 items-center justify-center rounded-full font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tone === 'light'
                  ? selected ? 'bg-white text-ink' : 'text-white hover:bg-white/10'
                  : selected ? 'text-primary ring-1 ring-primary/40' : 'text-muted-foreground hover:text-ink',
              )}
              style={{ fontSize: `${0.8 + i * 0.15}rem` }}
            >
              A
            </button>
          )
        })}
      </div>
    </div>
  )
}
