import { useState } from 'react'
import { intlLocale, t } from '@/shared/i18n'
import { api } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { shopStatus, useApplyShop, useShop } from '@/entities/shop'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

const DURATIONS: { minutes: number | null; label: string }[] = [
  { minutes: 15, label: '15 phút' },
  { minutes: 30, label: '30 phút' },
  { minutes: 60, label: '1 giờ' },
  { minutes: 120, label: '2 giờ' },
  { minutes: null, label: 'Đến khi bật lại' },
]
const REASONS = ['Quá đông đơn', 'Hết nguyên liệu', 'Nghỉ giữa ca', 'Sự cố bếp']

const clock = (iso: string) => new Date(iso).toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' })

/**
 * The most used shop control, always in reach in the workspace header: pause or resume taking orders (pause-orders.md).
 * Pausing asks how long and why, like the pause of Uber Eats Manager and the store status of GrabMerchant: a timed pause ends by
 * itself, so a busy kitchen never forgets to switch back on. Hidden until the shop is approved.
 */
export function AcceptingOrdersSwitch() {
  const shop = useShop()
  const [asking, setAsking] = useState(false)
  const [minutes, setMinutes] = useState<number | null>(30)
  const [reason, setReason] = useState<string | null>(REASONS[0])
  const toggle = useApplyShop(
    (body: { accepting: boolean; pauseMinutes?: number; reason?: string }) => api.PUT('/api/merchant/shop/accepting-orders', { body }),
    t('Đã cập nhật trạng thái nhận đơn. Khách thấy thay đổi trên trang quán ngay.'),
  )
  if (shopStatus(shop.data) !== 'APPROVED') return null
  const accepting = shop.data?.acceptingOrders ?? false
  const until = shop.data?.pausedUntil

  return (
    <>
      <button
        type="button"
        role="switch"
        aria-checked={accepting}
        disabled={toggle.isPending}
        onClick={() => (accepting ? setAsking(true) : toggle.mutate({ accepting: true }))}
        className="flex shrink-0 items-center gap-2 rounded-full px-1 py-1 text-xs whitespace-nowrap font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        title={!accepting && shop.data?.pauseReason ? shop.data.pauseReason : undefined}
      >
        <span className="hidden sm:inline">
          {accepting ? t('Đang nhận đơn') : until ? t('Tạm ngưng đến {v0}', { v0: clock(until) }) : t('Tạm ngưng nhận đơn')}
        </span>
        <span aria-hidden="true" className={cn('relative inline-block h-[18px] w-[30px] rounded-full transition-colors', accepting ? 'bg-primary' : 'bg-input')}>
          <span className={cn('absolute top-0.5 size-3.5 rounded-full bg-white transition-all', accepting ? 'left-[14px]' : 'left-0.5')} />
        </span>
      </button>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('Tạm ngưng nhận đơn')}</DialogTitle>
            <DialogDescription>{t('Khách sẽ thấy quán tạm ngưng. Đơn đã nhận vẫn làm tiếp như thường.')}</DialogDescription>
          </DialogHeader>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">{t('Trong bao lâu')}</legend>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <Button key={d.label} type="button" size="sm" variant={minutes === d.minutes ? 'default' : 'outline'} aria-pressed={minutes === d.minutes}
                  onClick={() => setMinutes(d.minutes)}>
                  {t(d.label)}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">{t('Lý do (không bắt buộc)')}</legend>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <Button key={r} type="button" size="sm" variant={reason === r ? 'secondary' : 'outline'} aria-pressed={reason === r}
                  onClick={() => setReason(reason === r ? null : r)}>
                  {t(r)}
                </Button>
              ))}
            </div>
          </fieldset>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAsking(false)}>
              {t('Huỷ')}
            </Button>
            <Button
              type="button"
              disabled={toggle.isPending}
              onClick={() =>
                toggle.mutate(
                  { accepting: false, pauseMinutes: minutes ?? undefined, reason: reason ?? undefined },
                  { onSuccess: () => setAsking(false) },
                )
              }
            >
              {t('Tạm ngưng')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
