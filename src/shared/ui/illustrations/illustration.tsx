import { cn } from '@/shared/lib/utils'
import { SHAPES, type IllustrationName } from './shapes'

/**
 * A small drawing for a screen that has nothing to show (empty list, no result, error, maintenance, success). Purely decorative:
 * hidden from screen readers, drawn in the brand colour with `currentColor` so dark mode follows the text colour of its container.
 */
export function Illustration({ name, className }: { name: IllustrationName; className?: string }) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" focusable="false" className={cn('h-auto w-40 max-w-full text-primary', className)} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {SHAPES[name].map((s, i) =>
        s.tone === 'soft' ? (
          <path key={i} d={s.d} fill="currentColor" fillOpacity={0.14} stroke="none" />
        ) : (
          <path key={i} d={s.d} stroke="currentColor" strokeWidth={s.width ?? 3} strokeOpacity={s.faint ? 0.35 : 1} />
        ),
      )}
    </svg>
  )
}
