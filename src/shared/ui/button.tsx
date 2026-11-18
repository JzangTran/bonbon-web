import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

/**
 * bonbon's button (design v5). 10 px corners like inputs, label style (14/20, 600). `default` is the one main action of a screen, filled
 * with the accent; `outline` is the second action (surface, strong outline); `secondary` a quiet action on a subtle fill; `ghost` text
 * only, for toolbars and rows; `destructive` only to confirm a destructive action inside a dialog; `link` the link colour.
 * Sizes: sm 32 px, default 40 px, lg 48 px (touch); icon sizes match.
 */
type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type Size = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-semibold whitespace-nowrap transition-colors duration-(--bb-motion-fast) outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 aria-invalid:outline-2 aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0'

const VARIANT: Record<Variant, string> = {
  default: 'bg-button text-button-foreground hover:bg-button-hover',
  outline: 'border border-border-strong bg-surface text-text hover:bg-surface-subtle aria-expanded:bg-surface-subtle',
  secondary: 'bg-surface-subtle text-text hover:bg-surface-strong aria-expanded:bg-surface-strong',
  ghost: 'text-text-secondary hover:bg-surface-subtle hover:text-text aria-expanded:bg-surface-subtle aria-expanded:text-text',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  link: 'text-link h-auto px-0',
}

const SIZE: Record<Size, string> = {
  default: 'h-10 px-4 text-label [&_svg:not([class*=size-])]:size-5',
  xs: 'h-7 px-2.5 text-caption [&_svg:not([class*=size-])]:size-4',
  sm: 'h-8 px-3 text-label [&_svg:not([class*=size-])]:size-4',
  lg: 'h-12 px-5 text-label [&_svg:not([class*=size-])]:size-5',
  icon: 'size-10 [&_svg:not([class*=size-])]:size-5',
  'icon-xs': 'size-7 [&_svg:not([class*=size-])]:size-4',
  'icon-sm': 'size-8 [&_svg:not([class*=size-])]:size-4',
  'icon-lg': 'size-12 [&_svg:not([class*=size-])]:size-6',
}

export function buttonClass({ variant = 'default', size = 'default', className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(BASE, SIZE[size], VARIANT[variant], className)
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & { variant?: Variant; size?: Size; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" data-variant={variant} data-size={size} className={buttonClass({ variant, size, className })} {...props} />
}
