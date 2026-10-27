import * as React from 'react'
import { Label as LabelPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

/** A form label: 14px, medium weight, ink. */
export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('flex items-center gap-2 text-ui font-medium text-ink select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className)}
      {...props}
    />
  )
}
