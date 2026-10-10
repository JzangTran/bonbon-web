import { useState } from 'react'
import { Link } from 'react-router'
import { TICKET_STATUS, useTicketInbox, type TicketStatus } from '@/entities/support-ticket'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const TABS: { id: TicketStatus; label: string }[] = [
  { id: 'OPEN', label: 'Chờ trả lời' },
  { id: 'ANSWERED', label: 'Đã trả lời' },
  { id: 'CLOSED', label: 'Đã đóng' },
]

/** The support inbox (support-tickets.md): the ticket that has waited longest is on top. */
export function AdminSupportTicketsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('ticket:read')
  const [tab, setTab] = useState<TicketStatus>('OPEN')
  const [page, setPage] = useState(0)
  const inbox = useTicketInbox(tab, page, allowed)
  const items = inbox.data?.items ?? []
  const total = inbox.data?.total ?? 0
  const size = inbox.data?.size ?? 20

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem phiếu hỗ trợ.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Phiếu hỗ trợ</h1>
        <p className="text-sm text-muted-foreground">Khách và người bán hỏi những việc chưa có hướng dẫn. Vấn đề về đơn đã giao đi qua khiếu nại, không qua đây.</p>
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
            className={cn('-mb-px min-h-10 border-b-2 px-3 text-sm whitespace-nowrap', tab === t.id ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground')}
          >
            {t.label}
            {tab === t.id && total > 0 ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {inbox.isError ? <FormError message={problemMessage(inbox.error)} /> : null}
      {inbox.isPending ? <Skeleton className="h-32" /> : null}
      {inbox.data && items.length === 0 ? <Card className="p-6 text-muted-foreground">Không có phiếu nào ở mục này.</Card> : null}

      <ul className="flex flex-col gap-3">
        {items.map((t) => {
          const status = TICKET_STATUS[t.status ?? ''] ?? { label: t.status ?? '', className: '' }
          return (
            <li key={t.id}>
              <Link to={`/admin/support-tickets/${t.id}`} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card className="gap-1 p-4 transition-colors hover:bg-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.subject}</span>
                      <Badge className={status.className}>{status.label}</Badge>
                      <Badge variant="outline">{t.audience === 'SHOP' ? 'Cửa hàng' : 'Khách'}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">chờ từ {formatRelative(t.updatedAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.userName}
                    {t.orderNumber ? ` · đơn #${t.orderNumber}` : ''}
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
