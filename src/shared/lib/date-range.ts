import { t } from '@/shared/i18n'
/** The ranges a shop usually wants: today, the last week, the last month, or two dates of its own. */
export type RangePreset = 'today' | '7d' | '30d' | '90d' | '12m' | 'custom'

export const PRESET_LABEL: Record<RangePreset, string> = {
  today: t('Hôm nay'),
  '7d': t('7 ngày qua'),
  '30d': t('30 ngày qua'),
  '90d': t('90 ngày qua'),
  '12m': t('12 tháng qua'),
  custom: t('Tuỳ chọn'),
}

const vietnamDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' })

/** The calendar day in Vietnam, as yyyy-mm-dd, whatever the browser's own time zone is. */
export function vietnamToday(now: number): string {
  return vietnamDay.format(new Date(now))
}

export function addDays(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Whole days between two yyyy-mm-dd days, both counted. */
export function daysInRange(from: string, to: string): number {
  return Math.round((new Date(`${to}T00:00:00Z`).getTime() - new Date(`${from}T00:00:00Z`).getTime()) / 86_400_000) + 1
}

export function presetRange(preset: Exclude<RangePreset, 'custom'>, today: string): { from: string; to: string } {
  if (preset === 'today') return { from: today, to: today }
  const back = { '7d': 6, '30d': 29, '90d': 89, '12m': 364 }[preset]
  return { from: addDays(today, -back), to: today }
}

/** The same number of days just before a range: what "so với kỳ trước" compares with. */
export function previousRange(range: { from: string; to: string }): { from: string; to: string } {
  const days = daysInRange(range.from, range.to)
  return { from: addDays(range.from, -days), to: addDays(range.from, -1) }
}

/** The label under a bar: "05/10" for a day or the Monday of a week, "10/2026" for a month. */
export function shortLabel(start: string, granularity: 'day' | 'week' | 'month'): string {
  const [y, m, d] = start.split('-')
  return granularity === 'month' ? `${m}/${y}` : `${d}/${m}`
}
