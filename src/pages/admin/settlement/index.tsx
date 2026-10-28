import { useState } from 'react'
import { Link } from 'react-router'
import { useSettlementOverview, type ShopFilter } from '@/entities/settlement'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatRelative, formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { consolePath } from '@/shared/config/sites'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { StatRow, StatsPanel, StatTile } from '@/shared/ui/section'

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
  const paging = usePaging()
  const overview = useSettlementOverview(filter, paging.page, allowed, paging.size)
  const data = overview.data
  const totals = data?.totals
  const shops = data?.shops

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem đối soát.</p>

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">Đối soát</h1>
        <p className="text-sm text-muted-foreground">
          Số dư dương: nền tảng nợ quán (chủ yếu tiền khách trả online). Số dư âm: quán nợ nền tảng (hoa hồng đơn tiền mặt). Mọi số liệu tính từ sổ cái.
        </p>
      </div>
      {overview.isError ? <FormError message={problemMessage(overview.error)} /> : null}
      {overview.isPending ? <Skeleton className="h-32" /> : null}

      {totals ? (
        <StatsPanel>
          <StatRow>
          <Stat label="Hoa hồng đã tính" value={formatVnd(totals.commission)} hint={`ròng ${formatVnd(totals.commissionNet)} · VAT ${formatVnd(totals.commissionVat)}`} />
          <Stat label="Tỷ lệ thực tế bình quân" value={percent(totals.effectiveRate)} hint={`${totals.orders?.toLocaleString('vi-VN')} đơn · ${totals.shops} quán`} />
          <Stat label="Nền tảng đang nợ các quán" value={formatVnd(totals.owedToShops)} hint="tổng các số dư dương" />
          <Stat label="Các quán đang nợ nền tảng" value={formatVnd(totals.owedByShops)} hint="tổng các số dư âm" />
          </StatRow>
        </StatsPanel>
      ) : null}

      <PageTabs
        label="Đối soát"
        tabs={TABS}
        value={filter}
        onValueChange={(id) => {
          setFilter(id as ShopFilter)
          paging.reset()
        }}
      />

      {shops && (shops.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có quán nào ở mục này.</Card> : null}
      <ul className="flex flex-col gap-2">
        {(shops?.items ?? []).map((shop) => (
          <li key={shop.vendorId}>
            <Link to={consolePath(`/settlement/${shop.vendorId}`)} className="block rounded-sm border bg-card p-4 hover:bg-muted/50">
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

      <Pagination paging={paging} total={shops?.total ?? 0} />
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <StatTile label={label} value={value} hint={hint} />
}
