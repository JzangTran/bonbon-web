import { useState } from 'react'
import { Link } from 'react-router'
import { useSettlementOverview, type ShopFilter } from '@/entities/settlement'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatRelative, formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const TABS: { id: ShopFilter; label: string }[] = [
  { id: 'ALL', label: 'Tất cả quán' },
  { id: 'OWED_TO_SHOP', label: 'Nền tảng nợ quán' },
  { id: 'OWED_BY_SHOP', label: 'Quán nợ nền tảng' },
]

const percent = (rate: number | undefined | null) => (rate === undefined || rate === null ? '—' : `${rate.toLocaleString('vi-VN')}%`)

/** Who owes whom: platform totals and every shop's balance (view-settlement-overview.md). */
export function AdminSettlementPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('settlement:read')
  const [filter, setFilter] = useState<ShopFilter>('ALL')
  const [page, setPage] = useState(0)
  const overview = useSettlementOverview(filter, page, allowed)
  const data = overview.data
  const totals = data?.totals
  const shops = data?.shops

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem đối soát.</p>

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Đối soát</h1>
        <p className="text-sm text-muted-foreground">
          Số dư dương: nền tảng nợ quán (chủ yếu tiền khách trả online). Số dư âm: quán nợ nền tảng (hoa hồng đơn tiền mặt). Mọi số liệu tính từ sổ cái.
        </p>
      </div>
      {overview.isError ? <FormError message={problemMessage(overview.error)} /> : null}
      {overview.isPending ? <Skeleton className="h-32" /> : null}

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Hoa hồng đã tính" value={formatVnd(totals.commission)} hint={`ròng ${formatVnd(totals.commissionNet)} · VAT ${formatVnd(totals.commissionVat)}`} />
          <Stat label="Tỷ lệ thực tế bình quân" value={percent(totals.effectiveRate)} hint={`${totals.orders?.toLocaleString('vi-VN')} đơn · ${totals.shops} quán`} />
          <Stat label="Nền tảng đang nợ các quán" value={formatVnd(totals.owedToShops)} hint="tổng các số dư dương" />
          <Stat label="Các quán đang nợ nền tảng" value={formatVnd(totals.owedByShops)} hint="tổng các số dư âm" />
        </div>
      ) : null}

      <div role="tablist" className="flex flex-wrap gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => {
              setFilter(tab.id)
              setPage(0)
            }}
            className={cn(
              '-mb-px min-h-10 border-b-2 px-3 text-sm whitespace-nowrap',
              filter === tab.id ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {shops && (shops.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có quán nào ở mục này.</Card> : null}
      <ul className="flex flex-col gap-2">
        {(shops?.items ?? []).map((shop) => (
          <li key={shop.vendorId}>
            <Link to={`/admin/settlement/${shop.vendorId}`} className="block rounded-sm border bg-card p-4 hover:bg-muted/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {shop.name}
                  {shop.lowRate ? (
                    <Badge className="ml-2 bg-warning-subtle text-warning-fg" title="Tỷ lệ hoa hồng thực tế thấp hơn hẳn mức chung: kiểm tra ngành của các món">
                      Tỷ lệ thấp bất thường
                    </Badge>
                  ) : null}
                </p>
                <p className={cn('text-lg font-semibold tabular-nums', (shop.balance ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>
                  {(shop.balance ?? 0) < 0 ? `Quán nợ ${formatVnd(shop.owed)}` : `Nền tảng nợ ${formatVnd(shop.payable)}`}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {shop.orders} đơn · món {formatVnd(shop.foodValue)} · hoa hồng {formatVnd(shop.commission)} ({percent(shop.effectiveRate)}) ·{' '}
                {shop.lastPayoutAt ? `chi trả gần nhất ${formatRelative(shop.lastPayoutAt)}` : 'chưa chi trả lần nào'}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {(shops?.total ?? 0) > (shops?.size ?? 20) ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {Math.ceil((shops?.total ?? 0) / (shops?.size ?? 20))}
          </span>
          <Button variant="outline" disabled={(page + 1) * (shops?.size ?? 20) >= (shops?.total ?? 0)} onClick={() => setPage(page + 1)}>
            Trang sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}
