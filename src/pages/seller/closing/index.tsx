import { CheckCircle2Icon, CircleDashedIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { CLOSE_REASON_LABEL, shopStatus, useShop, useShopClosure } from '@/entities/shop'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { merchantPath } from '@/shared/config/sites'

/** A shop that asked to close: no new orders, what is under way finishes, and it becomes CLOSED once nothing is left (close-shop.md). */
export function SellerClosingPage() {
  const shop = useShop()
  const status = shopStatus(shop.data)
  const closure = useShopClosure(status === 'CLOSING')

  if (shop.isPending) return <Skeleton className="h-64 max-w-3xl" />
  if (status === 'CLOSED') {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-2xl font-bold">Cửa hàng đã đóng</h1>
        <p className="text-muted-foreground">Mọi việc đã xong và cửa hàng đã đóng. Muốn bán lại, hãy mở một cửa hàng mới hoặc liên hệ hỗ trợ.</p>
      </div>
    )
  }
  if (status !== 'CLOSING') {
    return <p className="text-muted-foreground">Cửa hàng không đang trong quá trình đóng.</p>
  }
  const c = closure.data
  const b = c?.blockers

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Cửa hàng đang đóng</h1>
        <p className="text-sm text-muted-foreground">
          Cửa hàng không còn hiện với khách và không nhận đơn mới. Các đơn đang làm vẫn làm tiếp, và bạn vẫn xem được thu nhập. Cửa hàng tự đóng hẳn khi tất cả các việc dưới đây xong; đóng rồi không mở lại được.
        </p>
      </div>
      {closure.isError ? <FormError message={problemMessage(closure.error)} /> : null}
      {closure.isPending ? <Skeleton className="h-48" /> : null}
      {c && b ? (
        <>
          <Card size="sm">
            <CardContent className="text-sm">
              Lý do: <b>{CLOSE_REASON_LABEL[c.reason ?? ''] ?? c.reason}</b>
              {c.reasonText ? ` — ${c.reasonText}` : ''} · yêu cầu lúc {formatDateTime(c.requestedAt)}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>{b.ready ? 'Mọi việc đã xong' : 'Còn chờ'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {b.ready ? <p className="text-sm text-success-fg">Không còn gì chặn. Cửa hàng sẽ được đóng hẳn trong ít phút.</p> : null}
              <Item done={(b.ordersInProgress ?? 0) === 0} title="Đơn đang làm" detail={`${b.ordersInProgress} đơn chưa giao xong`} to={merchantPath('/orders')} action="Xem đơn hàng" />
              <Item done={(b.openCases ?? 0) === 0} title="Khiếu nại" detail={`${b.openCases} khiếu nại chưa xong`} to={merchantPath('/order-cases')} action="Xem khiếu nại" />
              <Item done={(b.pendingAppeals ?? 0) === 0} title="Kháng nghị điểm phạt" detail={`${b.pendingAppeals} kháng nghị chờ quản trị viên`} to={merchantPath('/performance')} action="Xem hiệu suất" />
              <Item done={(b.heldForCases ?? 0) === 0} title="Tiền đang giữ cho khiếu nại" detail={`${formatVnd(b.heldForCases)} được giải phóng khi khiếu nại xong`} to={merchantPath('/earnings')} action="Xem thu nhập" />
              <Item
                done={(b.balance ?? 0) === 0}
                title="Số dư sổ cái"
                detail={
                  (b.balance ?? 0) > 0
                    ? `Nền tảng nợ bạn ${formatVnd(b.balance)}: sẽ được chi trả vào tài khoản nhận tiền`
                    : `Bạn nợ nền tảng ${formatVnd(Math.abs(b.balance ?? 0))} (hoa hồng đơn tiền mặt): hãy liên hệ hỗ trợ để thanh toán hoặc được xử lý`
                }
                to={(b.balance ?? 0) > 0 ? merchantPath('/earnings') : merchantPath('/support-tickets')}
                action={(b.balance ?? 0) > 0 ? 'Xem thu nhập' : 'Liên hệ hỗ trợ'}
              />
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function Item({ done, title, detail, to, action }: { done: boolean; title: string; detail: string; to: string; action: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      {done ? <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-success-fg" /> : <CircleDashedIcon className="mt-0.5 size-5 shrink-0 text-warning-fg" />}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-medium">{title}</span>
        <span className={done ? 'text-muted-foreground' : ''}>{done ? 'Xong' : detail}</span>
      </div>
      {!done ? (
        <Link to={to} className="shrink-0 text-primary hover:underline">
          {action}
        </Link>
      ) : null}
    </div>
  )
}
