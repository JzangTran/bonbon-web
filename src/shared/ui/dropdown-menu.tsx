import * as React from 'react'
import { DropdownMenu as MenuPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/utils'

/** bonbon's menu: white list, soft shadow, rows highlighted with a pale grey on hover. Radix supplies only the behaviour. */
export const DropdownMenu = MenuPrimitive.Root
export const DropdownMenuTrigger = MenuPrimitive.Trigger

export function DropdownMenuContent({ className, sideOffset = 8, align = 'end', ...props }: React.ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn('bb-pop-menu z-50 min-w-56 rounded-xl bg-popover p-1.5 text-ui text-popover-foreground shadow-float outline-none', className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn('flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-ink outline-none select-none data-[disabled]:opacity-50 data-[highlighted]:bg-grey-100', className)}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Label>) {
  return <MenuPrimitive.Label data-slot="dropdown-menu-label" className={cn('px-2.5 pt-2 pb-1 text-caption text-muted-foreground', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn('my-1.5 h-px bg-grey-100', className)} {...props} />
}
