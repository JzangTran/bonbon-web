import { useState } from 'react'
import { Link } from 'react-router'
import { CASE_STATUS, CASE_TYPE_LABEL, useAdminCases, type CaseStatus } from '@/entities/order-case'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative, formatVnd } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { consolePath } from '@/shared/config/sites'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'

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
  const paging = usePaging()
  const cases = useAdminCases(tab, paging.page, allowed, paging.size)
  const data = cases.data
  const items = data?.items ?? []
  const total = data?.total ?? 0

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem khiếu nại về đơn hàng.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Khiếu nại đơn hàng</h1>
        <p className="text-sm text-muted-foreground">
          Khách báo vấn đề với đơn đã giao. Quán có 12 giờ để trả lời; chỉ những khiếu nại quán phản đối hoặc không trả lời mới cần bạn quyết.
        </p>
      </div>

      <PageTabs
        label="Khiếu nại đơn hàng"
        tabs={TABS.map((t) => ({ id: t.id, label: t.label, count: t.id === tab ? total : undefined }))}
        value={tab}
        onValueChange={(id) => {
          setTab(id as CaseStatus)
          paging.reset()
        }}
      />

      {cases.isError ? <FormError message={problemMessage(cases.error)} /> : null}
      {cases.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? <EmptyState title="Không có khiếu nại nào ở mục này." /> : null}

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const status = CASE_STATUS[item.status ?? ''] ?? { label: item.status ?? '', className: '' }
          return (
            <li key={item.id}>
              <Link to={consolePath(`/order-cases/${item.id}`)} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
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

      <Pagination paging={paging} total={total} />
    </div>
  )
}
