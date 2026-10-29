import { useId, useMemo, useState, type PointerEvent } from 'react'
import { cn } from '@/shared/lib/utils'
import { intlLocale, locale, t } from '@/shared/i18n'

export type ChartSeries = { key: string; label: string }
/** One position on the x axis: a short label under the axis, a full one for the tooltip and the table, a value per series. */
export type ChartPoint = { key: string; label: string; full: string; values: Record<string, number | null | undefined> }
export type ChartKind = 'bar' | 'line'

/** Series colours in fixed order (tokens.css, checked for colour-blind separation): a series keeps its colour whatever is shown. */
const SERIES_COLOUR = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)']

const W = 720
const H = 260
const PAD = { top: 12, right: 12, bottom: 28, left: 56 }

/** Up to five round ticks from 0 to just above the largest value. */
function ticks(max: number): number[] {
  if (max <= 0) return [0, 1]
  const rough = max / 4
  const mag = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough) ?? 10 * mag
  const out = []
  for (let v = 0; v <= max + step * 0.0001 || out.length < 2; v += step) out.push(v)
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + step)
  return out
}

/** 1 234 567 → 1,2 tr; 12 500 → 12,5 N: short enough for an axis. */
export function compactNumber(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e9) return t('{v0} tỷ', { v0: (n / 1e9).toLocaleString(intlLocale, { maximumFractionDigits: 1 }) })
  if (abs >= 1e6) return `${(n / 1e6).toLocaleString(intlLocale, { maximumFractionDigits: 1 })}${locale === 'vi' ? ' tr' : 'M'}`
  if (abs >= 1e3) return `${(n / 1e3).toLocaleString(intlLocale, { maximumFractionDigits: 1 })}${locale === 'vi' ? ' N' : 'K'}`
  return n.toLocaleString(intlLocale)
}

/**
 * A chart over time (or over any ordered positions) for one to three series, as bars or lines. One y axis starting at zero, light
 * grid, thin marks; hovering or focusing a position shows every series' value there. Below 2 series there is no legend (the
 * section title names it); from 2 a legend sits above. `view="table"` shows the same numbers as a table.
 */
