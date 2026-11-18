import type { ReactNode } from 'react'
import type { MascotPose } from '@/shared/assets/mascot-pictures'
import { cn } from '@/shared/lib/utils'
import { Illustration, MascotArt, type IllustrationName } from './illustrations'

/**
 * What a list shows when it has nothing (design v5): a picture, a title saying what will appear here, a line saying why it is empty
 * now, and the one action that fills it. `mascot` picks the bear that fits the list; without it the line drawing is shown.
 */
export function EmptyState({
  illustration = 'empty',
  mascot,
  title,
  children,
  action,
  className,
}: {
  illustration?: IllustrationName
  mascot?: MascotPose
  title: string
  children?: ReactNode
  /** the one action that fills the list ("Thêm món", "Bật âm báo") */
  action?: ReactNode
  className?: string
}) {
  return (
    <div data-slot="empty-state" className={cn('flex flex-col items-center gap-3 rounded-card border bg-surface px-6 py-10 text-center', className)}>
      {mascot ? <MascotArt pose={mascot} fallback={illustration} /> : <Illustration name={illustration} />}
      <p className="text-title-3 text-text">{title}</p>
      {children ? <div className="max-w-md text-body-sm text-text-secondary">{children}</div> : null}
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  )
}
