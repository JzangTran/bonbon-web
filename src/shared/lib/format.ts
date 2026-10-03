const vnd = new Intl.NumberFormat('vi-VN')
const relative = new Intl.RelativeTimeFormat('vi-VN', { numeric: 'auto' })
const dateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** Money is always shown as `12.000 ₫` (ui-design-and-tech.md, common patterns). */
export function formatVnd(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? '—' : `${vnd.format(amount)} ₫`
}

/** "5 phút trước", "hôm qua"… for times where urgency matters; Vietnam time otherwise. */
export function formatRelative(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—'
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 60) return relative.format(seconds, 'second')
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(seconds / 3600), 'hour')
  if (abs < 7 * 86400) return relative.format(Math.round(seconds / 86400), 'day')
  return formatDateTime(iso)
}

export function formatDateTime(iso: string | null | undefined): string {
  return iso ? dateTime.format(new Date(iso)) : '—'
}

/** ISO weekday (1 = Monday) to its Vietnamese name. */
export const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'] as const

export function weekdayName(weekday: number | undefined): string {
  return weekday ? WEEKDAYS[weekday - 1] : '—'
}

/** "06:00:00" or "06:00" to "06:00". */
export function formatTime(time: string | undefined): string {
  return time ? time.slice(0, 5) : '—'
}
