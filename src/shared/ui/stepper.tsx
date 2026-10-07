import { CheckIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type StepperStep = { label: string; done?: boolean }

/**
 * Numbered progress along a line: finished steps are filled green with a check, the current one is a green ring,
 * the rest are grey. With {@code onSelect} every step is a button (the shop wizard lets the seller jump around).
 */
export function Stepper({ steps, current, onSelect, className }: {
  steps: StepperStep[]
  /** 1-based. */
  current: number
  onSelect?: (step: number) => void
  className?: string
}) {
  return (
    <ol className={cn('flex w-full items-start', className)} aria-label="Các bước">
      {steps.map((step, index) => {
        const n = index + 1
        const done = step.done ?? n < current
        const active = n === current
        const circle = (
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
              done && 'border-primary bg-primary text-primary-foreground',
              active && !done && 'border-primary bg-card text-primary',
              !done && !active && 'border-border bg-card text-muted-foreground',
            )}
          >
            {done ? <CheckIcon className="size-4" /> : n}
          </span>
        )
        const label = (
          <span className={cn('max-w-24 text-center text-xs leading-tight', active ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
            {step.label}
          </span>
        )
        return (
          <li key={n} aria-current={active ? 'step' : undefined} className={cn('flex min-w-0 flex-1 flex-col items-center gap-1.5', index > 0 && 'relative')}>
            {index > 0 ? (
              <span
                aria-hidden
                className={cn('absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2', steps[index - 1].done ?? n - 1 < current ? 'bg-primary' : 'bg-border')}
              />
            ) : null}
            {onSelect ? (
              <button type="button" onClick={() => onSelect(n)} className="relative z-10 flex flex-col items-center gap-1.5 rounded-sm">
                {circle}
                {label}
              </button>
            ) : (
              <span className="relative z-10 flex flex-col items-center gap-1.5">
                {circle}
                {label}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
