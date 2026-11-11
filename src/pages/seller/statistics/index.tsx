import { useBestSellingDishes, useRevenueStats, type RevenueBucket } from '@/entities/statistics'
import { problemMessage } from '@/shared/api'
import { shortLabel } from '@/shared/lib/date-range'
import { deltaText } from '@/shared/lib/delta'
import { formatVnd } from '@/shared/lib/format'
import { periodLabel } from '@/shared/lib/ledger'
import { PageStack, Section, StatRow, StatsPanel, StatTile } from '@/shared/ui/section'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { FormError } from '@/widgets/auth-shell'
import { ChartPanel, type ChartMetric } from '@/widgets/chart-panel'
import { RangePicker, granularityLabel, useStatsRange } from '@/widgets/range-picker'
import { FinanceTabs } from '@/widgets/seller-tabs'
import { intlLocale, t } from '@/shared/i18n'

const METRICS: ChartMetric<RevenueBucket>[] = [
  { id: 'revenue', label: t('Doanh thu'), value: (b) => b.revenue, format: formatVnd },
  { id: 'orders', label: t('Đơn đã giao'), value: (b) => b.orders, format: (n) => t('{v0} đơn', { v0: n.toLocaleString(intlLocale) }) },
  { id: 'aov', label: t('Giá trị TB'), value: (b) => b.averageOrderValue, format: formatVnd },
]

/** How the shop is selling (view-revenue-statistics.md, view-best-selling-dishes.md): figures, revenue over time, the dishes that carry it. */
export function SellerStatisticsPage() {
  const state = useStatsRange('7d')
  const { range, granularity, compare, previous } = state
  const revenue = useRevenueStats(range, granularity)
  const before = useRevenueStats(previous, granularity, compare)
  const dishes = useBestSellingDishes(range)
  const totals = revenue.data?.totals
  const prev = compare ? before.data?.totals : undefined
  const buckets = revenue.data?.buckets ?? []
  const dishItems = dishes.data?.items ?? []
  const maxQty = Math.max(1, ...dishItems.map((d) => d.quantity ?? 0))

  return (
    <PageStack>
      <div className="flex flex-col gap-6">
        <FinanceTabs />
        <div className="flex flex-col gap-2">
          <h1>{t('Doanh thu')}</h1>
          <p className="max-w-3xl text-ui text-muted-foreground">
            {t('Chỉ tính đơn đã giao, theo ngày giao (giờ Việt Nam): tiền khách đã trả, gồm phí giao và chưa trừ hoa hồng. Phần quán nhận được nằm ở Thu nhập và sao kê.')}
          </p>
        </div>
        <RangePicker state={state} />
      </div>

      {revenue.isError ? <FormError message={problemMessage(revenue.error)} /> : null}
      {revenue.isPending ? <Skeleton className="h-28 rounded-xl" /> : null}

      {totals ? (
        <StatsPanel className={revenue.isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <StatRow>
            <StatTile label={t('Đơn đã giao')} value={(totals.orders ?? 0).toLocaleString(intlLocale)} hint={deltaText(totals.orders, prev?.orders)} />
            <StatTile label={t('Doanh thu')} value={formatVnd(totals.revenue)} hint={deltaText(totals.revenue, prev?.revenue)} />
            <StatTile label={t('Giá trị đơn trung bình')} value={formatVnd(totals.averageOrderValue)} hint={deltaText(totals.averageOrderValue, prev?.averageOrderValue)} />
          </StatRow>
        </StatsPanel>
      ) : null}

      {revenue.data ? (
        <ChartPanel
          title={t('Theo {v0}', { v0: granularityLabel(granularity).toLowerCase() })}
          description={t('Di chuột hoặc dùng phím mũi tên trên biểu đồ để xem từng kỳ.')}
          metrics={METRICS}
          current={buckets}
          previous={compare ? before.data?.buckets : undefined}
          label={(b) => shortLabel(b.start ?? '', granularity)}
          full={(b) => periodLabel(b.start ?? '', granularity)}
          empty={<p className="py-10 text-center text-muted-foreground">{t('Chưa có đơn nào được giao trong khoảng này.')}</p>}
        />
      ) : null}

      <Section title={t('Món bán chạy')} description={t('Mười món bán nhiều phần nhất trong khoảng đã chọn.')}>
        {dishes.isError ? <FormError message={problemMessage(dishes.error)} /> : null}
        {dishes.isPending ? <Skeleton className="h-28 rounded-xl" /> : null}
        {dishes.data ? (
          <StatsPanel className="p-2 sm:p-3">
            {dishItems.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t('Chưa có món nào được bán trong khoảng này.')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>{t('Món')}</TableHead>
                    <TableHead className="w-1/3">{t('Số phần')}</TableHead>
                    <TableHead className="text-right">{t('Doanh thu')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dishItems.map((d, i) => (
                    <TableRow key={d.menuItemId} className="hover:bg-white/60">
                      <TableCell className="text-muted-foreground tabular-nums">{i + 1}</TableCell>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-grey-200">
                            <div className="h-full rounded-full bg-[var(--chart-1)]" style={{ width: `${Math.round(((d.quantity ?? 0) / maxQty) * 100)}%` }} />
                          </div>
                          <span className="w-12 text-right tabular-nums">{d.quantity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatVnd(d.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </StatsPanel>
        ) : null}
      </Section>
    </PageStack>
  )
}
