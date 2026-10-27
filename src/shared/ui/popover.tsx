import * as React from 'react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

/** A panel that opens under its trigger and is as wide as the trigger unless a width is given. White, soft shadow, no outline. */
export function PopoverContent({ className, align = 'start', sideOffset = 6, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn('bb-pop-menu z-50 w-(--radix-popover-trigger-width) min-w-72 rounded-xl bg-popover p-0 text-popover-foreground shadow-float outline-none', className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
