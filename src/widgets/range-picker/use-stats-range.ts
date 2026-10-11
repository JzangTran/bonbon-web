import { useState } from 'react'
import { presetRange, vietnamToday, type RangePreset } from '@/shared/lib/date-range'
import { useNow } from '@/shared/lib/use-now'

export type Granularity = 'day' | 'week' | 'month'
export const GRANULARITY_LABEL: Record<Granularity, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }
export const granularityLabel = (g: Granularity) => GRANULARITY_LABEL[g]

export type StatsRange = ReturnType<typeof useStatsRange>

/** The range and granularity a statistics page asks for: a preset or two dates of its own, in Vietnam-time days. */
export function useStatsRange(initial: Exclude<RangePreset, 'custom'> = '7d') {
  const today = vietnamToday(useNow(60_000))
  const [preset, setPreset] = useState<RangePreset>(initial)
  const [custom, setCustom] = useState<{ from: string; to: string } | null>(null)
  const [granularity, setGranularity] = useState<Granularity>('day')
  const range = preset === 'custom' && custom ? custom : presetRange(preset === 'custom' ? initial : preset, today)
  const invalid = preset === 'custom' && custom !== null && custom.from > custom.to
  return { today, preset, setPreset, custom, setCustom, granularity, setGranularity, range, invalid }
}
