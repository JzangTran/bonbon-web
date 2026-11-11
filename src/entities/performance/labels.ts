import { t } from '@/shared/i18n'
/** What each way of failing an order, and each consequence of penalty points, is called on screen. */
export const FAULT_LABEL: Record<string, string> = {
  SHOP_REJECTED: t('Quán từ chối đơn'),
  NO_RESPONSE: t('Quán không trả lời kịp'),
  HANDOVER_TIMEOUT: t('Không giao đi kịp sau khi nhận'),
  SHOP_CANCELLED: t('Quán huỷ sau khi nhận'),
  INCIDENT_FULL_REFUND: t('Khiếu nại được hoàn cả đơn'),
  NO_SHOW_SHOP_AT_FAULT: t('Quán không đến khi giao'),
}

export const CONSEQUENCE: Record<string, { label: string; className: string }> = {
  NONE: { label: t('Bình thường'), className: 'bg-success-subtle text-success-fg' },
  WARNING: { label: t('Cảnh báo'), className: 'bg-warning-subtle text-warning-fg' },
  RESTRICTION_SCHEDULED: { label: t('Sắp bị hạn chế hiển thị'), className: 'bg-warning-subtle text-warning-fg' },
  RESTRICTED: { label: t('Đang bị hạn chế hiển thị'), className: 'bg-danger-subtle text-danger-fg' },
}

export const APPEAL_LABEL: Record<string, string> = {
  PENDING: t('Kháng nghị đang chờ'),
  ACCEPTED: t('Kháng nghị được chấp nhận'),
  REJECTED: t('Kháng nghị không được chấp nhận'),
}
