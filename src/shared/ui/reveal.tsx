import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * Fades a block up into place the first time it scrolls into view (one short move, 450 ms). Used on a few landing blocks only;
 * with `prefers-reduced-motion`, or without IntersectionObserver, the block is simply there.
 */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown])

  return (
    <div ref={ref} data-reveal={shown ? 'in' : 'out'} style={delay ? { animationDelay: `${delay}ms` } : undefined} className={cn('bb-reveal', className)}>
      {children}
    </div>
  )
}
