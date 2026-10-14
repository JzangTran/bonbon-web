import { useState } from 'react'
import { useSession } from '@/entities/session'
import { usePlatformOverview, useRevenueByMerchant, useUserGrowth, type MerchantSort } from '@/entities/platform-stats'
import { problemMessage } from '@/shared/api'
import { shortLabel } from '@/shared/lib/date-range'
import { formatVnd } from '@/shared/lib/format'
import { periodLabel } from '@/shared/lib/ledger'
import { BarChart } from '@/shared/ui/bar-chart'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { RangePicker, granularityLabel, useStatsRange } from '@/widgets/range-picker'

type Metric = 'grossRevenue' | 'orders' | 'commission'
const METRICS: { id: Metric; label: string }[] = [
  { id: 'grossRevenue', label: 'Doanh thu gộp' },
  { id: 'commission', label: 'Hoa hồng' },
  { id: 'orders', label: 'Số đơn' },
]
const SORTS: { id: MerchantSort; label: string }[] = [
  { id: 'revenue', label: 'Doanh thu' },
  { id: 'orders', label: 'Số đơn' },
  { id: 'commission', label: 'Hoa hồng' },
  { id: 'name', label: 'Tên' },
]
const number = (n: number | undefined) => (n ?? 0).toLocaleString('vi-VN')

