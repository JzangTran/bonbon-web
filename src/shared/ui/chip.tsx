import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * A choice that toggles: a filter ("Gần nhất", "Cơm"), a quick reply, a tag picked from a few. Selected chips use the accent's subtle
 * fill and text; the state is announced with aria-pressed. For one-of-many inside a form use radio buttons; for a single on/off
 * setting use a switch.
 */
export function Chip({
  selected = false,
  onSelectedChange,
  icon,
  className,
  children,
  onClick,
  ...props
}: Omit<React.ComponentProps<'button'>, 'type'> & { selected?: boolean; onSelectedChange?: (selected: boolean) => void; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      data-slot="chip"
      aria-pressed={selected}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onSelectedChange?.(!selected)
      }}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control border px-3 text-label whitespace-nowrap transition-colors duration-(--bb-motion-fast) outline-none select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0',
        selected
          ? 'border-transparent bg-accent-subtle text-on-accent-subtle'
          : 'border-border-strong bg-surface text-text hover:bg-surface-subtle',
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
