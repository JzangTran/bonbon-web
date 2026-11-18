import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

/**
 * Tones (design v5): `neutral` for counts and plain labels, `accent` for the selected or new thing, the four status tones always with a
 * word that names the state (never colour alone), `promo` for discounts and vouchers. The v4 names still work: default = accent,
 * secondary = neutral, destructive = danger, outline = a neutral outline.
 */
type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'promo' | 'outline'
type Legacy = 'default' | 'secondary' | 'destructive'

const TONE: Record<Tone, string> = {
  neutral: 'bg-surface-subtle text-text-secondary',
  accent: 'bg-accent-subtle text-on-accent-subtle',
  success: 'bg-success-subtle text-on-success-subtle',
  warning: 'bg-warning-subtle text-on-warning-subtle',
  danger: 'bg-danger-subtle text-on-danger-subtle',
  info: 'bg-info-subtle text-on-info-subtle',
  promo: 'bg-promo-subtle text-promo',
  outline: 'text-text-secondary ring-1 ring-border-strong ring-inset',
}
const LEGACY: Record<Legacy, Tone> = { default: 'accent', secondary: 'neutral', destructive: 'danger' }

/** A small status or count label: 4 px corners, caption style. */
export function Badge({
  className,
  variant,
  tone,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & { tone?: Tone; variant?: Tone | Legacy; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'
  const resolved: Tone = tone ?? (variant ? ((LEGACY as Record<string, Tone>)[variant] ?? (variant as Tone)) : 'accent')
  return (
    <Comp
      data-slot="badge"
      data-tone={resolved}
      className={cn('inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-xs px-2 text-caption whitespace-nowrap [&>svg]:size-3.5', TONE[resolved], className)}
      {...props}
    />
  )
}
