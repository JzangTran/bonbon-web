import type * as React from 'react'
import { cn } from '@/shared/lib/utils'

/** The eight named styles of the type ramp (design v5). A screen uses three to five of them. */
export type TextVariant = 'display' | 'title-1' | 'title-2' | 'title-3' | 'body' | 'body-sm' | 'label' | 'caption'
/** Three levels of emphasis, plus the link colour and the status colours. Never tint text only to emphasise it. */
export type TextTone = 'default' | 'secondary' | 'tertiary' | 'disabled' | 'link' | 'success' | 'warning' | 'danger' | 'info'

const VARIANT: Record<TextVariant, string> = {
  display: 'text-display',
  'title-1': 'text-title-1',
  'title-2': 'text-title-2',
  'title-3': 'text-title-3',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  label: 'text-label',
  caption: 'text-caption',
}

const TONE: Record<TextTone, string> = {
  default: 'text-text',
  secondary: 'text-text-secondary',
  tertiary: 'text-text-tertiary',
  disabled: 'text-text-disabled',
  link: 'text-link',
  success: 'text-on-success-subtle',
  warning: 'text-on-warning-subtle',
  danger: 'text-on-danger-subtle',
  info: 'text-on-info-subtle',
}

/** The element each style is usually: titles are headings, the rest paragraphs. Pass `as` when the page needs another. */
const ELEMENT: Record<TextVariant, React.ElementType> = {
  display: 'h1',
  'title-1': 'h1',
  'title-2': 'h2',
  'title-3': 'h3',
  body: 'p',
  'body-sm': 'p',
  label: 'span',
  caption: 'span',
}

/**
 * Text in one of the eight named styles and one tone. Pages use this (or the `text-*` utilities it applies), never a raw size or
 * weight. Bold inside running text: wrap only the one value the reader needs first in <strong>.
 */
export function Text<E extends React.ElementType = 'p'>({
  as,
  variant = 'body',
  tone = 'default',
  className,
  ...props
}: { as?: E; variant?: TextVariant; tone?: TextTone; className?: string } & Omit<React.ComponentPropsWithoutRef<E>, 'as' | 'className'>) {
  const Comp = (as ?? ELEMENT[variant]) as React.ElementType
  return <Comp data-slot="text" className={cn(VARIANT[variant], TONE[tone], 'text-pretty', className)} {...props} />
}
