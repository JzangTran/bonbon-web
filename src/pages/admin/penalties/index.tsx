import { useState } from 'react'
import { Link } from 'react-router'
import { CONSEQUENCE } from '@/entities/performance'
import { usePenaltyAppeals, usePenaltyShops } from '@/entities/penalty'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { adminPath } from '@/shared/config/sites'

type Tab = 'shops' | 'appeals'

/** Shops with penalty points and the appeals waiting for a decision (manage-penalties.md). */
export function AdminPenaltiesPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('shop-penalty:read')
  const [tab, setTab] = useState<Tab>('shops')
  const [page, setPage] = useState(0)
  const shops = usePenaltyShops(page, allowed && tab === 'shops')
  const appeals = usePenaltyAppeals(page, allowed && tab === 'appeals')
  const current = tab === 'shops' ? shops : appeals
  const total = current.data?.total ?? 0
  const size = current.data?.size ?? 20

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem điểm phạt của các quán.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Điểm phạt các quán</h1>
        <p className="text-sm text-muted-foreground">
          Quán nào đang có điểm, miễn hoặc cộng điểm, quyết kháng nghị và đình chỉ. Từ 6 điểm quán được đánh dấu để xem xét đình chỉ; hệ thống không bao giờ tự đình chỉ.
        </p>
      </div>

      <PageTabs
        label="Điểm phạt"
        tabs={[
          { id: 'shops', label: 'Quán có điểm', count: tab === 'shops' ? total : undefined },
          { id: 'appeals', label: 'Kháng nghị chờ quyết', count: tab === 'appeals' ? total : undefined },
        ]}
        value={tab}
        onValueChange={(id) => {
          setTab(id as 'shops' | 'appeals')
          setPage(0)
        }}
      />

      {current.isError ? <FormError message={problemMessage(current.error)} /> : null}
      {current.isPending ? <Skeleton className="h-32" /> : null}
      {current.data && total === 0 ? <Card className="p-6 text-muted-foreground">{tab === 'shops' ? 'Chưa có quán nào có điểm phạt.' : 'Không có kháng nghị nào đang chờ.'}</Card> : null}

      {tab === 'shops' ? (
        <ul className="flex flex-col gap-3">
          {(shops.data?.items ?? []).map((shop) => {
            const consequence = CONSEQUENCE[shop.consequence ?? 'NONE'] ?? CONSEQUENCE.NONE
            return (
              <li key={shop.vendorId}>
                <Link to={adminPath(`/penalties/${shop.vendorId}`)} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <Card className="gap-2 p-4 transition-colors hover:bg-accent">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{shop.name}</span>
                        <Badge className={consequence.className}>{consequence.label}</Badge>
                        {shop.reviewFlagged ? <Badge className="bg-danger-subtle text-danger-fg">Nên xem xét đình chỉ</Badge> : null}
                        {(shop.pendingAppeals ?? 0) > 0 ? <Badge variant="outline">{shop.pendingAppeals} kháng nghị chờ</Badge> : null}
                      </div>
                      <span className="text-2xl font-semibold tabular-nums">{shop.activePoints} điểm</span>
                    </div>
                    {shop.restrictionStartsAt ? <p className="text-sm text-muted-foreground">Hạn chế bắt đầu {formatDateTime(shop.restrictionStartsAt)}</p> : null}
                  </Card>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="flex flex-col gap-3">
          {(appeals.data?.items ?? []).map((a) => (
            <li key={a.penaltyId}>
              <Link to={adminPath(`/penalties/${a.vendorId}`)} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card className="gap-1 p-4 transition-colors hover:bg-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{a.vendorName}</span>
                    <span className="text-sm text-muted-foreground">chờ từ {formatRelative(a.appealedAt)}</span>
                  </div>
                  <p className="text-sm">{a.appealReason}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.points} điểm · {a.faultOrders ?? '–'} đơn lỗi trên {a.finishedOrders ?? '–'} đơn
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

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
