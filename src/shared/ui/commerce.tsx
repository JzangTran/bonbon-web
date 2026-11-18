import { MinusIcon, PlusIcon, StarIcon } from 'lucide-react'
import { t } from '@/shared/i18n'
import { formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

/**
 * The commerce primitives every shop-like product needs. Money is always "95.000 ₫" in tabular figures; a sale shows the old price
 * struck through after the new one, and the screen reader hears both.
 */
export function Price({ amount, original, size = 'md', className }: { amount: number; original?: number | null; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sale = original != null && original > amount
  return (
    <span data-slot="price" className={cn('inline-flex items-baseline gap-1.5 tabular-nums', className)}>
      <span className={cn('font-semibold text-text', size === 'sm' ? 'text-body-sm' : size === 'lg' ? 'text-title-3' : 'text-body')}>{formatVnd(amount)}</span>
      {sale ? (
        <>
          <span className="sr-only">{t('giá cũ')}</span>
          <s className="text-caption text-text-tertiary">{formatVnd(original)}</s>
        </>
      ) : null}
    </span>
  )
}

/** A score out of 5 with how many people gave it: "★ 4,8 (126)". Without reviews it says so instead of showing 0. */
export function Rating({ score, count, className }: { score: number | null | undefined; count: number; className?: string }) {
  if (!count || score == null)
    return <span data-slot="rating" className={cn('text-caption text-text-tertiary', className)}>{t('Chưa có đánh giá')}</span>
  const value = score.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return (
    <span data-slot="rating" className={cn('inline-flex items-center gap-1 text-body-sm text-text', className)} aria-label={t('{v} trên 5 sao, {n} đánh giá', { v: value, n: count })}>
      <StarIcon aria-hidden="true" className="size-4 fill-(--bb-amber-400) text-(--bb-amber-400)" />
      <span aria-hidden="true" className="font-semibold tabular-nums">{value}</span>
      <span aria-hidden="true" className="text-text-tertiary tabular-nums">({count})</span>
    </span>
  )
}

/** How many of a dish: − value +, within min…max. At 0 the minus usually removes the line; the caller decides. */
export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  /** what is being counted, for screen readers: "Cơm gà" */
  label: string
  className?: string
}) {
  const btn =
    'inline-flex size-8 items-center justify-center rounded-control border border-border-strong bg-surface text-text transition-colors hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
  return (
    <div data-slot="quantity-stepper" role="group" aria-label={t('Số lượng {name}', { name: label })} className={cn('inline-flex items-center gap-2', className)}>
      <button type="button" className={btn} aria-label={t('Bớt một')} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <MinusIcon aria-hidden="true" className="size-4" />
      </button>
      <span aria-live="polite" className="min-w-6 text-center text-label tabular-nums">
        {value}
      </span>
      <button type="button" className={btn} aria-label={t('Thêm một')} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <PlusIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}
