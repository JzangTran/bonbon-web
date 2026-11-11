import { t } from '@/shared/i18n'
import { PhoneIcon } from 'lucide-react'
import { OrderStatusBadge, useShopOrder, type OrderStatus } from '@/entities/order'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { OrderActions } from './order-actions'
import { countdown, useNow } from './use-now'

const ACTORS: Record<string, string> = { CUSTOMER: t('Khách'), SHOP: t('Quán'), SYSTEM: t('Hệ thống'), ADMIN: t('Quản trị') }

/** One order in full: contact, items with options and notes, totals, timeline, and the actions it allows. */
export function OrderSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const order = useShopOrder(id)
  const now = useNow()
  const data = order.data
  const status = data?.status as OrderStatus | undefined
  const response = countdown(data?.responseDeadline, now)
  const handover = countdown(data?.handoverDeadline, now)

  return (
    <Sheet open={id !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{data ? t('Đơn #{v0}', { v0: data.number }) : t('Đơn hàng')}</SheetTitle>
          <SheetDescription>{data ? t('Đặt lúc {v0}', { v0: formatDateTime(data.placedAt) }) : t('Đang tải…')}</SheetDescription>
        </SheetHeader>
        {order.isPending ? <Skeleton className="mx-4 h-64" /> : null}
        {order.isError ? (
          <div className="px-4">
            <FormError message={problemMessage(order.error, t('Không tìm thấy đơn hàng này.'))} />
          </div>
        ) : null}
        {data && status ? (
          <div className="flex flex-col gap-6 px-4 pb-6">
            <div className="flex flex-wrap items-center gap-3">
              <OrderStatusBadge status={status} />
              {response ? (
                <span className={response.urgent ? 'font-semibold text-destructive' : 'text-sm text-muted-foreground'}>
                  {t('Còn ')}{response.text}{t(' để trả lời')}
                </span>
              ) : null}
              {handover ? (
                <span className={handover.urgent ? 'font-semibold text-destructive' : 'text-sm text-muted-foreground'}>
                  {t('Hạn giao đi: ')}{handover.text}
                </span>
              ) : null}
            </div>

            <OrderActions id={data.id!} status={status} size="lg" />

            <section className="flex flex-col gap-1">
              <h3 className="font-semibold">{t('Khách')}</h3>
              <p>{data.customerName}</p>
              <p className="flex items-center gap-2 tabular-nums">
                <PhoneIcon className="size-4" aria-hidden="true" />
                {data.contactMasked ? (
                  data.customerPhone
                ) : (
                  <a className="text-link" href={`tel:${data.customerPhone}`}>
                    {data.customerPhone}
                  </a>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{data.deliveryAddress}</p>
              {data.note ? <p className="mt-1 rounded-sm bg-highlight-subtle px-3 py-2 text-sm text-highlight-fg">{t('Ghi chú giao hàng: ')}{data.note}</p> : null}
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="font-semibold">{t('Món')}</h3>
              <ul className="divide-y rounded-sm border">
                {(data.items ?? []).map((line, index) => (
                  <li key={index} className="flex gap-3 px-3 py-2">
                    <span className="w-8 font-semibold tabular-nums">{line.quantity}×</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{line.name}</p>
                      {(line.options ?? []).length > 0 ? (
                        <p className="text-sm text-muted-foreground">{(line.options ?? []).map((o) => o.name).join(', ')}</p>
                      ) : null}
                      {line.note ? <p className="text-sm text-highlight-fg">{t('Ghi chú: ')}{line.note}</p> : null}
                    </div>
                    <span className="tabular-nums">{formatVnd(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="ml-auto grid w-64 grid-cols-2 gap-y-1 text-sm">
                <dt className="text-muted-foreground">{t('Tiền món')}</dt>
                <dd className="text-right tabular-nums">{formatVnd(data.totals?.itemsTotal)}</dd>
                <dt className="text-muted-foreground">{t('Phí giao')}</dt>
                <dd className="text-right tabular-nums">{formatVnd(data.totals?.deliveryFee)}</dd>
                <dt className="font-semibold">{t('Khách trả')}</dt>
                <dd className="text-right font-semibold tabular-nums">{formatVnd(data.totals?.grandTotal)}</dd>
              </dl>
              <p className="text-sm text-muted-foreground">
                {data.paymentMethod === 'COD'
                  ? `Thu tiền mặt khi giao · ${data.paymentStatus === 'PAID' ? t('đã thu tiền') : t('chưa thu')}`
                  : t('Khách đã thanh toán qua MoMo · không thu tiền khi giao')}
              </p>
            </section>

            <section className="flex flex-col gap-2">
              <h3 className="font-semibold">{t('Lịch sử đơn')}</h3>
              <ol className="flex flex-col gap-2 border-l pl-4">
                {(data.timeline ?? []).map((step, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{step.to ? STATUS_LABELS[step.to] ?? step.to : ''}</span>
                    <span className="text-muted-foreground">
                      {' '}
                      · {ACTORS[step.by ?? ''] ?? step.by} · {formatDateTime(step.at)}
                    </span>
                    {step.reason ? <p className="text-muted-foreground">{t('Lý do: ')}{step.reason}</p> : null}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

const STATUS_LABELS: Record<string, string> = {
  PLACED: t('Khách đặt đơn'),
  CONFIRMED: t('Quán nhận đơn'),
  PREPARING: t('Đang chuẩn bị'),
  OUT_FOR_DELIVERY: t('Đang giao'),
  DELIVERED: t('Đã giao'),
  REJECTED: t('Quán từ chối'),
  CANCELLED: t('Đã huỷ'),
  NOT_DELIVERED: t('Giao không thành công'),
}
