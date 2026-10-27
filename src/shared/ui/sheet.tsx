import * as React from 'react'
import { XIcon } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import { cn } from '@/shared/lib/utils'
import { Button } from './button'

/** A panel that slides in from an edge (Radix dialog behaviour, bonbon look). The motion classes are in index.css. */
export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close
export const SheetPortal = SheetPrimitive.Portal

export function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn('bb-overlay fixed inset-0 z-50 bg-black/25', className)} {...props} />
}

const SIDE = {
  right: 'inset-y-0 right-0 h-full w-3/4 sm:max-w-md',
  left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-md',
  top: 'inset-x-0 top-0 h-auto',
  bottom: 'inset-x-0 bottom-0 h-auto rounded-t-2xl',
} as const

export function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDE; showCloseButton?: boolean }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn('bb-sheet fixed z-50 flex flex-col gap-4 bg-popover text-ui text-popover-foreground shadow-float outline-none', SIDE[side], className)}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <SheetPrimitive.Close asChild>
            <Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" aria-label="Đóng">
              <XIcon />
            </Button>
          </SheetPrimitive.Close>
        ) : null}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={cn('flex flex-col gap-1.5 p-5 pr-12', className)} {...props} />
}

export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-footer" className={cn('mt-auto flex flex-col gap-2 p-5', className)} {...props} />
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn('text-h3 text-ink', className)} {...props} />
}

export function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn('text-ui text-muted-foreground', className)} {...props} />
}
