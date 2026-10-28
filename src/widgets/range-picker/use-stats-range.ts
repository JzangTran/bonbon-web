import { useState } from 'react'
import { presetRange, previousRange, vietnamToday, type RangePreset } from '@/shared/lib/date-range'
import { useNow } from '@/shared/lib/use-now'

export type Granularity = 'day' | 'week' | 'month'
export const GRANULARITY_LABEL: Record<Granularity, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }
export const granularityLabel = (g: Granularity) => GRANULARITY_LABEL[g]

export type StatsRange = ReturnType<typeof useStatsRange>

/**
 * The filters a statistics page shares with every chart and table on it: a preset or two dates of its own (Vietnam-time days), the
 * time step, and whether to compare with the period just before.
 */
export function useStatsRange(initial: Exclude<RangePreset, 'custom'> = '7d') {
  const today = vietnamToday(useNow(60_000))
  const [preset, setPresetState] = useState<RangePreset>(initial)
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null)
  const [granularity, setGranularity] = useState<Granularity>(initial === '12m' ? 'month' : 'day')
  const [compare, setCompare] = useState(false)
  const range = preset === 'custom' && custom ? custom : presetRange(preset === 'custom' ? initial : preset, today)
  const invalid = preset === 'custom' && custom !== null && custom.from > custom.to
  const setPreset = (p: RangePreset) => {
    setPresetState(p)
    // A year of single days is unreadable; a short range has nothing to group by month.
    if (p === '12m' && granularity === 'day') setGranularity('month')
    if ((p === 'today' || p === '7d') && granularity === 'month') setGranularity('day')
  }
  return { today, preset, setPreset, custom, setCustom, granularity, setGranularity, compare, setCompare, range, previous: previousRange(range), invalid }
}
