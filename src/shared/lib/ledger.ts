import { formatVnd } from './format'

/** What each kind of ledger entry is called on screen. */
export const LEDGER_TYPE_LABEL: Record<string, string> = {
  ONLINE_EARNING: 'Đơn online đã giao',
  COD_COMMISSION: 'Hoa hồng đơn tiền mặt',
  PAYOUT: 'Nền tảng chi trả cho quán',
  COLLECTION: 'Quán trả hoa hồng',
  ADJUSTMENT: 'Điều chỉnh',
  CASE_REFUND: 'Hoàn tiền theo khiếu nại',
  CASE_COMMISSION_REVERSAL: 'Hoàn hoa hồng theo khiếu nại',
  TAX_WITHHOLDING: 'Thuế khấu trừ',
}

export const LEDGER_TYPES = Object.keys(LEDGER_TYPE_LABEL)

/** "+46.000 ₫" or "−4.000 ₫": the sign is part of the meaning of a ledger amount. */
export function formatSigned(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  if (amount === 0) return formatVnd(0)
  return `${amount > 0 ? '+' : '−'}${formatVnd(Math.abs(amount))}`
}

/** The last day of a statement row, so a row can be traced to the ledger lines behind it. */
export function periodEnd(start: string, granularity: 'day' | 'week' | 'month'): string {
  const d = new Date(`${start}T00:00:00`)
  if (granularity === 'week') d.setDate(d.getDate() + 6)
  if (granularity === 'month') {
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
  }
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

/** "tuần 05/10", "tháng 10/2026", "05/10": the label of a statement row. */
export function periodLabel(start: string, granularity: 'day' | 'week' | 'month'): string {
  const [y, m, d] = start.split('-')
  if (granularity === 'month') return `Tháng ${m}/${y}`
  if (granularity === 'week') return `Tuần ${d}/${m}`
  return `${d}/${m}/${y}`
}
