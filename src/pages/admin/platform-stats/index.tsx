import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { useSession } from '@/entities/session'
import { usePlatformOverview, useRevenueByMerchant, useUserGrowth, type MerchantSort, type PlatformOverviewBucket, type UserGrowthReport } from '@/entities/platform-stats'
import { problemMessage } from '@/shared/api'
import { shortLabel } from '@/shared/lib/date-range'
import { deltaText } from '@/shared/lib/delta'
import { formatVnd } from '@/shared/lib/format'
import { periodLabel } from '@/shared/lib/ledger'
import { usePaging } from '@/shared/lib/use-paging'
import { Input } from '@/shared/ui/input'
import { Pagination } from '@/shared/ui/pagination'
import { PageStack, Section, Segmented, StatRow, StatsPanel, StatTile, Toolbar } from '@/shared/ui/section'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { AdminHomeTabs } from '@/widgets/admin-tabs'
import { FormError } from '@/widgets/auth-shell'
import { ChartPanel, type ChartMetric } from '@/widgets/chart-panel'
import { RangePicker, granularityLabel, useStatsRange, type StatsRange } from '@/widgets/range-picker'
import { intlLocale, t } from '@/shared/i18n'

type Tab = 'overview' | 'shops' | 'users'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: t('Theo thời gian') },
  { id: 'shops', label: t('Theo cửa hàng') },
  { id: 'users', label: t('Người dùng mới') },
]
const SORTS: { id: MerchantSort; label: string }[] = [
  { id: 'revenue', label: t('Doanh thu') },
  { id: 'orders', label: t('Số đơn') },
  { id: 'commission', label: t('Hoa hồng') },
  { id: 'name', label: t('Tên') },
]
const number = (n: number | undefined) => (n ?? 0).toLocaleString(intlLocale)
const OVERVIEW_METRICS: ChartMetric<PlatformOverviewBucket>[] = [
  { id: 'grossRevenue', label: t('Doanh thu gộp'), value: (b) => b.grossRevenue, format: formatVnd },
  { id: 'commission', label: t('Hoa hồng'), value: (b) => b.commission, format: formatVnd },
  { id: 'orders', label: t('Số đơn'), value: (b) => b.orders, format: (n) => t('{v0} đơn', { v0: number(n) }) },
]
type GrowthBucket = NonNullable<UserGrowthReport['buckets']>[number]
const GROWTH_METRICS: ChartMetric<GrowthBucket>[] = [
  { id: 'customers', label: t('Khách mới'), value: (b) => b.customers, format: number },
  { id: 'sellers', label: t('Người bán mới'), value: (b) => b.sellers, format: number },
]

/**
 * How the platform is doing (view-platform-statistics.md), in three tabs that share one filter row: the overview over time, the
 * shops that carry it, and who is signing up.
 */
export function AdminPlatformStatsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('platform-stats:read')
  const state = useStatsRange('30d')
  const [tab, setTab] = useState<Tab>('overview')
  if (!allowed) return <p className="text-muted-foreground">{t('Bạn không có quyền xem thống kê hệ thống.')}</p>

  return (
    <PageStack>
      <div className="flex flex-col gap-6">
        <AdminHomeTabs />
        <div className="flex flex-col gap-2">
          <h1>{t('Thống kê hệ thống')}</h1>
          <p className="max-w-3xl text-ui text-muted-foreground">
            {t('Chỉ tính đơn đã giao, theo ngày giao (giờ Việt Nam). Doanh thu gộp là tiền khách đã trả, gồm phí giao; hoa hồng là thu nhập của nền tảng, chưa trừ phần hoàn lại do khiếu nại.')}
          </p>
        </div>
        <PageTabs label={t('Thống kê')} tabs={TABS} value={tab} onValueChange={(id) => setTab(id as Tab)} />
        <RangePicker state={state} steps={tab !== 'shops'} comparable={tab !== 'shops'} />
      </div>
      {tab === 'overview' ? <Overview state={state} /> : tab === 'shops' ? <ByMerchant range={state.range} enabled={!state.invalid} /> : <Users state={state} />}
    </PageStack>
  )
}

