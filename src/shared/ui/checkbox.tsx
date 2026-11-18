import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * A choice that waits for the form's Save, or one of several that can all be picked. The label is part of the control, so clicking the
 * text ticks it. A native checkbox in the accent colour: the browser keeps keyboard, form and screen-reader behaviour.
 */
export function Checkbox({
  label,
  description,
  className,
  id,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'> & { label: React.ReactNode; description?: React.ReactNode; id: string }) {
  return (
    <div data-slot="checkbox" className={cn('flex items-start gap-3', className)}>
      <input
        id={id}
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-xs accent-(--bb-accent) outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45"
        aria-describedby={description ? `${id}-description` : undefined}
        {...props}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-body text-text">
          {label}
        </label>
        {description ? (
          <p id={`${id}-description`} className="text-body-sm text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
