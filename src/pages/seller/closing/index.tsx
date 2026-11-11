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
import { t } from '@/shared/i18n'

/** A shop that asked to close: no new orders, what is under way finishes, and it becomes CLOSED once nothing is left (close-shop.md). */
export function SellerClosingPage() {
  const shop = useShop()
  const status = shopStatus(shop.data)
  const closure = useShopClosure(status === 'CLOSING')

  if (shop.isPending) return <Skeleton className="h-64 max-w-3xl" />
  if (status === 'CLOSED') {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <h1 className="text-2xl font-semibold">{t('Cửa hàng đã đóng')}</h1>
        <p className="text-muted-foreground">{t('Mọi việc đã xong và cửa hàng đã đóng. Muốn bán lại, hãy mở một cửa hàng mới hoặc liên hệ hỗ trợ.')}</p>
      </div>
    )
  }
  if (status !== 'CLOSING') {
    return <p className="text-muted-foreground">{t('Cửa hàng không đang trong quá trình đóng.')}</p>
  }
  const c = closure.data
  const b = c?.blockers

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">{t('Cửa hàng đang đóng')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Cửa hàng không còn hiện với khách và không nhận đơn mới. Các đơn đang làm vẫn làm tiếp, và bạn vẫn xem được thu nhập. Cửa hàng tự đóng hẳn khi tất cả các việc dưới đây xong; đóng rồi không mở lại được.')}
        </p>
      </div>
      {closure.isError ? <FormError message={problemMessage(closure.error)} /> : null}
      {closure.isPending ? <Skeleton className="h-48" /> : null}
      {c && b ? (
        <>
          <Card size="sm">
            <CardContent className="text-sm">
              {t('Lý do: ')}<b>{CLOSE_REASON_LABEL[c.reason ?? ''] ?? c.reason}</b>
              {c.reasonText ? ` — ${c.reasonText}` : ''}{t(' · yêu cầu lúc ')}{formatDateTime(c.requestedAt)}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>{b.ready ? t('Mọi việc đã xong') : t('Còn chờ')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {b.ready ? <p className="text-sm text-success-fg">{t('Không còn gì chặn. Cửa hàng sẽ được đóng hẳn trong ít phút.')}</p> : null}
              <Item done={(b.ordersInProgress ?? 0) === 0} title={t('Đơn đang làm')} detail={t('{v0} đơn chưa giao xong', { v0: b.ordersInProgress })} to={merchantPath('/orders')} action={t('Xem đơn hàng')} />
              <Item done={(b.openCases ?? 0) === 0} title={t('Khiếu nại')} detail={t('{v0} khiếu nại chưa xong', { v0: b.openCases })} to={merchantPath('/order-cases')} action={t('Xem khiếu nại')} />
              <Item done={(b.pendingAppeals ?? 0) === 0} title={t('Kháng nghị điểm phạt')} detail={t('{v0} kháng nghị chờ quản trị viên', { v0: b.pendingAppeals })} to={merchantPath('/performance')} action={t('Xem hiệu suất')} />
              <Item done={(b.heldForCases ?? 0) === 0} title={t('Tiền đang giữ cho khiếu nại')} detail={t('{v0} được giải phóng khi khiếu nại xong', { v0: formatVnd(b.heldForCases) })} to={merchantPath('/earnings')} action={t('Xem thu nhập')} />
              <Item
                done={(b.balance ?? 0) === 0}
                title={t('Số dư sổ cái')}
                detail={
                  (b.balance ?? 0) > 0
                    ? t('Nền tảng nợ bạn {v0}: sẽ được chi trả vào tài khoản nhận tiền', { v0: formatVnd(b.balance) })
                    : t('Bạn nợ nền tảng {v0} (hoa hồng đơn tiền mặt): hãy liên hệ hỗ trợ để thanh toán hoặc được xử lý', { v0: formatVnd(Math.abs(b.balance ?? 0)) })
                }
                to={(b.balance ?? 0) > 0 ? merchantPath('/earnings') : merchantPath('/support-tickets')}
                action={(b.balance ?? 0) > 0 ? t('Xem thu nhập') : t('Liên hệ hỗ trợ')}
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
        <Link to={to} className="text-link shrink-0">
          {action}
        </Link>
      ) : null}
    </div>
  )
}
