import type { ReactNode } from 'react'
import type { MascotPose } from '@/shared/assets/mascot-pictures'
import { cn } from '@/shared/lib/utils'
import { Illustration, MascotArt, type IllustrationName } from './illustrations'

/**
 * What a list shows when it has nothing: a picture, a line saying why, and optionally what to do about it. `mascot` picks the bear
 * that fits the list (waiting for orders, no messages, all clear…); without it the line drawing `illustration` is shown.
 */
export function EmptyState({
  illustration = 'empty',
  mascot,
  title,
  children,
  className,
}: {
  illustration?: IllustrationName
  mascot?: MascotPose
  title: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-sm border bg-card px-6 py-10 text-center', className)}>
      {mascot ? <MascotArt pose={mascot} fallback={illustration} /> : <Illustration name={illustration} />}
      <p className="font-semibold">{title}</p>
      {children ? <div className="max-w-md text-sm text-muted-foreground">{children}</div> : null}
    </div>
  )
}
