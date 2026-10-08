import { useState } from 'react'
import { useEarnings, useEarningsLedger, useEarningsStatement, type EarningsPeriod, type Granularity } from '@/entities/earnings'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { LEDGER_TYPE_LABEL, formatSigned, periodEnd, periodLabel } from '@/shared/lib/ledger'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const GRANULARITY_LABEL: Record<Granularity, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng' }

/** What the shop earns and owes (view-earnings.md): the balance in plain words, statements by period, and the ledger behind them. */
export function SellerEarningsPage() {
  const summary = useEarnings()
  const [granularity, setGranularity] = useState<Granularity>('week')
  const statement = useEarningsStatement(granularity)
  const [period, setPeriod] = useState<EarningsPeriod | null>(null)
  const [page, setPage] = useState(0)
  const ledger = useEarningsLedger({
    type: null,
    page,
    ...(period?.start ? { from: period.start, to: periodEnd(period.start, granularity) } : {}),
  })
  const s = summary.data
  const owing = (s?.balance ?? 0) < 0

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Thu nhập</h1>
        <p className="text-sm text-muted-foreground">Tiền giữa quán và bonbon. Mọi con số lấy từ sổ cái, cùng một sổ mà quản trị viên đối soát.</p>
      </div>
      {summary.isError ? <FormError message={problemMessage(summary.error)} /> : null}
      {summary.isPending ? <Skeleton className="h-28" /> : null}

      {s ? (
        <Card className="gap-2 p-5">
          <p className="text-sm text-muted-foreground">{owing ? 'Quán đang nợ bonbon' : 'bonbon đang nợ quán'}</p>
          <p className={cn('text-4xl font-semibold tabular-nums', owing ? 'text-danger-fg' : 'text-success-fg')}>{formatVnd(Math.abs(s.balance ?? 0))}</p>
          <p className="max-w-2xl text-sm">
            {owing
              ? 'Đây là hoa hồng của các đơn quán đã thu tiền mặt từ khách. Quán trả lại cho bonbon bằng chuyển khoản; khi quản trị viên ghi nhận, số này giảm đi.'
              : (s.balance ?? 0) === 0
                ? 'Hiện hai bên không nợ nhau.'
                : 'Đây là tiền khách đã thanh toán online cho đơn của quán (trừ hoa hồng). bonbon chuyển cho quán theo từng đợt; mỗi lần chuyển sẽ hiện ở sổ cái bên dưới kèm mã giao dịch.'}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.lastPayoutAt ? `Lần chuyển gần nhất: ${formatVnd(s.lastPayoutAmount)} lúc ${formatDateTime(s.lastPayoutAt)}.` : 'bonbon chưa chuyển tiền cho quán lần nào.'}
            {(s.heldForCases ?? 0) > 0 ? ` Đang giữ ${formatVnd(s.heldForCases)} vì khiếu nại chưa có quyết định.` : ''}
          </p>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Sao kê theo kỳ</h2>
          <div className="flex gap-1">
            {(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={granularity === g ? 'default' : 'outline'}
                onClick={() => {
                  setGranularity(g)
                  setPeriod(null)
                  setPage(0)
                }}
              >
                {GRANULARITY_LABEL[g]}
              </Button>
            ))}
          </div>
        </div>
        {statement.isError ? <FormError message={problemMessage(statement.error)} /> : null}
        {statement.data && (statement.data.periods ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có đơn nào trong 90 ngày gần nhất.</Card> : null}
        <div className="overflow-x-auto rounded-sm border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                {['Kỳ', 'Đơn', 'Tiền món', 'Giảm giá', 'Phí giao', 'Hoa hồng (gồm VAT)', 'bonbon đã chuyển', 'Quán đã trả', 'Số dư cuối', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-right font-medium first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(statement.data?.periods ?? []).map((p) => (
                <tr key={p.start} className={cn('border-t', period?.start === p.start && 'bg-accent')}>
                  <td className="px-3 py-2">{periodLabel(p.start ?? '', granularity)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{p.orders}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.foodValue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.discounts)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.deliveryFees)}</td>
                  <td className="px-3 py-2 text-right tabular-nums" title={`ròng ${formatVnd(p.commissionNet)} + VAT ${formatVnd(p.commissionVat)}`}>
                    {formatVnd(p.commission)}
                    <span className="block text-xs text-muted-foreground">
                      ròng {formatVnd(p.commissionNet)} · VAT {formatVnd(p.commissionVat)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.payouts)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.collections)}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{formatSigned(p.closingBalance)}</td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      size="sm"
                      variant={period?.start === p.start ? 'default' : 'outline'}
                      onClick={() => {
                        setPeriod(period?.start === p.start ? null : p)
                        setPage(0)
                      }}
                    >
                      {period?.start === p.start ? 'Bỏ lọc' : 'Xem đơn'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Sổ cái{period?.start ? `: ${periodLabel(period.start, granularity).toLowerCase()}` : ''}
        </h2>
        {ledger.isError ? <FormError message={problemMessage(ledger.error)} /> : null}
        {ledger.data && (ledger.data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có khoản nào.</Card> : null}
        <ul className="flex flex-col divide-y rounded-sm border bg-card">
          {(ledger.data?.items ?? []).map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {LEDGER_TYPE_LABEL[entry.type ?? ''] ?? entry.type}
                  {entry.orderNumber ? ` · đơn #${entry.orderNumber}` : ''}
                </p>
                {entry.itemsTotal !== undefined ? (
                  <p className="text-xs text-muted-foreground">
                    Món {formatVnd(entry.itemsTotal)}
                    {entry.discount ? ` · giảm ${formatVnd(entry.discount)}` : ''} · phí giao {formatVnd(entry.deliveryFee)} · hoa hồng {formatVnd(entry.commission)}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                  {entry.reference ? ` · mã giao dịch ${entry.reference}` : ''}
                  {entry.note ? ` · ${entry.note}` : ''}
                </p>
              </div>
              <p className={cn('font-semibold tabular-nums', (entry.amount ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>{formatSigned(entry.amount)}</p>
            </li>
          ))}
        </ul>
        {(ledger.data?.total ?? 0) > (ledger.data?.size ?? 20) ? (
          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Trang trước
            </Button>
            <span className="text-sm text-muted-foreground">
              Trang {page + 1} / {Math.ceil((ledger.data?.total ?? 0) / (ledger.data?.size ?? 20))}
            </span>
            <Button variant="outline" disabled={(page + 1) * (ledger.data?.size ?? 20) >= (ledger.data?.total ?? 0)} onClick={() => setPage(page + 1)}>
              Trang sau
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
