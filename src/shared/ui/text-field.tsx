import { CircleAlertIcon } from 'lucide-react'
import * as React from 'react'
import { t } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Input } from './input'

/**
 * A labelled text field (design v5): the label above, always visible; help text below until there is an error; the error replaces
 * it with an icon, is announced, and is linked to the field. Required fields get a red * before the label; optional ones are not
 * marked. The typed value is never cleared by an error. `counter` shows typed/max inside the field (needs a controlled value).
 */
export function TextField({
  id,
  label,
  help,
  error,
  required,
  counter,
  className,
  ...inputProps
}: Omit<React.ComponentProps<'input'>, 'id'> & {
  id: string
  label: string
  help?: React.ReactNode
  error?: string
  required?: boolean
  counter?: boolean
}) {
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : help ? helpId : undefined
  return (
    <div data-slot="text-field" className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label text-text">
        {required ? (
          <>
            <span aria-hidden="true" className="mr-0.5 text-danger">
              *
            </span>
            <span className="sr-only">{t('(bắt buộc) ')}</span>
          </>
        ) : null}
        {label}
      </label>
      <Input id={id} showCount={counter} aria-invalid={error ? true : undefined} aria-describedby={describedBy} required={required} {...inputProps} />
      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-body-sm text-on-danger-subtle">
          <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="text-caption text-text-tertiary">
          {help}
        </p>
      ) : null}
    </div>
  )
}
