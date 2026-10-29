import { ArrowLeftIcon, EyeIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { RevealDialog, useAdminOrder, useRevealOrder } from '@/entities/lookup'
import { CASE_STATUS, CASE_TYPE_LABEL } from '@/entities/order-case'
import { OrderStatusBadge, type OrderStatus } from '@/entities/order'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { consolePath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

const STATUS: Record<string, string> = {
  PENDING_PAYMENT: t('Chờ thanh toán'),
  PLACED: t('Chờ quán xác nhận'),
  CONFIRMED: t('Quán đã nhận'),
  PREPARING: t('Đang chuẩn bị'),
  OUT_FOR_DELIVERY: t('Đang giao'),
  DELIVERED: t('Đã giao'),
  CANCELLED: t('Đã huỷ'),
  REJECTED: t('Quán từ chối'),
  NOT_DELIVERED: t('Giao không thành công'),
}

const ACTOR: Record<string, string> = { CUSTOMER: t('Khách'), SHOP: t('Quán'), SYSTEM: t('Hệ thống'), ADMIN: t('Quản trị') }

/** Everything about one order for a dispute: what was ordered, the money, who did what and when, the cases, the chat. Read only. */
export function AdminLookupOrderPage() {
  const { id = '' } = useParams()
  const { session } = useSession()
  const canChat = !!session?.permissions.has('admin-conversation:read')
  const order = useAdminOrder(id)
  const reveal = useRevealOrder(id)
  const [asking, setAsking] = useState(false)
  const o = order.data
  const full = reveal.data

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <Link to={consolePath('/lookup')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />{t(' Tra cứu')}
      </Link>
      {order.isError ? <FormError message={problemMessage(order.error)} /> : null}
      {order.isPending ? <Skeleton className="h-64" /> : null}
      {o ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{t('Đơn #')}{o.number}</h1>
            <OrderStatusBadge status={(o.status ?? 'PLACED') as OrderStatus} />
            <Badge variant="outline">{o.paymentMethod === 'COD' ? t('Tiền mặt') : 'MoMo'}</Badge>
          </div>

          <Card className="gap-2 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{t('Liên hệ')}</h2>
              {full ? <Badge className="bg-warning-subtle text-warning-fg">{t('Đang xem đầy đủ, đã ghi nhật ký')}</Badge> : <Button size="sm" variant="outline" onClick={() => setAsking(true)}><EyeIcon />{t(' Xem đầy đủ')}</Button>}
            </div>
            <p>
              <span className="text-muted-foreground">{t('Quán:')}</span> {o.shopName}
            </p>
            <p>
              <span className="text-muted-foreground">{t('Tài khoản khách:')}</span> {o.customer?.name} · {full?.customerEmail ?? o.customer?.email ?? '–'} · {full?.customerPhone ?? o.customer?.phone ?? '–'}
            </p>
            <p>
              <span className="text-muted-foreground">{t('Người nhận:')}</span> {o.deliveryName} · {full?.deliveryPhone ?? o.deliveryPhone}
            </p>
            <p>
              <span className="text-muted-foreground">{t('Địa chỉ:')}</span> {full?.deliveryAddress ?? o.deliveryAddress}
            </p>
            {o.note ? (
              <p>
                <span className="text-muted-foreground">{t('Ghi chú:')}</span> {o.note}
              </p>
            ) : null}
            {o.customer?.id ? (
              <Link className="text-link" to={consolePath(`/lookup/customers/${o.customer.id}`)}>
                {t('Tra cứu tài khoản khách')}
              </Link>
            ) : null}
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">{t('Món đã đặt')}</h2>
            <ul className="flex flex-col gap-2">
              {(o.items ?? []).map((i, n) => (
                <li key={n} className="flex justify-between gap-3">
                  <div>
                    <p>
                      {i.quantity} × {i.name}
                    </p>
                    {(i.options ?? []).map((op, k) => (
                      <p key={k} className="text-xs text-muted-foreground">
                        {op.group}: {op.name}
                      </p>
                    ))}
                    {i.note ? <p className="text-xs text-muted-foreground">{t('Ghi chú: ')}{i.note}</p> : null}
                  </div>
                  <span className="tabular-nums">{formatVnd(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t pt-2">
              <dt className="text-muted-foreground">{t('Tiền món')}</dt>
              <dd className="tabular-nums">{formatVnd(o.itemsTotal)}</dd>
              <dt className="text-muted-foreground">{t('Giảm giá')}</dt>
              <dd className="tabular-nums">−{formatVnd(o.discount)}</dd>
              <dt className="text-muted-foreground">{t('Phí giao')}</dt>
              <dd className="tabular-nums">{formatVnd(o.deliveryFee)}</dd>
              <dt className="font-semibold">{t('Tổng')}</dt>
              <dd className="font-semibold tabular-nums">{formatVnd(o.grandTotal)}</dd>
              <dt className="text-muted-foreground">{t('Hoa hồng nền tảng')}</dt>
              <dd className="tabular-nums">{formatVnd(o.commissionAmount)}</dd>
            </dl>
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">{t('Thanh toán')}</h2>
            {o.payment ? (
              <>
                <p>
                  {o.payment.method === 'COD' ? t('Tiền mặt') : o.payment.provider ?? t('Trực tuyến')} · {o.payment.status} · {formatVnd(o.payment.amount)}
                  {o.payment.refundedAmount ? t(' · đã hoàn {v0}', { v0: formatVnd(o.payment.refundedAmount) }) : ''}
                </p>
                {(o.payment.refunds ?? []).map((r, n) => (
                  <p key={n} className="text-muted-foreground">
                    {t('Hoàn ')}{formatVnd(r.amount)} ({r.reason}) · {r.status} · {r.mode === 'MANUAL' ? t('chuyển khoản tay') : t('qua cổng')} · {formatDateTime(r.requestedAt)}
                  </p>
                ))}
              </>
            ) : (
              <p className="text-muted-foreground">{t('Chưa có thanh toán.')}</p>
            )}
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">{t('Diễn biến')}</h2>
            <ol className="flex flex-col gap-2">
              {(o.timeline ?? []).map((s, n) => (
                <li key={n} className="flex flex-wrap justify-between gap-2">
                  <span>
                    <span className="font-medium">{ACTOR[s.by ?? ''] ?? s.by}</span>: {s.from ? `${STATUS[s.from] ?? s.from} → ` : ''}
                    {STATUS[s.to ?? ''] ?? s.to}
                    {s.reason ? ` (${s.reason})` : ''}
                  </span>
                  <span className="text-muted-foreground">{formatDateTime(s.at)}</span>
                </li>
              ))}
            </ol>
          </Card>

          {(o.cases ?? []).length > 0 ? (
            <Card className="gap-2 p-4 text-sm">
              <h2 className="font-semibold">{t('Khiếu nại')}</h2>
              {(o.cases ?? []).map((c) => {
                const st = CASE_STATUS[c.status ?? ''] ?? { label: c.status ?? '', className: '' }
                return (
                  <Link key={c.id} to={consolePath(`/order-cases/${c.id}`)} className="flex flex-wrap items-center gap-2 text-primary underline">
                    {CASE_TYPE_LABEL[c.type ?? ''] ?? c.type}
                    <Badge className={st.className}>{st.label}</Badge>
                    <span className="text-muted-foreground no-underline">{formatVnd(c.refundAmount)}</span>
                  </Link>
                )
              })}
            </Card>
          ) : null}

          {o.conversationId ? (
            <Card className="gap-1 p-4 text-sm">
              <h2 className="font-semibold">{t('Trò chuyện giữa khách và quán')}</h2>
              {canChat ? (
                <Link className="text-link" to={consolePath(`/conversations/${o.conversationId}`)}>
                  {t('Đọc cuộc trò chuyện (được ghi nhật ký)')}
                </Link>
              ) : (
                <p className="text-muted-foreground">{t('Có cuộc trò chuyện, nhưng bạn không có quyền đọc.')}</p>
              )}
            </Card>
          ) : null}

          {asking ? (
            <RevealDialog
              pending={reveal.isPending}
              error={reveal.error}
              onClose={() => setAsking(false)}
              onSubmit={(input) => reveal.mutate(input, { onSuccess: () => setAsking(false) })}
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
