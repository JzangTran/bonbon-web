import { cn } from '@/shared/lib/utils'

/**
 * A soft wavy edge between two backgrounds. It takes the colour of the section it belongs to (`text-*` sets it) and is placed
 * at the top of that section, sitting on the section above. Purely decorative.
 */
export function WaveEdge({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-x-0 top-0 h-8 w-full -translate-y-[calc(100%-1px)] sm:h-12 lg:h-16', className)}
    >
      <path fill="currentColor" d="M0 44C180 4 360 0 540 28s360 52 540 28c130-17 250-40 360-26v50H0Z" />
    </svg>
  )
}

/** Two layers of gentle waves along the bottom of a page, in light tints of the brand green. */
export function WaveBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 260"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-brand-100 md:h-56', className)}
    >
      <path fill="currentColor" fillOpacity="0.55" d="M0 120c160-60 330-70 520-20s380 90 560 50c140-31 250-80 360-60v170H0Z" />
      <path fill="currentColor" fillOpacity="0.9" d="M0 190c200-50 400-30 600 0s400 40 560-10c100-31 190-30 280-4v84H0Z" />
    </svg>
  )
}
