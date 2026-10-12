import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Illustration, type IllustrationName } from './illustrations'

/** What a list shows when it has nothing: a picture, a line saying why, and optionally what to do about it. */
export function EmptyState({ illustration = 'empty', title, children, className }: { illustration?: IllustrationName; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-sm border bg-card px-6 py-10 text-center', className)}>
      <Illustration name={illustration} />
      <p className="font-semibold">{title}</p>
      {children ? <div className="max-w-md text-sm text-muted-foreground">{children}</div> : null}
    </div>
  )
}
