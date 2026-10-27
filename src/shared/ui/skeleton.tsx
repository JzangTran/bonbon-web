import * as React from 'react'
import { cn } from '@/shared/lib/utils'

/** A pale block standing in for content that is loading. */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="skeleton" className={cn('animate-pulse rounded-lg bg-grey-100', className)} {...props} />
}
