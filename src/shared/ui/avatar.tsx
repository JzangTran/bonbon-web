import { useState } from 'react'
import { cn } from '@/shared/lib/utils'

const SIZE = { sm: 'size-8 text-caption', md: 'size-10 text-label', lg: 'size-14 text-title-3' } as const

/** A person or a shop: the photo, or the first letter of the name on the accent's subtle fill when there is no photo or it fails. */
export function Avatar({ name, src, size = 'md', className }: { name: string; src?: string | null; size?: keyof typeof SIZE; className?: string }) {
  const [failed, setFailed] = useState(false)
  const initial = (name.trim()[0] ?? '?').toUpperCase()
  return (
    <span data-slot="avatar" className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-subtle font-semibold text-on-accent-subtle', SIZE[size], className)}>
      {src && !failed ? <img src={src} alt={name} className="size-full object-cover" onError={() => setFailed(true)} /> : <span aria-label={name} role="img">{initial}</span>}
    </span>
  )
}
