import * as React from 'react'
import { Slot } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

type Variant = 'default' | 'secondary' | 'outline' | 'destructive'

const VARIANT: Record<Variant, string> = {
  default: 'bg-accent text-accent-foreground',
  secondary: 'bg-grey-100 text-muted-foreground',
  outline: 'text-muted-foreground ring-1 ring-border ring-inset',
  destructive: 'bg-danger-subtle text-danger-fg',
}

/** A small label: pill, 12px, medium weight. */
export function Badge({ className, variant = 'default', asChild = false, ...props }: React.ComponentProps<'span'> & { variant?: Variant; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span'
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn('inline-flex h-6 w-fit shrink-0 items-center gap-1 rounded-full px-2.5 text-caption font-medium whitespace-nowrap [&>svg]:size-3', VARIANT[variant], className)}
      {...props}
    />
  )
}
