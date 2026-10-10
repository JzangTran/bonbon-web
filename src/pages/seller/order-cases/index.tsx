import { useState } from 'react'
import { Link } from 'react-router'
import { CASE_STATUS, CASE_TYPE_LABEL, useShopCases, type CaseStatus } from '@/entities/order-case'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const TABS: { id: CaseStatus; label: string }[] = [
  { id: 'AWAITING_SHOP', label: 'Chờ quán trả lời' },
  { id: 'OPEN', label: 'Chờ quản trị' },
  { id: 'UPHELD', label: 'Đã chấp nhận' },
  { id: 'DISMISSED', label: 'Đã bác bỏ' },
]

/** What customers reported about this shop's delivered orders (respond-to-order-case.md). */
export function SellerOrderCasesPage() {
  const [tab, setTab] = useState<CaseStatus>('AWAITING_SHOP')
  const [page, setPage] = useState(0)
  const cases = useShopCases(tab, page)
  const now = useNow(60_000)
  const data = cases.data
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const size = data?.size ?? 20

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Khiếu nại của khách</h1>
        <p className="text-sm text-muted-foreground">
          Khách báo chưa nhận được hàng, thiếu món, sai món hoặc chất lượng. Bạn có 12 giờ để chấp nhận (khách được hoàn tiền) hoặc phản đối (quản trị viên quyết định). Không trả lời kịp cũng chuyển cho quản trị viên.
        </p>
      </div>

      <div role="tablist" className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id)
              setPage(0)
            }}
            className={cn(
              '-mb-px min-h-10 border-b-2 px-3 text-sm whitespace-nowrap',
              tab === t.id ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {t.label}
            {tab === t.id && total > 0 ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {cases.isError ? <FormError message={problemMessage(cases.error)} /> : null}
      {cases.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? <Card className="p-6 text-muted-foreground">Không có khiếu nại nào ở mục này.</Card> : null}

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const status = CASE_STATUS[item.status ?? ''] ?? { label: item.status ?? '', className: '' }
          const hoursLeft = item.status === 'AWAITING_SHOP' && item.shopResponseDueAt ? Math.max(0, Math.ceil((new Date(item.shopResponseDueAt).getTime() - now) / 3_600_000)) : null
          return (
            <li key={item.id}>
              <Link to={`/seller/order-cases/${item.id}`} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card className="gap-2 p-4 transition-colors hover:bg-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Đơn #{item.orderNumber}</span>
                      <Badge variant="outline">{CASE_TYPE_LABEL[item.type ?? ''] ?? item.type}</Badge>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">{formatVnd(item.shopBears)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Khách được hoàn {formatVnd(item.refundAmount)}; quán chịu {formatVnd(item.shopBears)} · {formatDateTime(item.openedAt)}
                    {hoursLeft !== null ? ` · còn khoảng ${hoursLeft} giờ để trả lời` : ''}
                  </p>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>

      {total > size ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {Math.ceil(total / size)}
          </span>
          <Button variant="outline" disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
            Trang sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}
