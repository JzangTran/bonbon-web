import { cn } from '@/shared/lib/utils'

/**
 * The big orange rings behind product pictures, after gitbook.com: many concentric circles that go from deep orange in the middle to
 * pale orange at the edge, so they read as one soft, round shape. Decorative; position it with `className`.
 */
export function OrangeRings({ className }: { className?: string }) {
  const rings = Array.from({ length: 18 }, (_, i) => i)
  return (
    <svg aria-hidden="true" viewBox="0 0 800 800" className={cn('pointer-events-none', className)}>
      <defs>
        <radialGradient id="bb-rings" gradientUnits="userSpaceOnUse" cx="400" cy="400" r="400">
          <stop offset="40%" stopColor="#f2400a" />
          <stop offset="65%" stopColor="#fe551b" />
          <stop offset="88%" stopColor="#ff8c5e" />
          <stop offset="100%" stopColor="#ffc4a8" />
        </radialGradient>
      </defs>
      {rings.map((i) => (
        <circle
          key={i}
          cx="400"
          cy="400"
          r={160 + i * 13}
          fill="none"
          stroke="url(#bb-rings)"
          strokeWidth={10.5}
          strokeOpacity={1 - i * 0.02}
        />
      ))}
    </svg>
  )
}
