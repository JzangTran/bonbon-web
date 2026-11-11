import { t } from '@/shared/i18n'
/** What each kind and state of an order case is called on screen. */
export const CASE_TYPE_LABEL: Record<string, string> = {
  NOT_RECEIVED: t('Chưa nhận được hàng'),
  MISSING_ITEM: t('Thiếu món'),
  WRONG_ITEM: t('Sai món'),
  QUALITY: t('Chất lượng'),
  CUSTOMER_NO_SHOW: t('Khách vắng mặt'),
  SUSPECTED_FAKE: t('Nghi đơn ảo'),
}

export const CASE_STATUS: Record<string, { label: string; className: string }> = {
  AWAITING_SHOP: { label: t('Chờ quán trả lời'), className: 'bg-warning-subtle text-warning-fg' },
  AWAITING_CUSTOMER: { label: t('Chờ khách trả lời'), className: 'bg-info-subtle text-info-fg' },
  OPEN: { label: t('Chờ quản trị quyết'), className: 'bg-info-subtle text-info-fg' },
  UPHELD: { label: t('Được chấp nhận'), className: 'bg-success-subtle text-success-fg' },
  DISMISSED: { label: t('Bị bác bỏ'), className: 'bg-muted text-muted-foreground' },
}

export const LOG_ACTION_LABEL: Record<string, string> = {
  FILED: t('Khách gửi báo cáo'),
  SHOP_ACCEPTED: t('Quán chấp nhận'),
  SHOP_DISPUTED: t('Quán phản đối'),
  NO_RESPONSE: t('Quán không trả lời kịp'),
  UPHELD: t('Quản trị chấp nhận'),
  DISMISSED: t('Quản trị bác bỏ'),
  REOPENED: t('Mở lại để xem xét'),
  CUSTOMER_UNABLE: t('Khách không thể nhận'),
  CUSTOMER_RECEIVED: t('Khách nói đã nhận'),
  CUSTOMER_SHOP_NEVER_CAME: t('Khách nói quán không đến'),
  NO_REPLY: t('Khách không trả lời kịp'),
}

export const NO_SHOW_OUTCOME: Record<string, string> = {
  CUSTOMER_AT_FAULT: t('Lỗi của khách: đơn kết thúc, không giao được'),
  CUSTOMER_RECEIVED: t('Khách đã nhận: đơn thành đã giao'),
  SHOP_NEVER_CAME: t('Quán không đến: huỷ đơn, hoàn tiền đủ nếu đã trả online, quán bị ghi lỗi'),
}

export const CUSTOMER_ANSWER: Record<string, string> = {
  UNABLE: t('Tôi không nhận được hoặc không muốn nhận'),
  RECEIVED: t('Tôi đã nhận được'),
  SHOP_NEVER_CAME: t('Quán không đến hoặc không gọi'),
}

export const LOG_ACTOR_LABEL: Record<string, string> = { CUSTOMER: t('Khách'), SHOP: t('Quán'), ADMIN: t('Quản trị viên'), SYSTEM: t('Hệ thống') }
