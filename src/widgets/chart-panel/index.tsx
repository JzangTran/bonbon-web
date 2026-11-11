import { BarChart3Icon, LineChartIcon, Table2Icon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Segmented, StatsPanel } from '@/shared/ui/section'
import { TimeChart, type ChartKind, type ChartPoint, type ChartSeries } from '@/shared/ui/time-chart'
import { t } from '@/shared/i18n'

export type ChartMetric<T> = { id: string; label: string; value: (row: T) => number | null | undefined; format: (n: number) => string }

/**
 * A chart on the beige statistics ground with its own controls: which measure (orders, revenue, average…) and bar, line or table.
 * The period, step and comparison come from the page's filter row, so every chart on the page shows the same slice. `previous`
 * holds the rows of the period before, matched to `current` by position.
 */
export function ChartPanel<T>({
  title,
  description,
  metrics,
  current,
  previous,
  label,
  full,
  initialKind = 'bar',
  empty,
  footer,
}: {
  title: string
  description?: ReactNode
  metrics: ChartMetric<T>[]
  current: T[]
  previous?: T[]
  /** short label under the axis and full label for the tooltip and table, for row i */
  label: (row: T, i: number) => string
  full: (row: T, i: number) => string
  initialKind?: ChartKind
  /** shown instead of the chart when there is nothing to draw */
  empty?: ReactNode
  footer?: ReactNode
}) {
  const [metricId, setMetricId] = useState(metrics[0].id)
  const [kind, setKind] = useState<ChartKind>(initialKind)
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0]
  const series: ChartSeries[] = previous
    ? [
        { key: 'now', label: t('Kỳ này') },
        { key: 'before', label: t('Kỳ trước') },
      ]
    : [{ key: 'now', label: metric.label }]
  const points: ChartPoint[] = current.map((row, i) => ({
    key: String(i),
    label: label(row, i),
    full: full(row, i),
    values: { now: metric.value(row), ...(previous ? { before: previous[i] ? metric.value(previous[i]) : null } : {}) },
  }))

  return (
    <StatsPanel>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3 font-medium">{title}</h2>
          {description ? <p className="text-small text-muted-foreground">{description}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {metrics.length > 1 ? <Segmented label={t('Số liệu')} options={metrics.map((m) => ({ id: m.id, label: m.label }))} value={metric.id} onChange={setMetricId} /> : null}
          <Segmented
            label={t('Kiểu hiển thị')}
            options={[
              { id: 'bar', label: <><BarChart3Icon /><span>{t('Cột')}</span></> },
              { id: 'line', label: <><LineChartIcon /><span>{t('Đường')}</span></> },
              { id: 'table', label: <><Table2Icon /><span>{t('Bảng')}</span></> },
            ]}
            value={view === 'table' ? 'table' : kind}
            onChange={(v) => {
              if (v === 'table') setView('table')
              else {
                setView('chart')
                setKind(v as ChartKind)
              }
            }}
          />
        </div>
      </div>
      {current.length === 0 && empty ? empty : <TimeChart points={points} series={series} kind={kind} view={view} format={metric.format} ariaLabel={`${title}: ${metric.label}`} />}
      {footer}
    </StatsPanel>
  )
}
