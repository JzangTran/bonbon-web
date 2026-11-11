import { useState } from 'react'
import {
  APPEAL_LABEL,
  CONSEQUENCE,
  FAULT_LABEL,
  useAppealPenalty,
  useMyPerformance,
  useMySuspension,
  useWeekFaults,
  type ShopPenalty,
} from '@/entities/performance'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { OrderCaseTabs } from '@/widgets/seller-tabs'
import { ChartPanel, type ChartMetric } from '@/widgets/chart-panel'
import { Segmented, StatsPanel } from '@/shared/ui/section'
import { intlLocale, t } from '@/shared/i18n'

/** How the shop is doing on the orders it fails, the points that follow, and what they lead to (view-shop-performance.md). */
export function SellerPerformancePage() {
  const performance = useMyPerformance()
  const suspension = useMySuspension()
  const [week, setWeek] = useState<string | null>(null)
  const faults = useWeekFaults(week)
  const appeal = useAppealPenalty()
  const [appealing, setAppealing] = useState<ShopPenalty | null>(null)
  const [reason, setReason] = useState('')
  const [view, setView] = useState<'weeks' | 'penalties'>('weeks')
  const p = performance.data
  const standing = p?.standing
  const consequence = CONSEQUENCE[standing?.consequence ?? 'NONE'] ?? CONSEQUENCE.NONE

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <OrderCaseTabs />
      <div>
        <h1 className="text-2xl font-semibold">{t('Hiệu suất cửa hàng')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Đơn thất bại do quán (từ chối, không trả lời kịp, không giao đi kịp, huỷ sau khi nhận, khiếu nại hoàn cả đơn, không đến khi giao). Đơn khách huỷ, thanh toán quá hạn và hoàn một phần không bị tính.')}
        </p>
      </div>

      {suspension.data && suspension.data.status !== 'NONE' ? (
        <Card className="gap-1 border-danger p-4">
          <p className="font-semibold text-danger-fg">{suspension.data.status === 'SUSPENDED' ? t('Quán đang bị đình chỉ') : t('Quán sắp bị đình chỉ')}</p>
          <p className="text-sm">
            {suspension.data.status === 'SUSPENDED'
              ? t('Khách không tìm thấy quán và không đặt thêm được. Bạn vẫn hoàn tất các đơn đang làm và xem được thu nhập.')
              : t('Từ {v0} quán sẽ bị đình chỉ. Đến lúc đó quán vẫn hoạt động bình thường.', { v0: formatDateTime(suspension.data.effectiveAt) })}
          </p>
          {suspension.data.reason ? <p className="text-sm text-muted-foreground">{t('Lý do: ')}{suspension.data.reason}</p> : null}
        </Card>
      ) : null}

      {performance.isError ? <FormError message={problemMessage(performance.error)} /> : null}
      {performance.isPending ? <Skeleton className="h-32" /> : null}

      {standing ? (
        <StatsPanel className="gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl font-semibold tabular-nums">{standing.activePoints ?? 0}</span>
            <span className="text-muted-foreground">{t('điểm phạt còn hiệu lực')}</span>
            <Badge className={consequence.className}>{consequence.label}</Badge>
          </div>
          <p className="text-sm">
            {standing.consequence === 'RESTRICTED'
              ? t('Quán không hiện khi khách tìm kiếm và xếp cuối danh sách, nhưng khách mở thẳng quán vẫn đặt được. Hạn chế được gỡ ngay khi điểm xuống dưới 3.')
              : standing.consequence === 'RESTRICTION_SCHEDULED'
                ? t('Từ {v0} quán sẽ bị hạn chế hiển thị. Nếu điểm xuống dưới 3 trước ngày đó, hạn chế được huỷ.', { v0: formatDateTime(standing.restrictionStartsAt) })
                : standing.consequence === 'WARNING'
                  ? t('Mới là cảnh báo. Từ 3 điểm quán bị hạn chế hiển thị, sau khi được báo trước 5 ngày.')
                  : t('Quán đang đạt yêu cầu.')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('Mỗi tuần (thứ Hai) hệ thống đánh giá tuần vừa đóng: từ ')}{p?.minOrders}{t(' đơn trở lên mà tỷ lệ lỗi vượt ')}{p?.thresholdPercent}{t('% thì bị 1 điểm; điểm hết hạn sau 90 ngày.')}
          </p>
        </StatsPanel>
      ) : null}

      <Segmented
        label={t('Xem')}
        options={[
          { id: 'weeks', label: t('Theo tuần') },
          { id: 'penalties', label: t('Điểm phạt ({v0})', { v0: (p?.penalties ?? []).length }) },
        ]}
        value={view}
        onChange={setView}
        className="self-start"
      />

      {view === 'weeks' && p ? (
        <ChartPanel
          title={t('Tỷ lệ đơn lỗi theo tuần')}
          description={t('Vượt {v0}% trong tuần có từ {v1} đơn thì bị 1 điểm.', { v0: p.thresholdPercent, v1: p.minOrders })}
          metrics={WEEK_METRICS}
          current={[...(p.weeks ?? [])].reverse()}
          label={(w) => formatDay(w.start)}
          full={(w) => `${formatDay(w.start)} – ${formatDay(w.end)}${w.current ? t(' (tạm tính)') : ''}`}
          initialKind="line"
        />
      ) : null}

      {view === 'weeks' ? (
      <section className="flex flex-col gap-3">
        <h2 className="text-h3 font-medium">{t('Chi tiết từng tuần')}</h2>
        <div className="overflow-x-auto rounded-xl bg-beige-50 px-2 py-1 sm:px-3">
          <table className="w-full text-ui">
            <thead className="text-small text-muted-foreground">
              <tr>
                {[t('Tuần'), t('Đơn kết thúc'), t('Đơn lỗi'), t('Tỷ lệ lỗi'), t('Kết quả'), ''].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-right font-normal whitespace-nowrap first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(p?.weeks ?? []).map((w) => (
                <tr key={w.start} className={cn('border-t border-grey-200', week === w.start && 'font-medium text-primary')}>
                  <td className="px-3 py-3">
                    {formatDay(w.start)} – {formatDay(w.end)}
                    {w.current ? <span className="ml-2 text-xs text-muted-foreground">{t('(tạm tính)')}</span> : null}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{w.finishedOrders}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{w.faultOrders}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{w.ratePercent}%</td>
                  <td className="px-3 py-3 text-right text-xs">
                    {w.current ? '' : w.penalised ? <span className="text-danger-fg">{t('+1 điểm')}</span> : w.counted ? t('Đạt') : t('Chưa đủ {v0} đơn', { v0: p?.minOrders })}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {(w.faultOrders ?? 0) > 0 ? (
                      <Button size="sm" variant={week === w.start ? 'default' : 'outline'} onClick={() => setWeek(week === w.start ? null : (w.start ?? null))}>
                        {week === w.start ? t('Ẩn') : t('Xem đơn')}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {week ? (
          <Card className="gap-2 p-4">
            <h3 className="font-semibold">{t('Các đơn lỗi tuần ')}{formatDay(week)}</h3>
            {faults.isPending ? <Skeleton className="h-12" /> : null}
            <ul className="divide-y text-sm">
              {(faults.data ?? []).map((f) => (
                <li key={`${f.orderId}-${f.type}`} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>
                    {t('Đơn #')}{f.orderNumber} · {FAULT_LABEL[f.type ?? ''] ?? f.type}
                  </span>
                  <span className="text-muted-foreground">{formatDateTime(f.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </section>
      ) : (
      <section className="flex flex-col gap-3">
        {p && (p.penalties ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{t('Quán chưa có điểm phạt nào.')}</Card> : null}
        <ul className="flex flex-col gap-3">
          {(p?.penalties ?? []).map((pen) => (
            <li key={pen.id}>
              <Card className="gap-1 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{pen.points}{t(' điểm')}</span>
                    <Badge variant="outline">{pen.source === 'MANUAL' ? t('Quản trị viên cộng') : t('Tuần {v0}', { v0: formatDay(pen.weekStart) })}</Badge>
                    {pen.status === 'WAIVED' ? <Badge className="bg-muted text-muted-foreground">{t('Đã miễn')}</Badge> : null}
                    {pen.appealStatus ? <Badge variant="outline">{APPEAL_LABEL[pen.appealStatus] ?? pen.appealStatus}</Badge> : null}
                  </div>
                  {pen.canAppeal && appealing?.id !== pen.id ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReason('')
                        setAppealing(pen)
                      }}
                    >
                      {t('Kháng nghị')}
                    </Button>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('Cấp ')}{formatDateTime(pen.issuedAt)}{t(' · hết hạn ')}{formatDateTime(pen.expiresAt)}
                  {pen.canAppeal ? t(' · kháng nghị được đến {v0}', { v0: formatDateTime(pen.appealDeadline) }) : ''}
                </p>
                {pen.reason ? <p className="text-sm">{t('Lý do: ')}{pen.reason}</p> : null}
                {pen.decisionReason ? <p className="text-sm">{t('Quản trị viên: ')}{pen.decisionReason}</p> : null}
                {appealing?.id === pen.id ? (
                  <form
                    className="mt-3 flex flex-col gap-3 rounded-xl bg-grey-50 p-4"
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (appealing?.id) appeal.mutate({ id: appealing.id, reason }, { onSuccess: () => setAppealing(null) })
                    }}
                  >
                    <p className="text-sm text-muted-foreground">{t('Mỗi điểm kháng nghị được một lần. Trong lúc chờ, hạn chế (nếu có) vẫn giữ nguyên; nếu được chấp nhận, điểm được miễn và hậu quả tính lại ngay.')}</p>
                    <Label htmlFor={`appeal-${pen.id}`}>{t('Vì sao điểm này không đúng?')}</Label>
                    <Textarea id={`appeal-${pen.id}`} autoFocus rows={4} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('Ví dụ: tuần đó bếp mất điện, có biên bản của điện lực')} />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={reason.trim().length === 0 || appeal.isPending}>
                        {t('Gửi kháng nghị')}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setAppealing(null)}>
                        {t('Huỷ')}
                      </Button>
                    </div>
                  </form>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      </section>
      )}

    </div>
  )
}

type Week = NonNullable<NonNullable<ReturnType<typeof useMyPerformance>['data']>['weeks']>[number]
const WEEK_METRICS: ChartMetric<Week>[] = [
  { id: 'rate', label: t('Tỷ lệ lỗi'), value: (w) => w.ratePercent, format: (n) => `${n.toLocaleString(intlLocale)}%` },
  { id: 'faults', label: t('Đơn lỗi'), value: (w) => w.faultOrders, format: (n) => t('{v0} đơn', { v0: n }) },
  { id: 'finished', label: t('Đơn kết thúc'), value: (w) => w.finishedOrders, format: (n) => t('{v0} đơn', { v0: n }) },
]

function formatDay(day: string | undefined): string {
  if (!day) return ''
  const [, m, d] = day.split('-')
  return `${d}/${m}`
}
