/** What each kind and state of an order case is called on screen. */
export const CASE_TYPE_LABEL: Record<string, string> = {
  NOT_RECEIVED: 'Chưa nhận được hàng',
  MISSING_ITEM: 'Thiếu món',
  WRONG_ITEM: 'Sai món',
  QUALITY: 'Chất lượng',
  CUSTOMER_NO_SHOW: 'Khách vắng mặt',
  SUSPECTED_FAKE: 'Nghi đơn ảo',
}

export const CASE_STATUS: Record<string, { label: string; className: string }> = {
  AWAITING_SHOP: { label: 'Chờ quán trả lời', className: 'bg-warning-subtle text-warning-fg' },
  AWAITING_CUSTOMER: { label: 'Chờ khách trả lời', className: 'bg-info-subtle text-info-fg' },
  OPEN: { label: 'Chờ quản trị quyết', className: 'bg-info-subtle text-info-fg' },
  UPHELD: { label: 'Được chấp nhận', className: 'bg-success-subtle text-success-fg' },
  DISMISSED: { label: 'Bị bác bỏ', className: 'bg-muted text-muted-foreground' },
}

export const LOG_ACTION_LABEL: Record<string, string> = {
  FILED: 'Khách gửi báo cáo',
  SHOP_ACCEPTED: 'Quán chấp nhận',
  SHOP_DISPUTED: 'Quán phản đối',
  NO_RESPONSE: 'Quán không trả lời kịp',
  UPHELD: 'Quản trị chấp nhận',
  DISMISSED: 'Quản trị bác bỏ',
  REOPENED: 'Mở lại để xem xét',
}

export const LOG_ACTOR_LABEL: Record<string, string> = { CUSTOMER: 'Khách', SHOP: 'Quán', ADMIN: 'Quản trị viên', SYSTEM: 'Hệ thống' }
