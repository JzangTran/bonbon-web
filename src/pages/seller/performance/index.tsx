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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

/** How the shop is doing on the orders it fails, the points that follow, and what they lead to (view-shop-performance.md). */
export function SellerPerformancePage() {
  const performance = useMyPerformance()
  const suspension = useMySuspension()
  const [week, setWeek] = useState<string | null>(null)
  const faults = useWeekFaults(week)
  const appeal = useAppealPenalty()
  const [appealing, setAppealing] = useState<ShopPenalty | null>(null)
  const [reason, setReason] = useState('')
  const p = performance.data
  const standing = p?.standing
  const consequence = CONSEQUENCE[standing?.consequence ?? 'NONE'] ?? CONSEQUENCE.NONE

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Hiệu suất cửa hàng</h1>
        <p className="text-sm text-muted-foreground">
          Đơn thất bại do quán (từ chối, không trả lời kịp, không giao đi kịp, huỷ sau khi nhận, khiếu nại hoàn cả đơn, không đến khi giao). Đơn khách huỷ, thanh toán quá hạn và hoàn một phần không bị tính.
        </p>
      </div>

      {suspension.data && suspension.data.status !== 'NONE' ? (
        <Card className="gap-1 border-danger p-4">
          <p className="font-semibold text-danger-fg">{suspension.data.status === 'SUSPENDED' ? 'Quán đang bị đình chỉ' : 'Quán sắp bị đình chỉ'}</p>
          <p className="text-sm">
            {suspension.data.status === 'SUSPENDED'
              ? 'Khách không tìm thấy quán và không đặt thêm được. Bạn vẫn hoàn tất các đơn đang làm và xem được thu nhập.'
              : `Từ ${formatDateTime(suspension.data.effectiveAt)} quán sẽ bị đình chỉ. Đến lúc đó quán vẫn hoạt động bình thường.`}
          </p>
          {suspension.data.reason ? <p className="text-sm text-muted-foreground">Lý do: {suspension.data.reason}</p> : null}
        </Card>
      ) : null}

      {performance.isError ? <FormError message={problemMessage(performance.error)} /> : null}
      {performance.isPending ? <Skeleton className="h-32" /> : null}

      {standing ? (
        <Card className="gap-2 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-4xl font-semibold tabular-nums">{standing.activePoints ?? 0}</span>
            <span className="text-muted-foreground">điểm phạt còn hiệu lực</span>
            <Badge className={consequence.className}>{consequence.label}</Badge>
          </div>
          <p className="text-sm">
            {standing.consequence === 'RESTRICTED'
              ? 'Quán không hiện khi khách tìm kiếm và xếp cuối danh sách, nhưng khách mở thẳng quán vẫn đặt được. Hạn chế được gỡ ngay khi điểm xuống dưới 3.'
              : standing.consequence === 'RESTRICTION_SCHEDULED'
                ? `Từ ${formatDateTime(standing.restrictionStartsAt)} quán sẽ bị hạn chế hiển thị. Nếu điểm xuống dưới 3 trước ngày đó, hạn chế được huỷ.`
                : standing.consequence === 'WARNING'
                  ? 'Mới là cảnh báo. Từ 3 điểm quán bị hạn chế hiển thị, sau khi được báo trước 5 ngày.'
                  : 'Quán đang đạt yêu cầu.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Mỗi tuần (thứ Hai) hệ thống đánh giá tuần vừa đóng: từ {p?.minOrders} đơn trở lên mà tỷ lệ lỗi vượt {p?.thresholdPercent}% thì bị 1 điểm; điểm hết hạn sau 90 ngày.
          </p>
        </Card>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Theo tuần</h2>
        <div className="overflow-x-auto rounded-sm border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                {['Tuần', 'Đơn kết thúc', 'Đơn lỗi', 'Tỷ lệ lỗi', 'Kết quả', ''].map((h) => (
                  <th key={h} className="px-3 py-2 text-right font-medium first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(p?.weeks ?? []).map((w) => (
                <tr key={w.start} className={cn('border-t', week === w.start && 'bg-accent')}>
                  <td className="px-3 py-2">
                    {formatDay(w.start)} – {formatDay(w.end)}
                    {w.current ? <span className="ml-2 text-xs text-muted-foreground">(tạm tính)</span> : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{w.finishedOrders}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{w.faultOrders}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{w.ratePercent}%</td>
                  <td className="px-3 py-2 text-right text-xs">
                    {w.current ? '' : w.penalised ? <span className="text-danger-fg">+1 điểm</span> : w.counted ? 'Đạt' : `Chưa đủ ${p?.minOrders} đơn`}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(w.faultOrders ?? 0) > 0 ? (
                      <Button size="sm" variant={week === w.start ? 'default' : 'outline'} onClick={() => setWeek(week === w.start ? null : (w.start ?? null))}>
                        {week === w.start ? 'Ẩn' : 'Xem đơn'}
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
            <h3 className="font-semibold">Các đơn lỗi tuần {formatDay(week)}</h3>
            {faults.isPending ? <Skeleton className="h-12" /> : null}
            <ul className="divide-y text-sm">
              {(faults.data ?? []).map((f) => (
                <li key={`${f.orderId}-${f.type}`} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>
                    Đơn #{f.orderNumber} · {FAULT_LABEL[f.type ?? ''] ?? f.type}
                  </span>
                  <span className="text-muted-foreground">{formatDateTime(f.at)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Điểm phạt</h2>
        {p && (p.penalties ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Quán chưa có điểm phạt nào.</Card> : null}
        <ul className="flex flex-col gap-3">
          {(p?.penalties ?? []).map((pen) => (
            <li key={pen.id}>
              <Card className="gap-1 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{pen.points} điểm</span>
                    <Badge variant="outline">{pen.source === 'MANUAL' ? 'Quản trị viên cộng' : `Tuần ${formatDay(pen.weekStart)}`}</Badge>
                    {pen.status === 'WAIVED' ? <Badge className="bg-muted text-muted-foreground">Đã miễn</Badge> : null}
                    {pen.appealStatus ? <Badge variant="outline">{APPEAL_LABEL[pen.appealStatus] ?? pen.appealStatus}</Badge> : null}
                  </div>
                  {pen.canAppeal ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReason('')
                        setAppealing(pen)
                      }}
                    >
                      Kháng nghị
                    </Button>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Cấp {formatDateTime(pen.issuedAt)} · hết hạn {formatDateTime(pen.expiresAt)}
                  {pen.canAppeal ? ` · kháng nghị được đến ${formatDateTime(pen.appealDeadline)}` : ''}
                </p>
                {pen.reason ? <p className="text-sm">Lý do: {pen.reason}</p> : null}
                {pen.decisionReason ? <p className="text-sm">Quản trị viên: {pen.decisionReason}</p> : null}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Dialog open={appealing !== null} onOpenChange={(open) => (open ? undefined : setAppealing(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kháng nghị điểm phạt</DialogTitle>
            <DialogDescription>Mỗi điểm kháng nghị được một lần. Trong lúc chờ, hạn chế (nếu có) vẫn giữ nguyên; nếu được chấp nhận, điểm được miễn và hậu quả tính lại ngay.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="appeal-reason">Vì sao điểm này không đúng?</Label>
            <Textarea id="appeal-reason" rows={4} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: tuần đó bếp mất điện, có biên bản của điện lực" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={reason.trim().length === 0 || appeal.isPending}
              onClick={() => {
                if (appealing?.id) appeal.mutate({ id: appealing.id, reason }, { onSuccess: () => setAppealing(null) })
              }}
            >
              Gửi kháng nghị
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function formatDay(day: string | undefined): string {
  if (!day) return ''
  const [, m, d] = day.split('-')
  return `${d}/${m}`
}
