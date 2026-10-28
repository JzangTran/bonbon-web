import { CalendarIcon } from 'lucide-react'
import { PRESET_LABEL, addDays, daysInRange, type RangePreset } from '@/shared/lib/date-range'
import { Input } from '@/shared/ui/input'
import { ActionGroup, Segmented, Toolbar } from '@/shared/ui/section'
import { GRANULARITY_LABEL, type Granularity, type StatsRange } from './use-stats-range'

const day = (d: string) => d.split('-').reverse().join('/')

/**
 * The filter row above a statistics page, scoping everything under it: the period (presets, or two dates), the time step and the
 * comparison with the period just before. One row, left-aligned; each control group sits apart from the next.
 */
export function RangePicker({ state, steps = true, comparable = true }: { state: StatsRange; steps?: boolean; comparable?: boolean }) {
  const { today, preset, setPreset, custom, setCustom, granularity, setGranularity, compare, setCompare, range, previous, invalid } = state
  return (
    <div className="flex flex-col gap-3">
      <Toolbar>
        <Segmented
          label="Khoảng thời gian"
          options={(Object.keys(PRESET_LABEL) as RangePreset[]).map((p) => ({
            id: p,
            label:
              p === 'custom' ? (
                <>
                  <CalendarIcon />
                  {PRESET_LABEL[p]}
                </>
              ) : (
                PRESET_LABEL[p]
              ),
          }))}
          value={preset}
          onChange={(p) => {
            setPreset(p)
            if (p === 'custom' && !custom) setCustom({ from: addDays(today, -13), to: today })
          }}
        />
        {steps ? (
          <Segmented
            label="Chia theo"
            options={(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => ({ id: g, label: GRANULARITY_LABEL[g] }))}
            value={granularity}
            onChange={setGranularity}
          />
        ) : null}
        {comparable ? (
          <label className="flex items-center gap-2 text-small text-muted-foreground">
            <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            So với kỳ trước
          </label>
        ) : null}
      </Toolbar>
      {preset === 'custom' && custom ? (
        <ActionGroup className="text-small">
          <label className="flex items-center gap-2">
            Từ
            <Input type="date" className="h-8 w-40" max={today} value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
          </label>
          <label className="flex items-center gap-2">
            đến
            <Input type="date" className="h-8 w-40" max={today} value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </label>
          {invalid ? <span className="text-danger-fg">Ngày bắt đầu phải trước ngày kết thúc.</span> : null}
        </ActionGroup>
      ) : null}
      <p className="text-small text-muted-foreground">
        {range.from === range.to ? day(range.from) : `${day(range.from)} – ${day(range.to)}`} ({daysInRange(range.from, range.to)} ngày)
        {compare && comparable ? ` · so với ${day(previous.from)} – ${day(previous.to)}` : ''}
      </p>
    </div>
  )
}
