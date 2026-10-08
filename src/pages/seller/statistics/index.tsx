import { useState } from 'react'
import { useBestSellingDishes, useRevenueStats, type RevenueBucket, type StatsGranularity } from '@/entities/statistics'
import { problemMessage } from '@/shared/api'
import { formatVnd } from '@/shared/lib/format'
import { periodLabel } from '@/shared/lib/ledger'
import { useNow } from '@/shared/lib/use-now'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { PRESET_LABEL, addDays, daysInRange, presetRange, shortLabel, vietnamToday, type RangePreset } from './range'

const GRANULARITY_LABEL: Record<StatsGranularity, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }

/** How the shop is selling (view-revenue-statistics.md, view-best-selling-dishes.md): revenue over time and the dishes that carry it. */
export function SellerStatisticsPage() {
  const today = vietnamToday(useNow(60_000))
  const [preset, setPreset] = useState<RangePreset>('7d')
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null)
  const [granularity, setGranularity] = useState<StatsGranularity>('day')
  const range = preset === 'custom' && custom ? custom : presetRange(preset === 'custom' ? '7d' : preset, today)
  const revenue = useRevenueStats(range, granularity)
  const dishes = useBestSellingDishes(range)
  const totals = revenue.data?.totals
  const buckets = revenue.data?.buckets ?? []
  const customInvalid = preset === 'custom' && custom !== null && custom.from > custom.to

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Thống kê</h1>
        <p className="text-sm text-muted-foreground">
          Chỉ tính đơn đã giao, theo ngày giao (giờ Việt Nam). Đây là tiền khách đã trả, gồm phí giao và chưa trừ hoa hồng; phần quán nhận được nằm ở mục Thu nhập.
        </p>
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {(Object.keys(PRESET_LABEL) as RangePreset[]).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={preset === p ? 'default' : 'outline'}
                onClick={() => {
                  setPreset(p)
                  if (p === 'custom' && !custom) setCustom({ from: addDays(today, -13), to: today })
                }}
              >
                {PRESET_LABEL[p]}
              </Button>
            ))}
          </div>
          <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
          <div className="flex gap-1">
            {(Object.keys(GRANULARITY_LABEL) as StatsGranularity[]).map((g) => (
              <Button key={g} size="sm" variant={granularity === g ? 'default' : 'outline'} onClick={() => setGranularity(g)}>
                {GRANULARITY_LABEL[g]}
              </Button>
            ))}
          </div>
        </div>
        {preset === 'custom' && custom ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex items-center gap-2">
              Từ
              <Input type="date" className="w-40" max={today} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
            </label>
            <label className="flex items-center gap-2">
              đến
              <Input type="date" className="w-40" max={today} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
            </label>
            {customInvalid ? <span className="text-danger-fg">Ngày bắt đầu phải trước ngày kết thúc.</span> : null}
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {range.from === range.to ? range.from.split('-').reverse().join('/') : `${range.from.split('-').reverse().join('/')} – ${range.to.split('-').reverse().join('/')}`} ({daysInRange(range.from, range.to)} ngày)
        </p>
      </Card>

      {revenue.isError ? <FormError message={problemMessage(revenue.error)} /> : null}
      {revenue.isPending ? <Skeleton className="h-28" /> : null}

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Đơn đã giao" value={String(totals.orders ?? 0)} />
          <Stat label="Doanh thu" value={formatVnd(totals.revenue)} />
          <Stat label="Giá trị đơn trung bình" value={formatVnd(totals.averageOrderValue)} />
        </div>
      ) : null}

      {revenue.data ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Doanh thu theo {GRANULARITY_LABEL[granularity].toLowerCase()}</h2>
          {(totals?.orders ?? 0) === 0 ? <Card className="p-6 text-muted-foreground">Chưa có đơn nào được giao trong khoảng này.</Card> : <RevenueChart buckets={buckets} granularity={granularity} />}
          {buckets.length > 0 ? (
            <div className="max-h-96 overflow-auto rounded-sm border bg-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                  <tr>
                    {['Kỳ', 'Đơn', 'Doanh thu', 'Giá trị TB'].map((h) => (
                      <th key={h} className="px-3 py-2 text-right font-medium first:text-left">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...buckets].reverse().map((b) => (
                    <tr key={b.start} className="border-t">
                      <td className="px-3 py-2">{periodLabel(b.start ?? '', granularity)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{b.orders}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatVnd(b.revenue)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatVnd(b.averageOrderValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Món bán chạy</h2>
        {dishes.isError ? <FormError message={problemMessage(dishes.error)} /> : null}
        {dishes.isPending ? <Skeleton className="h-28" /> : null}
        {dishes.data && (dishes.data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có món nào được bán trong khoảng này.</Card> : null}
        <DishList dishes={dishes.data?.items ?? []} />
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </Card>
  )
}

/** A bar per period, scaled to the best one; no chart library for a single series. */
function RevenueChart({ buckets, granularity }: { buckets: RevenueBucket[]; granularity: StatsGranularity }) {
  const max = Math.max(1, ...buckets.map((b) => b.revenue ?? 0))
  // Show about eight labels, whatever the number of bars.
  const every = Math.max(1, Math.ceil(buckets.length / 8))
  return (
    <Card className="p-4">
      <div className="flex h-56 items-end gap-px sm:gap-1" role="img" aria-label="Biểu đồ doanh thu">
        {buckets.map((b) => (
          <div
            key={b.start}
            className="group relative flex h-full min-w-0 flex-1 items-end"
            title={`${periodLabel(b.start ?? '', granularity)}: ${formatVnd(b.revenue)} · ${b.orders} đơn`}
          >
            <div
              className={cn('w-full rounded-t-sm bg-primary transition-colors group-hover:bg-primary-hover', (b.revenue ?? 0) === 0 && 'bg-muted')}
              style={{ height: `${Math.max(2, Math.round(((b.revenue ?? 0) / max) * 100))}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-px text-[11px] text-muted-foreground sm:gap-1">
        {buckets.map((b, i) => (
          <span key={b.start} className="min-w-0 flex-1 overflow-visible whitespace-nowrap text-center">
            {i % every === 0 ? shortLabel(b.start ?? '', granularity) : ''}
          </span>
        ))}
      </div>
      <p className="mt-2 text-right text-xs text-muted-foreground">Cột cao nhất: {formatVnd(max)}</p>
    </Card>
  )
}

function DishList({ dishes }: { dishes: { menuItemId?: string; name?: string; quantity?: number; revenue?: number }[] }) {
  const max = Math.max(1, ...dishes.map((d) => d.quantity ?? 0))
  return (
    <ol className="flex flex-col divide-y rounded-sm border bg-card empty:hidden">
      {dishes.map((d, i) => (
        <li key={d.menuItemId} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span className="w-6 text-center font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{d.name}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(((d.quantity ?? 0) / max) * 100)}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold tabular-nums">{d.quantity} phần</p>
            <p className="text-xs text-muted-foreground tabular-nums">{formatVnd(d.revenue)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
