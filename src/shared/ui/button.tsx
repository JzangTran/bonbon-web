import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

/**
 * bonbon's own button (no UI kit). Pills, medium weight, 14px text. `default` is the main action, filled in ink as on gitbook.com; `outline` and `secondary`
 * are the quiet second action on a pale grey fill (no border); `ghost` is grey text that darkens on hover; `link` is orange text.
 */
type Variant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
type Size = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

const BASE =
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 aria-invalid:outline-2 aria-invalid:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0'

const VARIANT: Record<Variant, string> = {
  default: 'bg-button text-button-foreground hover:bg-button-hover',
  outline: 'bg-grey-100 text-ink hover:bg-grey-200 aria-expanded:bg-grey-200',
  secondary: 'bg-grey-100 text-ink hover:bg-grey-200 aria-expanded:bg-grey-200',
  ghost: 'text-muted-foreground hover:bg-grey-100 hover:text-ink aria-expanded:bg-grey-100 aria-expanded:text-ink',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  link: 'h-auto px-0 text-primary underline-offset-4 hover:underline',
}

const SIZE: Record<Size, string> = {
  default: 'h-9 px-4 text-ui [&_svg:not([class*=size-])]:size-4',
  xs: 'h-7 px-2.5 text-caption [&_svg:not([class*=size-])]:size-3',
  sm: 'h-8 px-3 text-small [&_svg:not([class*=size-])]:size-3.5',
  lg: 'h-11 px-5 text-body [&_svg:not([class*=size-])]:size-[18px]',
  icon: 'size-9 [&_svg:not([class*=size-])]:size-4',
  'icon-xs': 'size-7 [&_svg:not([class*=size-])]:size-3',
  'icon-sm': 'size-8 [&_svg:not([class*=size-])]:size-4',
  'icon-lg': 'size-11 [&_svg:not([class*=size-])]:size-5',
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
