import { CircleAlertIcon, CircleCheckIcon, ClockIcon } from 'lucide-react'
import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

const ICON = {
  success: { icon: CircleCheckIcon, className: 'bg-success-subtle text-on-success-subtle' },
  pending: { icon: ClockIcon, className: 'bg-info-subtle text-on-info-subtle' },
  danger: { icon: CircleAlertIcon, className: 'bg-danger-subtle text-on-danger-subtle' },
}

/**
 * Rung 5 of the feedback ladder: the page at the end of a flow (order placed, shop submitted, payment failed). It answers the three
 * questions in order: what happened (title), what it means (description), what happens next (steps, with times when known), then
 * offers the way forward. Never a bare "Thành công".
 */
export function ResultPage({
  status = 'success',
  title,
  description,
  next,
  primary,
  secondary,
  className,
}: {
  status?: keyof typeof ICON
  title: string
  description?: React.ReactNode
  /** what happens next, in order: "Quán nhận đơn (thường trong 3 phút)", "Bạn thấy giờ giao dự kiến"… */
  next?: React.ReactNode[]
  primary?: React.ReactNode
  secondary?: React.ReactNode
  className?: string
}) {
  const { icon: Icon, className: tone } = ICON[status]
  return (
    <section data-slot="result-page" className={cn('mx-auto flex w-full max-w-(--bb-reading-max) flex-col items-center gap-6 px-4 py-12 text-center', className)}>
      <span className={cn('inline-flex size-16 items-center justify-center rounded-full', tone)}>
        <Icon aria-hidden="true" className="size-8" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-title-1 text-balance text-text">{title}</h1>
        {description ? <p className="text-body text-text-secondary">{description}</p> : null}
      </div>
      {next?.length ? (
        <ol className="flex w-full flex-col gap-3 rounded-card border bg-surface p-4 text-left">
          {next.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-body text-text">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-caption text-on-accent-subtle tabular-nums">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {primary || secondary ? (
        <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-center">
          {secondary}
          {primary}
        </div>
      ) : null}
    </section>
  )
}
