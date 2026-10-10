import { useState } from 'react'
import { Link } from 'react-router'
import { CASE_STATUS, CASE_TYPE_LABEL, useAdminCases, type CaseStatus } from '@/entities/order-case'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative, formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const TABS: { id: CaseStatus; label: string }[] = [
  { id: 'OPEN', label: 'Cần quyết' },
  { id: 'AWAITING_SHOP', label: 'Chờ quán' },
  { id: 'UPHELD', label: 'Đã chấp nhận' },
  { id: 'DISMISSED', label: 'Đã bác bỏ' },
]

/** Complaints about delivered orders that the shop disputed or did not answer, waiting for a decision (review-order-cases.md). */
export function AdminOrderCasesPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('order-case:read')
  const [tab, setTab] = useState<CaseStatus>('OPEN')
  const [page, setPage] = useState(0)
  const cases = useAdminCases(tab, page, allowed)
  const data = cases.data
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const size = data?.size ?? 20

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem khiếu nại về đơn hàng.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Khiếu nại đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Khách báo vấn đề với đơn đã giao. Quán có 12 giờ để trả lời; chỉ những khiếu nại quán phản đối hoặc không trả lời mới cần bạn quyết.
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
          return (
            <li key={item.id}>
              <Link to={`/admin/order-cases/${item.id}`} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card className="gap-2 p-4 transition-colors hover:bg-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">Đơn #{item.orderNumber}</span>
                      <Badge variant="outline">{CASE_TYPE_LABEL[item.type ?? ''] ?? item.type}</Badge>
                      <Badge className={status.className}>{status.label}</Badge>
                      {item.status === 'OPEN' ? (
                        <Badge variant="outline">{item.shopResponse === 'DISPUTED' ? 'Quán phản đối' : 'Quán không trả lời'}</Badge>
                      ) : null}
                    </div>
                    <span className="text-lg font-semibold tabular-nums">{formatVnd(item.refundAmount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.vendorName} · khách {item.customerName} · {item.status === 'OPEN' ? `chờ từ ${formatRelative(item.openedAt)}` : formatDateTime(item.openedAt)}
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
