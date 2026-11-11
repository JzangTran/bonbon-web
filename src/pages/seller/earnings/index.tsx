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
import { FinanceTabs } from '@/widgets/seller-tabs'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { Segmented, StatsPanel } from '@/shared/ui/section'
import { ChartPanel, type ChartMetric } from '@/widgets/chart-panel'
import { t } from '@/shared/i18n'

const PERIOD_METRICS: ChartMetric<EarningsPeriod>[] = [
  { id: 'food', label: t('Tiền món'), value: (p) => p.foodValue, format: formatVnd },
  { id: 'commission', label: t('Hoa hồng'), value: (p) => p.commission, format: formatVnd },
  { id: 'orders', label: t('Số đơn'), value: (p) => p.orders, format: (n) => t('{v0} đơn', { v0: n }) },
]

const GRANULARITY_LABEL: Record<Granularity, string> = { day: t('Ngày'), week: t('Tuần'), month: t('Tháng') }

/** What the shop earns and owes (view-earnings.md): the balance in plain words, statements by period, and the ledger behind them. */
export function SellerEarningsPage() {
  const summary = useEarnings()
  const [granularity, setGranularity] = useState<Granularity>('week')
  const statement = useEarningsStatement(granularity)
  const [period, setPeriod] = useState<EarningsPeriod | null>(null)
  const paging = usePaging()
  const [view, setView] = useState<'statement' | 'ledger'>('statement')
  const ledger = useEarningsLedger({
    type: null,
    page: paging.page,
    size: paging.size,
    ...(period?.start ? { from: period.start, to: periodEnd(period.start, granularity) } : {}),
  })
  const s = summary.data
  const owing = (s?.balance ?? 0) < 0

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <FinanceTabs />
      <div>
        <h1 className="text-2xl font-semibold">{t('Thu nhập')}</h1>
        <p className="text-sm text-muted-foreground">{t('Tiền giữa quán và bonbon. Mọi con số lấy từ sổ cái, cùng một sổ mà quản trị viên đối soát.')}</p>
      </div>
      {summary.isError ? <FormError message={problemMessage(summary.error)} /> : null}
      {summary.isPending ? <Skeleton className="h-28" /> : null}

      {s ? (
        <StatsPanel className="gap-2">
          <p className="text-sm text-muted-foreground">{owing ? t('Quán đang nợ bonbon') : t('bonbon đang nợ quán')}</p>
          <p className={cn('text-4xl font-semibold tabular-nums', owing ? 'text-danger-fg' : 'text-success-fg')}>{formatVnd(Math.abs(s.balance ?? 0))}</p>
          <p className="max-w-2xl text-sm">
            {owing
              ? t('Đây là hoa hồng của các đơn quán đã thu tiền mặt từ khách. Quán trả lại cho bonbon bằng chuyển khoản; khi quản trị viên ghi nhận, số này giảm đi.')
              : (s.balance ?? 0) === 0
                ? t('Hiện hai bên không nợ nhau.')
                : t('Đây là tiền khách đã thanh toán online cho đơn của quán (trừ hoa hồng). bonbon chuyển cho quán theo từng đợt; mỗi lần chuyển sẽ hiện ở sổ cái bên dưới kèm mã giao dịch.')}
          </p>
          <p className="text-xs text-muted-foreground">
            {s.lastPayoutAt ? t('Lần chuyển gần nhất: {v0} lúc {v1}.', { v0: formatVnd(s.lastPayoutAmount), v1: formatDateTime(s.lastPayoutAt) }) : t('bonbon chưa chuyển tiền cho quán lần nào.')}
            {(s.heldForCases ?? 0) > 0 ? t(' Đang giữ {v0} vì khiếu nại chưa có quyết định.', { v0: formatVnd(s.heldForCases) }) : ''}
          </p>
        </StatsPanel>
      ) : null}

      <Segmented
        label={t('Xem')}
        options={[
          { id: 'statement', label: t('Sao kê theo kỳ') },
          { id: 'ledger', label: period?.start ? t('Sổ cái: {v0}', { v0: periodLabel(period.start, granularity).toLowerCase() }) : t('Sổ cái') },
        ]}
        value={view}
        onChange={setView}
        className="self-start"
      />

      {view === 'statement' ? (
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h3 font-medium">{t('Sao kê theo kỳ')}</h2>
          <Segmented
            label={t('Chia theo')}
            options={(Object.keys(GRANULARITY_LABEL) as Granularity[]).map((g) => ({ id: g, label: GRANULARITY_LABEL[g] }))}
            value={granularity}
            onChange={(g) => {
              setGranularity(g)
              setPeriod(null)
              paging.reset()
            }}
          />
        </div>
        {statement.isError ? <FormError message={problemMessage(statement.error)} /> : null}
        {statement.data && (statement.data.periods ?? []).length > 0 ? (
          <ChartPanel
            title={t('Tiền theo kỳ')}
            metrics={PERIOD_METRICS}
            current={[...(statement.data.periods ?? [])].reverse()}
            label={(p) => periodLabel(p.start ?? '', granularity)}
            full={(p) => periodLabel(p.start ?? '', granularity)}
          />
        ) : null}
        {statement.data && (statement.data.periods ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{t('Chưa có đơn nào trong 90 ngày gần nhất.')}</Card> : null}
        <div className="overflow-x-auto rounded-xl bg-beige-50 px-2 py-1 sm:px-3">
          <table className="w-full text-ui">
            <thead className="text-small text-muted-foreground">
              <tr>
                {[t('Kỳ'), t('Đơn'), t('Tiền món'), t('Giảm giá'), t('Phí giao'), t('Hoa hồng (gồm VAT)'), t('bonbon đã chuyển'), t('Quán đã trả'), t('Số dư cuối'), ''].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-right font-normal whitespace-nowrap first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(statement.data?.periods ?? []).map((p) => (
                <tr key={p.start} className={cn('border-t border-grey-200', period?.start === p.start && 'font-medium text-primary')}>
                  <td className="px-3 py-3">{periodLabel(p.start ?? '', granularity)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{p.orders}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.foodValue)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.discounts)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.deliveryFees)}</td>
                  <td className="px-3 py-3 text-right tabular-nums" title={t('ròng {v0} + VAT {v1}', { v0: formatVnd(p.commissionNet), v1: formatVnd(p.commissionVat) })}>
                    {formatVnd(p.commission)}
                    <span className="block text-xs text-muted-foreground">
                      {t('ròng ')}{formatVnd(p.commissionNet)} · VAT {formatVnd(p.commissionVat)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.payouts)}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.collections)}</td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">{formatSigned(p.closingBalance)}</td>
                  <td className="px-3 py-3 text-right">
                    <Button
                      size="sm"
                      variant={period?.start === p.start ? 'default' : 'outline'}
                      onClick={() => {
                        setPeriod(period?.start === p.start ? null : p)
                        paging.reset()
                        if (period?.start !== p.start) setView('ledger')
                      }}
                    >
                      {period?.start === p.start ? t('Bỏ lọc') : t('Xem đơn')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          {t('Sổ cái')}{period?.start ? `: ${periodLabel(period.start, granularity).toLowerCase()}` : ''}
        </h2>
        {ledger.isError ? <FormError message={problemMessage(ledger.error)} /> : null}
        {ledger.data && (ledger.data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{t('Chưa có khoản nào.')}</Card> : null}
        <ul className="flex flex-col divide-y rounded-sm border bg-card">
          {(ledger.data?.items ?? []).map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">
                  {LEDGER_TYPE_LABEL[entry.type ?? ''] ?? entry.type}
                  {entry.orderNumber ? t(' · đơn #{v0}', { v0: entry.orderNumber }) : ''}
                </p>
                {entry.itemsTotal !== undefined ? (
                  <p className="text-xs text-muted-foreground">
                    {t('Món ')}{formatVnd(entry.itemsTotal)}
                    {entry.discount ? t(' · giảm {v0}', { v0: formatVnd(entry.discount) }) : ''}{t(' · phí giao ')}{formatVnd(entry.deliveryFee)}{t(' · hoa hồng ')}{formatVnd(entry.commission)}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                  {entry.reference ? t(' · mã giao dịch {v0}', { v0: entry.reference }) : ''}
                  {entry.note ? ` · ${entry.note}` : ''}
                </p>
              </div>
              <p className={cn('font-semibold tabular-nums', (entry.amount ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>{formatSigned(entry.amount)}</p>
            </li>
          ))}
        </ul>
        <Pagination paging={paging} total={ledger.data?.total ?? 0} />
      </section>
      )}
    </div>
  )
}
