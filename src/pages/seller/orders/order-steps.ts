import type { OrderStatus } from '@/entities/order'

/** The one button that moves an order forward, by its current status. */
export const NEXT_STEP: Partial<Record<OrderStatus, { to: 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED'; label: string }>> = {
  CONFIRMED: { to: 'PREPARING', label: 'Bắt đầu chuẩn bị' },
  PREPARING: { to: 'OUT_FOR_DELIVERY', label: 'Giao đi' },
  OUT_FOR_DELIVERY: { to: 'DELIVERED', label: 'Đã giao xong' },
}
