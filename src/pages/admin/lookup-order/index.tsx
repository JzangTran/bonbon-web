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

const STATUS: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PLACED: 'Chờ quán xác nhận',
  CONFIRMED: 'Quán đã nhận',
  PREPARING: 'Đang chuẩn bị',
  OUT_FOR_DELIVERY: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
  REJECTED: 'Quán từ chối',
  NOT_DELIVERED: 'Giao không thành công',
}

const ACTOR: Record<string, string> = { CUSTOMER: 'Khách', SHOP: 'Quán', SYSTEM: 'Hệ thống', ADMIN: 'Quản trị' }

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
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to="/admin/lookup" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Tra cứu
      </Link>
      {order.isError ? <FormError message={problemMessage(order.error)} /> : null}
      {order.isPending ? <Skeleton className="h-64" /> : null}
      {o ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">Đơn #{o.number}</h1>
            <OrderStatusBadge status={(o.status ?? 'PLACED') as OrderStatus} />
            <Badge variant="outline">{o.paymentMethod === 'COD' ? 'Tiền mặt' : 'MoMo'}</Badge>
          </div>

          <Card className="gap-2 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Liên hệ</h2>
              {full ? <Badge className="bg-warning-subtle text-warning-fg">Đang xem đầy đủ, đã ghi nhật ký</Badge> : <Button size="sm" variant="outline" onClick={() => setAsking(true)}><EyeIcon /> Xem đầy đủ</Button>}
            </div>
            <p>
              <span className="text-muted-foreground">Quán:</span> {o.shopName}
            </p>
            <p>
              <span className="text-muted-foreground">Tài khoản khách:</span> {o.customer?.name} · {full?.customerEmail ?? o.customer?.email ?? '–'} · {full?.customerPhone ?? o.customer?.phone ?? '–'}
            </p>
            <p>
              <span className="text-muted-foreground">Người nhận:</span> {o.deliveryName} · {full?.deliveryPhone ?? o.deliveryPhone}
            </p>
            <p>
              <span className="text-muted-foreground">Địa chỉ:</span> {full?.deliveryAddress ?? o.deliveryAddress}
            </p>
            {o.note ? (
              <p>
                <span className="text-muted-foreground">Ghi chú:</span> {o.note}
              </p>
            ) : null}
            {o.customer?.id ? (
              <Link className="text-primary underline" to={`/admin/lookup/customers/${o.customer.id}`}>
                Tra cứu tài khoản khách
              </Link>
            ) : null}
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">Món đã đặt</h2>
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
                    {i.note ? <p className="text-xs text-muted-foreground">Ghi chú: {i.note}</p> : null}
                  </div>
                  <span className="tabular-nums">{formatVnd(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t pt-2">
              <dt className="text-muted-foreground">Tiền món</dt>
              <dd className="tabular-nums">{formatVnd(o.itemsTotal)}</dd>
              <dt className="text-muted-foreground">Giảm giá</dt>
              <dd className="tabular-nums">−{formatVnd(o.discount)}</dd>
              <dt className="text-muted-foreground">Phí giao</dt>
              <dd className="tabular-nums">{formatVnd(o.deliveryFee)}</dd>
              <dt className="font-semibold">Tổng</dt>
              <dd className="font-semibold tabular-nums">{formatVnd(o.grandTotal)}</dd>
              <dt className="text-muted-foreground">Hoa hồng nền tảng</dt>
              <dd className="tabular-nums">{formatVnd(o.commissionAmount)}</dd>
            </dl>
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">Thanh toán</h2>
            {o.payment ? (
              <>
                <p>
                  {o.payment.method === 'COD' ? 'Tiền mặt' : o.payment.provider ?? 'Trực tuyến'} · {o.payment.status} · {formatVnd(o.payment.amount)}
                  {o.payment.refundedAmount ? ` · đã hoàn ${formatVnd(o.payment.refundedAmount)}` : ''}
                </p>
                {(o.payment.refunds ?? []).map((r, n) => (
                  <p key={n} className="text-muted-foreground">
                    Hoàn {formatVnd(r.amount)} ({r.reason}) · {r.status} · {r.mode === 'MANUAL' ? 'chuyển khoản tay' : 'qua cổng'} · {formatDateTime(r.requestedAt)}
                  </p>
                ))}
              </>
            ) : (
              <p className="text-muted-foreground">Chưa có thanh toán.</p>
            )}
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">Diễn biến</h2>
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
              <h2 className="font-semibold">Khiếu nại</h2>
              {(o.cases ?? []).map((c) => {
                const st = CASE_STATUS[c.status ?? ''] ?? { label: c.status ?? '', className: '' }
                return (
                  <Link key={c.id} to={`/admin/order-cases/${c.id}`} className="flex flex-wrap items-center gap-2 text-primary underline">
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
              <h2 className="font-semibold">Trò chuyện giữa khách và quán</h2>
              {canChat ? (
                <Link className="text-primary underline" to={`/admin/conversations/${o.conversationId}`}>
                  Đọc cuộc trò chuyện (được ghi nhật ký)
                </Link>
              ) : (
                <p className="text-muted-foreground">Có cuộc trò chuyện, nhưng bạn không có quyền đọc.</p>
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
