import { api } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { shopStatus, useApplyShop, useShop } from '@/entities/shop'

/**
 * The most used shop control, always in reach in the workspace header: pause or resume taking orders (pause-orders.md).
 * Hidden until the shop is approved. Meant for the dark header, so it uses light text.
 */
export function AcceptingOrdersSwitch() {
  const shop = useShop()
  const toggle = useApplyShop(
    (accepting: boolean) => api.PUT('/api/merchant/shop/accepting-orders', { body: { accepting } }),
    'Đã cập nhật trạng thái nhận đơn.',
  )
  if (shopStatus(shop.data) !== 'APPROVED') return null
  const accepting = shop.data?.acceptingOrders ?? false
  return (
    <button
      type="button"
      role="switch"
      aria-checked={accepting}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate(!accepting)}
      className="flex items-center gap-2 rounded-md px-1 py-1 text-xs font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
    >
      <span className="hidden sm:inline">{accepting ? 'Đang nhận đơn' : 'Tạm ngưng nhận đơn'}</span>
      <span aria-hidden="true" className={cn('relative inline-block h-[18px] w-[30px] rounded-full transition-colors', accepting ? 'bg-[#3CC77A]' : 'bg-[#5E7066]')}>
        <span className={cn('absolute top-0.5 size-3.5 rounded-full bg-ws-header transition-all', accepting ? 'left-[14px]' : 'left-0.5')} />
      </span>
    </button>
  )
}
