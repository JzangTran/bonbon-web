import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { t } from '@/shared/i18n'
import { Button } from './button'

/**
 * Copies a value and says so on the button itself (design v5 feedback, rung 1): the icon turns into a tick and the label into
 * "Đã chép" for 2 s, announced to screen readers. If the browser refuses, the button says so instead of failing silently.
 */
export function CopyButton({ value, label, text: idleText, iconOnly = false, size = 'sm', variant = 'outline' }: {
  value: string
  /** the button's text before copying; defaults to "Sao chép" */
  text?: string
  /** what is copied, for the accessible name: "Sao chép khoá" */
  label: string
  iconOnly?: boolean
  size?: 'sm' | 'default'
  variant?: 'outline' | 'ghost' | 'secondary'
}) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')
  useEffect(() => {
    if (state === 'idle') return
    const id = setTimeout(() => setState('idle'), 2000)
    return () => clearTimeout(id)
  }, [state])
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setState('done')
    } catch {
      setState('failed')
    }
  }
  const text = state === 'done' ? t('Đã chép') : state === 'failed' ? t('Không chép được') : (idleText ?? t('Sao chép'))
  return (
    <Button type="button" variant={variant} size={iconOnly ? (size === 'sm' ? 'icon-sm' : 'icon') : size} onClick={() => void copy()} aria-label={iconOnly ? (state === 'idle' ? label : text) : undefined}>
      {state === 'done' ? <CheckIcon aria-hidden="true" className="text-success" /> : <CopyIcon aria-hidden="true" />}
      {iconOnly ? null : <span>{text}</span>}
      <span role="status" className="sr-only">
        {state === 'idle' ? '' : text}
      </span>
    </Button>
  )
}
