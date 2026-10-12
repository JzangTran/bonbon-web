import type { LegalDocumentType } from './api'

export const LEGAL_TYPES: { id: LegalDocumentType; label: string; audience: string }[] = [
  { id: 'CUSTOMER_TERMS', label: 'Điều khoản dành cho khách', audience: 'Mọi khách hàng' },
  { id: 'SELLER_TERMS', label: 'Điều khoản dành cho người bán', audience: 'Mọi người bán' },
  { id: 'PRIVACY_POLICY', label: 'Chính sách bảo mật', audience: 'Khách hàng và người bán' },
]

export const LEGAL_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Bản nháp', className: 'bg-muted text-muted-foreground' },
  SCHEDULED: { label: 'Đã đăng, chờ hiệu lực', className: 'bg-warning-subtle text-warning-fg' },
  EFFECTIVE: { label: 'Đang hiệu lực', className: 'bg-success-subtle text-success-fg' },
  SUPERSEDED: { label: 'Đã thay bằng bản mới', className: 'bg-muted text-muted-foreground' },
  CANCELLED: { label: 'Đã huỷ', className: 'bg-danger-subtle text-danger-fg' },
}
