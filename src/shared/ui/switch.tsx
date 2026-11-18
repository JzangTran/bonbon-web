import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * An on/off setting that takes effect at once (accepting orders, notification types). Not for choices that wait for a Save button:
 * use a checkbox there. Always next to a visible label; pass `aria-labelledby` or wrap in a <label>, or give `label` for the name.
 */
export function Switch({
  checked,
  onCheckedChange,
  label,
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<'button'>, 'onChange' | 'type' | 'role'> & { checked: boolean; onCheckedChange: (checked: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-slot="switch"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors duration-(--bb-motion-fast) outline-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45',
        checked ? 'bg-primary' : 'bg-border-strong',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-(--bb-motion-fast)',
          checked && 'translate-x-4',
        )}
      />
    </button>
  )
}
