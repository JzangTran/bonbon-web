/** The ranges a shop usually wants: today, the last week, the last month, or two dates of its own. */
export type RangePreset = 'today' | '7d' | '30d' | 'custom'

export const PRESET_LABEL: Record<RangePreset, string> = {
  today: 'Hôm nay',
  '7d': '7 ngày qua',
  '30d': '30 ngày qua',
  custom: 'Tuỳ chọn',
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
  return { from: addDays(today, preset === '7d' ? -6 : -29), to: today }
}

/** The label under a bar: "05/10" for a day or the Monday of a week, "10/2026" for a month. */
export function shortLabel(start: string, granularity: 'day' | 'week' | 'month'): string {
  const [y, m, d] = start.split('-')
  return granularity === 'month' ? `${m}/${y}` : `${d}/${m}`
}
