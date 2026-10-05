import { StarIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

/** Five stars, filled up to {@code value}. */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value} trên 5 sao`} className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} aria-hidden className={cn('size-4', n <= value ? 'fill-amber-400 text-amber-400' : 'text-border')} />
      ))}
    </span>
  )
}
