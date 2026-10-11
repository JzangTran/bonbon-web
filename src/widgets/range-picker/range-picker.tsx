import { PRESET_LABEL, addDays, daysInRange, type RangePreset } from '@/shared/lib/date-range'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { GRANULARITY_LABEL, type Granularity, type StatsRange } from './use-stats-range'


/** Presets, the two date inputs for a custom range, the granularity and a one-line summary of what is selected. */
export function RangePicker({ state }: { state: StatsRange }) {
  const { today, preset, setPreset, custom, setCustom, granularity, setGranularity, range, invalid } = state
  return (
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
          {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => (
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
          {invalid ? <span className="text-danger-fg">Ngày bắt đầu phải trước ngày kết thúc.</span> : null}
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {range.from === range.to ? range.from.split('-').reverse().join('/') : `${range.from.split('-').reverse().join('/')} – ${range.to.split('-').reverse().join('/')}`} ({daysInRange(range.from, range.to)} ngày)
      </p>
    </Card>
  )
}
