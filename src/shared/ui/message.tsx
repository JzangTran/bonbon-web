import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-react'
import type * as React from 'react'
import { t } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

export type MessageTone = 'info' | 'success' | 'warning' | 'danger'

const TONE: Record<MessageTone, { box: string; icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }> }> = {
  info: { box: 'bg-info-subtle text-on-info-subtle', icon: InfoIcon },
  success: { box: 'bg-success-subtle text-on-success-subtle', icon: CircleCheckIcon },
  warning: { box: 'bg-warning-subtle text-on-warning-subtle', icon: TriangleAlertIcon },
  danger: { box: 'bg-danger-subtle text-on-danger-subtle', icon: CircleAlertIcon },
}

type MessageProps = {
  tone?: MessageTone
  /** One line: the state or the problem, with the user's own data ("Quán đang tạm ngưng nhận đơn đến 12:30"). */
  title: React.ReactNode
  /** What it means for the user, and what happens next. */
  children?: React.ReactNode
  /** The one action that resolves it. */
  action?: React.ReactNode
  /** Only for messages the user may put away; leave out for conditions that must stay visible until they end. */
  onDismiss?: () => void
  className?: string
}

function MessageBody({ tone = 'info', title, children, action, onDismiss, className, variant }: MessageProps & { variant: 'inline' | 'banner' }) {
  const { box, icon: Icon } = TONE[tone]
  return (
    <div
      data-slot={variant === 'banner' ? 'banner' : 'inline-message'}
      data-tone={tone}
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex items-start gap-3 rounded-card px-4 py-3', box, variant === 'banner' && 'w-full', className)}
    >
      <Icon aria-hidden={true} className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-label">{title}</p>
        {children ? <div className="text-body-sm">{children}</div> : null}
        {action && variant === 'inline' ? <div className="mt-2 flex flex-wrap gap-2">{action}</div> : null}
      </div>
      {action && variant === 'banner' ? <div className="flex shrink-0 flex-wrap items-center gap-2 self-center">{action}</div> : null}
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label={t('Đóng')} className="-m-1 rounded-control p-1 opacity-70 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-ring">
          <XIcon aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

/**
 * Rung 2 of the feedback ladder: a message inside the section it talks about (a form's submit error, a result tied to one area).
 * Write it as what happened · what it means · what to do next.
 */
export function InlineMessage(props: MessageProps) {
  return <MessageBody {...props} variant="inline" />
}

/**
 * Rung 3: a condition that affects the whole page or app (shop paused, debt overdue, offline, under review). It spans the work area
 * under the header, stays until the condition ends, and always offers the action that resolves it.
 */
export function Banner(props: MessageProps) {
  return <MessageBody {...props} variant="banner" />
}
