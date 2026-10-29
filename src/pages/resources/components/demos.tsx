import { useState } from 'react'
import { Badge } from '@/shared/ui/badge'
import { usePaging } from '@/shared/lib/use-paging'
import { cn } from '@/shared/lib/utils'
import { Pagination } from '@/shared/ui/pagination'
import { Segmented, StatsPanel, Toolbar } from '@/shared/ui/section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TimeChart, type ChartKind } from '@/shared/ui/time-chart'
import { intlLocale } from '@/shared/i18n'

/**
 * Live samples of the components pages that keep a little state of their own. Their text is placeholder text (Button, Label, Tab 1),
 * so a sample shows the component and nothing else; the guidance around it says what to write.
 */

export function SegmentedDemo() {
  const [v, setV] = useState<'1' | '2' | '3'>('1')
  return (
    <Segmented
      label="Segmented"
      options={[
        { id: '1', label: 'Option 1' },
        { id: '2', label: 'Option 2' },
        { id: '3', label: 'Option 3' },
      ]}
      value={v}
      onChange={setV}
    />
  )
}

const TABS = [
  { id: '1', label: 'Tab 1', count: 2 },
  { id: '2', label: 'Tab 2', count: 3 },
  { id: '3', label: 'Tab 3', count: 0 },
]
export function TabsDemo({ withCounts = true, labels }: { withCounts?: boolean; labels?: string[] }) {
  const tabs = labels ? labels.map((label, i) => ({ id: String(i + 1), label, count: 0 })) : TABS
  const [tab, setTab] = useState('1')
  return (
    <div className="w-full max-w-md rounded-lg bg-white">
      <div role="tablist" aria-label="PageTabs" className="flex gap-1 border-b border-grey-200 px-2">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={cn(
              '-mb-px flex h-11 items-center gap-2 rounded-t-md border-b-2 px-4 text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring',
              tab === x.id ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {x.label}
            {withCounts && x.count > 0 ? <span className="rounded-full bg-grey-100 px-1.5 text-caption text-ink tabular-nums">{x.count}</span> : null}
          </button>
        ))}
      </div>
      <p className="p-4 text-ui text-muted-foreground">{tabs.find((x) => x.id === tab)?.label} content</p>
    </div>
  )
}

export function PaginationDemo() {
  const paging = usePaging()
  return <Pagination paging={paging} total={132} className="w-full max-w-xl rounded-lg bg-white px-4 py-3" />
}

const POINTS = ['1', '2', '3', '4', '5', '6', '7'].map((d, i) => ({
  key: d,
  label: d,
  full: `Period ${d}`,
  values: { now: [42, 38, 51, 46, 72, 94, 86][i], before: [39, 41, 45, 47, 65, 88, 90][i] },
}))
export function ChartDemo({ kind: initial = 'bar', compare = true }: { kind?: ChartKind; compare?: boolean }) {
  const [kind, setKind] = useState<ChartKind>(initial)
  return (
    <StatsPanel className="w-full bg-white">
      <Toolbar className="justify-between">
        <h3 className="text-h3 font-medium">Title</h3>
        <Segmented
          label="Chart type"
          options={[
            { id: 'bar', label: 'Bar' },
            { id: 'line', label: 'Line' },
          ]}
          value={kind}
          onChange={setKind}
        />
      </Toolbar>
      <TimeChart
        ariaLabel="ChartPanel"
        kind={kind}
        format={(n) => n.toLocaleString(intlLocale)}
        series={compare ? [{ key: 'now', label: 'Series 1' }, { key: 'before', label: 'Series 2' }] : [{ key: 'now', label: 'Series 1' }]}
        points={POINTS}
      />
    </StatsPanel>
  )
}

const ROWS = [
  { name: 'Item 1', status: 'Badge', amount: 129000 },
  { name: 'Item 2', status: 'Badge', amount: 71000 },
  { name: 'Item 3', status: 'Badge', amount: 231000 },
]
export function SampleTable({ messy = false }: { messy?: boolean }) {
  return (
    <div className="w-full rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className={messy ? '' : 'text-right'}>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((r) => (
            <TableRow key={r.name}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell>{messy ? <span className="text-primary">STATUS_CODE</span> : <Badge>{r.status}</Badge>}</TableCell>
              <TableCell className={messy ? '' : 'text-right tabular-nums'}>{messy ? `${r.amount}đ` : `${r.amount.toLocaleString(intlLocale)} ₫`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