function Overview({ state }: { state: StatsRange }) {
  const { range, previous, granularity, compare, invalid } = state
  const overview = usePlatformOverview(range, granularity, !invalid)
  const before = usePlatformOverview(previous, granularity, compare && !invalid)
  const totals = overview.data?.totals
  const prev = compare ? before.data?.totals : undefined
  return (
    <>
      {overview.isError ? <FormError message={problemMessage(overview.error)} /> : null}
      {overview.isPending && !invalid ? <Skeleton className="h-40 rounded-xl" /> : null}
      {totals ? (
        <StatsPanel className={overview.isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <StatRow>
            <StatTile label={t('Đơn đã giao')} value={number(totals.orders)} hint={deltaText(totals.orders, prev?.orders)} />
            <StatTile label={t('Doanh thu gộp')} value={formatVnd(totals.grossRevenue)} hint={deltaText(totals.grossRevenue, prev?.grossRevenue)} />
            <StatTile label={t('Hoa hồng')} value={formatVnd(totals.commission)} hint={deltaText(totals.commission, prev?.commission)} />
          </StatRow>
          <StatRow className="border-t border-grey-200 pt-6">
            <StatTile label={t('Cửa hàng hoạt động')} value={number(totals.activeShops)} hint={t('có ít nhất một đơn đã giao')} />
            <StatTile label={t('Khách hoạt động')} value={number(totals.activeCustomers)} hint={t('có ít nhất một đơn đã giao')} />
            <StatTile label={t('Người bán có quán hoạt động')} value={number(totals.activeSellers)} hint={t('mỗi tài khoản một cửa hàng')} />
          </StatRow>
        </StatsPanel>
      ) : null}
      {overview.data ? (
        <ChartPanel
          title={t('Theo {v0}', { v0: granularityLabel(granularity).toLowerCase() })}
          metrics={OVERVIEW_METRICS}
          current={overview.data.buckets ?? []}
          previous={compare ? before.data?.buckets : undefined}
          label={(b) => shortLabel(b.start ?? '', granularity)}
          full={(b) => periodLabel(b.start ?? '', granularity)}
        />
      ) : null}
    </>
  )
}

function Users({ state }: { state: StatsRange }) {
  const { range, previous, granularity, compare, invalid } = state
  const growth = useUserGrowth(range, granularity, !invalid)
  const before = useUserGrowth(previous, granularity, compare && !invalid)
  const data = growth.data
  const prev = compare ? before.data : undefined
  return (
    <>
      {growth.isError ? <FormError message={problemMessage(growth.error)} /> : null}
      {growth.isPending && !invalid ? <Skeleton className="h-40 rounded-xl" /> : null}
      {data ? (
        <>
          <StatsPanel>
            <StatRow>
              <StatTile label={t('Khách mới')} value={number(data.customers)} hint={deltaText(data.customers, prev?.customers)} />
              <StatTile label={t('Người bán mới')} value={number(data.sellers)} hint={deltaText(data.sellers, prev?.sellers)} />
            </StatRow>
            <p className="text-small text-muted-foreground">
              {t('Tính theo ngày vai trò được thêm. Một người đăng ký làm khách rồi mở quán được tính một lần ở mỗi chuỗi.')}
            </p>
          </StatsPanel>
          <ChartPanel
            title={t('Theo {v0}', { v0: granularityLabel(granularity).toLowerCase() })}
            metrics={GROWTH_METRICS}
            current={data.buckets ?? []}
            previous={compare ? before.data?.buckets : undefined}
            label={(b) => shortLabel(b.start ?? '', granularity)}
            full={(b) => periodLabel(b.start ?? '', granularity)}
          />
        </>
      ) : null}
    </>
  )
}

function ByMerchant({ range, enabled }: { range: { from: string; to: string }; enabled: boolean }) {
  const [sort, setSort] = useState<MerchantSort>('revenue')
  const [q, setQ] = useState('')
  const paging = usePaging()
  const rows = useRevenueByMerchant(range, sort, q, paging.page, paging.size, enabled)
  const data = rows.data
  const items = data?.items ?? []

  return (
    <Section>
      <Toolbar>
        <div className="relative w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-9"
            type="search"
            placeholder={t('Tìm theo tên cửa hàng')}
            aria-label={t('Tìm cửa hàng')}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              paging.reset()
            }}
          />
        </div>
        <span className="flex items-center gap-2 text-small text-muted-foreground">
          {t('Sắp xếp')}
          <Segmented
            label={t('Sắp xếp theo')}
            options={SORTS}
            value={sort}
            onChange={(s) => {
              setSort(s)
              paging.reset()
            }}
          />
        </span>
      </Toolbar>
      {rows.isError ? <FormError message={problemMessage(rows.error)} /> : null}
      {rows.isPending && enabled ? <Skeleton className="h-40 rounded-xl" /> : null}
      {data ? (
        <StatsPanel className="gap-3 p-2 sm:p-3">
          {items.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{q ? t('Không có cửa hàng nào khớp.') : t('Chưa có cửa hàng nào có đơn đã giao trong khoảng này.')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>{t('Cửa hàng')}</TableHead>
                  <TableHead className="text-right">{t('Đơn đã giao')}</TableHead>
                  <TableHead className="text-right">{t('Doanh thu gộp')}</TableHead>
                  <TableHead className="text-right">{t('Hoa hồng')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((r, i) => (
                  <TableRow key={r.vendorId} className="hover:bg-white/60">
                    <TableCell className="text-muted-foreground tabular-nums">{paging.page * paging.size + i + 1}</TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{number(r.orders)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatVnd(r.grossRevenue)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatVnd(r.commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </StatsPanel>
      ) : null}
      <Pagination paging={paging} total={data?.total ?? 0} />
    </Section>
  )
}
