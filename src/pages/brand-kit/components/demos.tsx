import { useState } from 'react'
import { OrderStatusBadge } from '@/entities/order'
import { usePaging } from '@/shared/lib/use-paging'
import { cn } from '@/shared/lib/utils'
import { Pagination } from '@/shared/ui/pagination'
import { Segmented, StatsPanel, Toolbar } from '@/shared/ui/section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TimeChart, type ChartKind } from '@/shared/ui/time-chart'

/** Live samples of the components pages that keep a little state of their own. */

export function SegmentedDemo() {
  const [v, setV] = useState<'day' | 'week' | 'month'>('week')
  return (
    <Segmented
      label="Chia theo"
      options={[
        { id: 'day', label: 'Ngày' },
        { id: 'week', label: 'Tuần' },
        { id: 'month', label: 'Tháng' },
      ]}
      value={v}
      onChange={setV}
    />
  )
}

const TABS = [
  { id: 'new', label: 'Mới', count: 2 },
  { id: 'doing', label: 'Đang làm', count: 3 },
  { id: 'history', label: 'Lịch sử', count: 0 },
]
export function TabsDemo({ withCounts = true }: { withCounts?: boolean }) {
  const [tab, setTab] = useState('new')
  return (
    <div className="w-full max-w-md rounded-lg bg-white">
      <div role="tablist" aria-label="Đơn hàng" className="flex gap-1 border-b border-grey-200 px-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px flex h-11 items-center gap-2 rounded-t-md border-b-2 px-4 text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring',
              tab === t.id ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {t.label}
            {withCounts && t.count > 0 ? <span className="rounded-full bg-grey-100 px-1.5 text-caption text-ink tabular-nums">{t.count}</span> : null}
          </button>
        ))}
      </div>
      <p className="p-4 text-ui text-muted-foreground">Nội dung của tab {TABS.find((t) => t.id === tab)?.label}.</p>
    </div>
  )
}

export function PaginationDemo() {
  const paging = usePaging()
  return <Pagination paging={paging} total={132} className="w-full max-w-xl rounded-lg bg-white px-4 py-3" />
}

const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => ({
  key: d,
  label: d,
  full: i === 6 ? 'Chủ nhật' : `Thứ ${i + 2}`,
  values: { now: [420, 380, 510, 460, 720, 940, 860][i] * 1000, before: [390, 410, 450, 470, 650, 880, 900][i] * 1000 },
}))
const vnd = (n: number) => `${n.toLocaleString('vi-VN')} ₫`
export function ChartDemo({ kind: initial = 'bar', compare = true }: { kind?: ChartKind; compare?: boolean }) {
  const [kind, setKind] = useState<ChartKind>(initial)
  return (
    <StatsPanel className="w-full bg-white">
      <Toolbar className="justify-between">
        <h3 className="text-h3 font-medium">Doanh thu 7 ngày</h3>
        <Segmented
          label="Kiểu biểu đồ"
          options={[
            { id: 'bar', label: 'Cột' },
            { id: 'line', label: 'Đường' },
          ]}
          value={kind}
          onChange={setKind}
        />
      </Toolbar>
      <TimeChart
        ariaLabel="Doanh thu 7 ngày"
        kind={kind}
        format={vnd}
        series={compare ? [{ key: 'now', label: 'Tuần này' }, { key: 'before', label: 'Tuần trước' }] : [{ key: 'now', label: 'Doanh thu' }]}
        points={WEEK}
      />
    </StatsPanel>
  )
}

const ORDERS = [
  { code: '#116', customer: 'Hoàng Minh Anh', total: 129000, status: 'PLACED' as const },
  { code: '#115', customer: 'Bùi Quang Huy', total: 71000, status: 'PREPARING' as const },
  { code: '#114', customer: 'Đặng Thu Hà', total: 231000, status: 'DELIVERED' as const },
]
export function OrdersTable({ messy = false }: { messy?: boolean }) {
  return (
    <div className="w-full rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Đơn</TableHead>
            <TableHead>Khách</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className={messy ? '' : 'text-right'}>Tổng</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ORDERS.map((o) => (
            <TableRow key={o.code}>
              <TableCell className="font-medium">{o.code}</TableCell>
              <TableCell>{o.customer}</TableCell>
              <TableCell>{messy ? <span className="text-primary">{o.status}</span> : <OrderStatusBadge status={o.status} />}</TableCell>
              <TableCell className={messy ? '' : 'text-right tabular-nums'}>{messy ? `${o.total}đ` : vnd(o.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

