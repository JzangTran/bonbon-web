import { t } from '@/shared/i18n'
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'

/**
 * One line of a long form: the label in a right-aligned column on the left, the control on the right (stacked on
 * phones). {@code hint} shows under the control until there is an {@code error}; the error is announced and, when the
 * control is a single element with {@code htmlFor} as its id, linked to it with {@code aria-describedby}.
 */
export function FormRow({ label, htmlFor, required, hint, error, children, className }: {
  label: string
  /** A red * before the label: the form cannot be saved for good without it. */
  required?: boolean
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  const errorId = htmlFor ? `${htmlFor}-error` : undefined
  // A text field in a row shows how much of its limit is used; the row's error is linked to it.
  const extra: Record<string, unknown> = {}
  if (isValidElement(children) && (children.type === Input || children.type === Textarea)) extra.showCount = true
  if (error && errorId) Object.assign(extra, { 'aria-describedby': errorId, 'aria-invalid': true })
  const control = isValidElement(children) && Object.keys(extra).length > 0
    ? cloneElement(children as ReactElement<Record<string, unknown>>, extra)
    : children
  return (
    <div className="@container">
    <div className={cn('grid gap-1.5 @xl:grid-cols-[13rem_minmax(0,1fr)] @xl:gap-x-5', className)}>
      <Label htmlFor={htmlFor} className="leading-snug @xl:justify-end @xl:pt-2.5 @xl:text-right">
        <span>
          {required ? (
            <>
              <span aria-hidden="true" className="mr-0.5 text-destructive">*</span>
              <span className="sr-only">{t('(bắt buộc) ')}</span>
            </>
          ) : null}
          {label}
        </span>
      </Label>
      <div className="flex max-w-xl flex-col gap-1.5">
        {control}
        {error ? <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
    </div>
  )
}
