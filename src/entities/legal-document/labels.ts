import { t } from '@/shared/i18n'
import type { LegalDocumentType } from './api'

export const LEGAL_TYPES: { id: LegalDocumentType; label: string; audience: string }[] = [
  { id: 'CUSTOMER_TERMS', label: t('Điều khoản dành cho khách'), audience: t('Mọi khách hàng') },
  { id: 'SELLER_TERMS', label: t('Điều khoản dành cho người bán'), audience: t('Mọi người bán') },
  { id: 'PRIVACY_POLICY', label: t('Chính sách bảo mật'), audience: t('Khách hàng và người bán') },
]

export const LEGAL_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: t('Bản nháp'), className: 'bg-muted text-muted-foreground' },
  SCHEDULED: { label: t('Đã đăng, chờ hiệu lực'), className: 'bg-warning-subtle text-warning-fg' },
  EFFECTIVE: { label: t('Đang hiệu lực'), className: 'bg-success-subtle text-success-fg' },
  SUPERSEDED: { label: t('Đã thay bằng bản mới'), className: 'bg-muted text-muted-foreground' },
  CANCELLED: { label: t('Đã huỷ'), className: 'bg-danger-subtle text-danger-fg' },
}
