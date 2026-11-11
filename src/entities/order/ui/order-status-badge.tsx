import { t } from '@/shared/i18n'
import {
  BanIcon,
  BikeIcon,
  CheckIcon,
  ChefHatIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  PackageXIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import type { OrderStatus } from '../model'

type StatusStyle = { label: string; icon: LucideIcon; className: string }

/** Label + icon + color for every status (never color alone); values from the design-tokens doc. */
const STATUS_STYLE: Record<OrderStatus, StatusStyle> = {
  PENDING_PAYMENT: { label: t('Chờ thanh toán'), icon: WalletIcon, className: 'bg-warning-subtle text-warning-fg' },
  PLACED: { label: t('Chờ quán xác nhận'), icon: ClockIcon, className: 'bg-info-subtle text-info-fg' },
  CONFIRMED: { label: t('Quán đã nhận đơn'), icon: CheckIcon, className: 'bg-info-subtle text-info-fg' },
  PREPARING: { label: t('Đang chuẩn bị'), icon: ChefHatIcon, className: 'bg-highlight-subtle text-highlight-fg' },
  OUT_FOR_DELIVERY: { label: t('Đang giao'), icon: BikeIcon, className: 'bg-accent text-accent-foreground' },
  DELIVERED: { label: t('Đã giao'), icon: CircleCheckIcon, className: 'bg-success-subtle text-success-fg' },
  CANCELLED: { label: t('Đã huỷ'), icon: CircleXIcon, className: 'bg-muted text-muted-foreground' },
  REJECTED: { label: t('Quán từ chối'), icon: BanIcon, className: 'bg-danger-subtle text-danger-fg' },
  NOT_DELIVERED: { label: t('Giao không thành công'), icon: PackageXIcon, className: 'bg-danger-subtle text-danger-fg' },
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, icon: Icon, className: tone } = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-semibold whitespace-nowrap',
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
