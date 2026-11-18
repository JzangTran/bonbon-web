import type * as React from 'react'
import { Button } from './button'

type Variant = 'ghost' | 'secondary' | 'outline' | 'default'
type Size = 'sm' | 'md' | 'lg'

const SIZE = { sm: 'icon-sm', md: 'icon', lg: 'icon-lg' } as const

/**
 * A button that shows only an icon. Only for the universal symbols (back, close, search, add, more, notifications, cart, settings);
 * every other action needs a visible label. `label` is required: it is the accessible name and the tooltip.
 */
export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & { label: string; icon: React.ReactNode; variant?: Variant; size?: Size }) {
  return (
    <Button type="button" variant={variant} size={SIZE[size]} aria-label={label} title={label} {...props}>
      {icon}
    </Button>
  )
}