export function TimeChart({
  points,
  series,
  kind = 'bar',
  view = 'chart',
  format = (n) => n.toLocaleString(intlLocale),
  ariaLabel,
  className,
}: {
  points: ChartPoint[]
  series: ChartSeries[]
  kind?: ChartKind
  view?: 'chart' | 'table'
  /** how a value is written in the tooltip and the table */
  format?: (n: number) => string
  ariaLabel: string
  className?: string
}) {
  const id = useId()
  const [hover, setHover] = useState<number | null>(null)
  const max = useMemo(() => Math.max(0, ...points.flatMap((p) => series.map((s) => p.values[s.key] ?? 0))), [points, series])
  const yTicks = ticks(max)
  const top = yTicks[yTicks.length - 1] || 1
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const band = points.length > 0 ? innerW / points.length : innerW
  const x = (i: number) => PAD.left + band * i + band / 2
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH
  const every = Math.max(1, Math.ceil(points.length / 8))
  const barW = Math.max(2, Math.min(24, (band - 4) / series.length - 2))

  if (view === 'table') {
    return (
      <div className={cn('max-h-96 overflow-auto', className)}>
        <table className="w-full text-ui">
          <thead className="sticky top-0 bg-beige-50 text-small text-muted-foreground">
            <tr className="border-b border-grey-200">
              <th className="py-2 pr-3 text-left font-normal">{t('Kỳ')}</th>
              {series.map((s) => (
                <th key={s.key} className="px-3 py-2 text-right font-normal">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map((p) => (
              <tr key={p.key} className="border-b border-grey-200/60 last:border-0">
                <td className="py-2 pr-3">{p.full}</td>
                {series.map((s) => (
                  <td key={s.key} className="px-3 py-2 text-right tabular-nums">
                    {p.values[s.key] == null ? '—' : format(p.values[s.key]!)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    const i = Math.floor((px - PAD.left) / band)
    setHover(i >= 0 && i < points.length ? i : null)
  }
  const hovered = hover === null ? null : points[hover]
  const tipLeft = hover === null ? 0 : (x(hover) / W) * 100

  return (
    <div className={cn('relative flex flex-col gap-3', className)}>
      {series.length > 1 ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-small text-muted-foreground" aria-label={t('Chú thích')}>
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              {kind === 'line' ? (
                <span aria-hidden="true" className="h-0.5 w-4 rounded-full" style={{ background: SERIES_COLOUR[i] }} />
              ) : (
                <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: SERIES_COLOUR[i] }} />
              )}
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-none select-none"
          role="img"
          aria-labelledby={`${id}-t`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setHover((h) => Math.min(points.length - 1, (h ?? -1) + 1))
            if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? points.length) - 1))
          }}
          onBlur={() => setHover(null)}
        >
          <title id={`${id}-t`}>{ariaLabel}</title>
          {yTicks.map((tItem) => (
            <g key={tItem}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(tItem)} y2={y(tItem)} stroke={tItem === 0 ? 'var(--chart-axis)' : 'var(--chart-grid)'} strokeWidth={1} />
              <text x={PAD.left - 8} y={y(tItem)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px] tabular-nums">
                {compactNumber(tItem)}
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % every === 0 ? (
              <text key={p.key} x={x(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                {p.label}
              </text>
            ) : null,
          )}
          {hover !== null ? <rect x={PAD.left + band * hover} y={PAD.top} width={band} height={innerH} fill="var(--chart-grid)" opacity={0.6} /> : null}
          {kind === 'bar'
            ? points.map((p, i) =>
                series.map((s, si) => {
                  const v = p.values[s.key] ?? 0
                  if (v <= 0) return null
                  const groupW = series.length * (barW + 2) - 2
                  const bx = x(i) - groupW / 2 + si * (barW + 2)
                  const by = y(v)
                  const h = PAD.top + innerH - by
                  const r = Math.min(4, barW / 2, h)
                  return (
                    <path
                      key={`${p.key}-${s.key}`}
                      d={`M${bx} ${by + h} V${by + r} Q${bx} ${by} ${bx + r} ${by} H${bx + barW - r} Q${bx + barW} ${by} ${bx + barW} ${by + r} V${by + h} Z`}
                      fill={SERIES_COLOUR[si]}
                      opacity={hover === null || hover === i ? 1 : 0.55}
                    />
                  )
                }),
              )
            : series.map((s, si) => {
                const d = points
                  .map((p, i) => (p.values[s.key] == null ? null : `${x(i)} ${y(p.values[s.key]!)}`))
                  .filter(Boolean)
                  .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt}`)
                  .join(' ')
                return (
                  <g key={s.key}>
                    <path d={d} fill="none" stroke={SERIES_COLOUR[si]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                    {hover !== null && hovered?.values[s.key] != null ? (
                      <circle cx={x(hover)} cy={y(hovered.values[s.key]!)} r={4.5} fill={SERIES_COLOUR[si]} stroke="var(--beige-50)" strokeWidth={2} />
                    ) : null}
                  </g>
                )
              })}
        </svg>
        {hovered ? (
          <div
            role="status"
            className="pointer-events-none absolute top-2 z-10 min-w-36 -translate-x-1/2 rounded-lg bg-white px-3 py-2 text-small shadow-float"
            style={{ left: `clamp(5rem, ${tipLeft}%, calc(100% - 5rem))` }}
          >
            <p className="mb-1 text-muted-foreground">{hovered.full}</p>
            {series.map((s, i) => (
              <p key={s.key} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span aria-hidden="true" className="h-0.5 w-3 rounded-full" style={{ background: SERIES_COLOUR[i] }} />
                  {s.label}
                </span>
                <b className="font-medium text-ink tabular-nums">{hovered.values[s.key] == null ? '—' : format(hovered.values[s.key]!)}</b>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
