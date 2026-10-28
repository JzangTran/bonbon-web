/**
 * "+12% so với kỳ trước": the change from the previous period, signed, rounded to a whole percent. Null when there is nothing to
 * compare (no previous value, or the previous value was zero).
 */
export function deltaText(now: number | null | undefined, before: number | null | undefined): string | null {
  if (now == null || before == null) return null
  if (before === 0) return now === 0 ? '0% so với kỳ trước' : null
  const pct = Math.round(((now - before) / before) * 100)
  return `${pct > 0 ? '+' : ''}${pct}% so với kỳ trước`
}
