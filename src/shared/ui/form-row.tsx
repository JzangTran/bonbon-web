import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Label } from './label'

/**
 * One line of a long form: the label in a right-aligned column on the left, the control on the right (stacked on
 * phones). {@code hint} shows under the control until there is an {@code error}; the error is announced and, when the
 * control is a single element with {@code htmlFor} as its id, linked to it with {@code aria-describedby}.
 */
export function FormRow({ label, htmlFor, hint, error, children, className }: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  const control = error && errorId && isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, { 'aria-describedby': errorId, 'aria-invalid': true })
    : children
  return (
    <div className={cn('grid gap-1.5 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-x-5', className)}>
      <Label htmlFor={htmlFor} className="md:justify-end md:pt-2.5 md:text-right">
        {label}
      </Label>
      <div className="flex max-w-xl flex-col gap-1.5">
        {control}
        {error ? <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  )
}