/** How the platform is doing (view-platform-statistics.md): delivered orders over time, which shops carry them, and who is signing up. */
export function AdminPlatformStatsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('platform-stats:read')
  const state = useStatsRange('30d')
  const { range, granularity, invalid } = state
  const ready = allowed && !invalid
  const [metric, setMetric] = useState<Metric>('grossRevenue')
  const overview = usePlatformOverview(range, granularity, ready)
  const growth = useUserGrowth(range, granularity, ready)

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem thống kê hệ thống.</p>

  const totals = overview.data?.totals
  const buckets = overview.data?.buckets ?? []
  const format = (v: number) => (metric === 'orders' ? `${number(v)} đơn` : formatVnd(v))

  return (
    <div className="flex min-w-0 max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Thống kê hệ thống</h1>
        <p className="text-sm text-muted-foreground">
          Chỉ tính đơn đã giao, theo ngày giao (giờ Việt Nam). Doanh thu gộp là tiền khách đã trả, gồm phí giao; hoa hồng là thu nhập của nền tảng, chưa trừ phần hoàn lại do khiếu nại.
        </p>
      </div>

      <RangePicker state={state} />

      {overview.isError ? <FormError message={problemMessage(overview.error)} /> : null}
      {overview.isPending && ready ? <Skeleton className="h-28" /> : null}
      {totals ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Đơn đã giao" value={number(totals.orders)} />
          <Stat label="Doanh thu gộp" value={formatVnd(totals.grossRevenue)} />
          <Stat label="Hoa hồng" value={formatVnd(totals.commission)} />
          <Stat label="Cửa hàng hoạt động" value={number(totals.activeShops)} hint="có ít nhất một đơn đã giao" />
          <Stat label="Khách hoạt động" value={number(totals.activeCustomers)} hint="có ít nhất một đơn đã giao" />
          <Stat label="Người bán có quán hoạt động" value={number(totals.activeSellers)} hint="mỗi tài khoản một cửa hàng" />
        </div>
      ) : null}

      {overview.data ? (
        <section className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Theo {granularityLabel(granularity).toLowerCase()}</h2>
            <div role="tablist" className="flex gap-1">
              {METRICS.map((m) => (
                <Button key={m.id} role="tab" aria-selected={metric === m.id} size="sm" variant={metric === m.id ? 'default' : 'outline'} onClick={() => setMetric(m.id)}>
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
          {(totals?.orders ?? 0) === 0 ? (
            <Card className="p-6 text-muted-foreground">Chưa có đơn nào được giao trong khoảng này.</Card>
          ) : (
            <BarChart
              ariaLabel={`Biểu đồ ${METRICS.find((m) => m.id === metric)?.label.toLowerCase()}`}
              format={format}
              bars={buckets.map((b) => ({
                key: b.start ?? '',
                label: shortLabel(b.start ?? '', granularity),
                value: b[metric] ?? 0,
                title: `${periodLabel(b.start ?? '', granularity)}: ${format(b[metric] ?? 0)}`,
              }))}
            />
          )}
          {buckets.length > 0 ? (
            <div tabIndex={0} role="region" aria-label="Bảng số liệu theo kỳ" className="max-h-96 overflow-auto rounded-sm border bg-card">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                  <tr>
                    {['Kỳ', 'Đơn', 'Doanh thu gộp', 'Hoa hồng'].map((h) => (
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
                      <td className="px-3 py-2 text-right tabular-nums">{number(b.orders)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatVnd(b.grossRevenue)}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{formatVnd(b.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}

      <ByMerchant range={range} enabled={ready} />

      <section className="flex min-w-0 flex-col gap-3">
        <h2 className="text-lg font-semibold">Người dùng mới</h2>
        <p className="text-sm text-muted-foreground">
          Số vai trò khách và người bán được thêm, tính theo ngày vai trò được thêm. Một người đăng ký làm khách rồi mở quán được tính một lần ở mỗi chuỗi.
        </p>
        {growth.isError ? <FormError message={problemMessage(growth.error)} /> : null}
        {growth.isPending && ready ? <Skeleton className="h-28" /> : null}
        {growth.data ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Khách mới" value={number(growth.data.customers)} />
              <Stat label="Người bán mới" value={number(growth.data.sellers)} />
            </div>
            {(growth.data.customers ?? 0) + (growth.data.sellers ?? 0) === 0 ? (
              <Card className="p-6 text-muted-foreground">Chưa có người dùng mới trong khoảng này.</Card>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {(
                  [
                    ['customers', 'Khách mới'],
                    ['sellers', 'Người bán mới'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex min-w-0 flex-col gap-1">
                    <h3 className="text-sm font-medium">{label}</h3>
                    <BarChart
                      ariaLabel={`Biểu đồ ${label.toLowerCase()}`}
                      format={(v) => number(v)}
                      bars={(growth.data?.buckets ?? []).map((b) => ({
                        key: b.start ?? '',
                        label: shortLabel(b.start ?? '', granularity),
                        value: b[key] ?? 0,
                        title: `${periodLabel(b.start ?? '', granularity)}: ${number(b[key])}`,
                      }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </section>
    </div>
  )
}

function ByMerchant({ range, enabled }: { range: { from: string; to: string }; enabled: boolean }) {
  const [sort, setSort] = useState<MerchantSort>('revenue')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const rows = useRevenueByMerchant(range, sort, q, page, enabled)
  const data = rows.data
  const size = data?.size ?? 20
  const total = data?.total ?? 0

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Doanh thu theo cửa hàng</h2>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(search)
          setPage(0)
        }}
      >
        <Input className="max-w-xs" type="search" placeholder="Tìm theo tên cửa hàng" aria-label="Tìm cửa hàng" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
        <div className="flex flex-wrap items-center gap-1 sm:ml-auto" role="group" aria-label="Sắp xếp theo">
          <span className="mr-1 text-sm text-muted-foreground">Sắp xếp</span>
          {SORTS.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={sort === s.id ? 'default' : 'outline'}
              aria-pressed={sort === s.id}
              onClick={() => {
                setSort(s.id)
                setPage(0)
              }}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </form>
      {rows.isError ? <FormError message={problemMessage(rows.error)} /> : null}
      {rows.isPending && enabled ? <Skeleton className="h-28" /> : null}
      {data && (data.items ?? []).length === 0 ? (
        <Card className="p-6 text-muted-foreground">{q ? 'Không có cửa hàng nào khớp.' : 'Chưa có cửa hàng nào có đơn đã giao trong khoảng này.'}</Card>
      ) : null}
      {data && (data.items ?? []).length > 0 ? (
        <div className="overflow-x-auto rounded-sm border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                {['Cửa hàng', 'Đơn', 'Doanh thu gộp', 'Hoa hồng'].map((h) => (
                  <th key={h} className="px-3 py-2 text-right font-medium first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data.items ?? []).map((r) => (
                <tr key={r.vendorId} className="border-t">
                  <td className="px-3 py-2 font-medium">{r.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{number(r.orders)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(r.grossRevenue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(r.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
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
    </section>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="gap-1 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  )
}
