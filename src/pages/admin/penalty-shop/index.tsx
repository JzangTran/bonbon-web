import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { APPEAL_LABEL, CONSEQUENCE } from '@/entities/performance'
import {
  useAddPenalty,
  useCancelSuspension,
  useDecideAppeal,
  useReinstateShop,
  useShopPenalties,
  useShopSuspensions,
  useSuspendShop,
  useWaivePenalty,
  type PenaltyRecord,
  type ShopSuspension,
} from '@/entities/penalty'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

const SUSPENSION_STATUS: Record<string, string> = { SCHEDULED: 'Đã báo, chưa hiệu lực', APPLIED: 'Đang bị đình chỉ', CANCELLED: 'Đã huỷ', LIFTED: 'Đã khôi phục' }

type Action =
  | { kind: 'waive'; penalty: PenaltyRecord }
  | { kind: 'appeal'; penalty: PenaltyRecord }
  | { kind: 'add' }
  | { kind: 'suspend' }
  | { kind: 'cancel' }
  | { kind: 'reinstate' }

/** One shop's points, appeals and suspension, with every change an administrator can make (manage-penalties.md, suspend-seller.md). */
export function AdminPenaltyShopPage() {
  const { vendorId = '' } = useParams()
  const { session } = useSession()
  const canRead = !!session?.permissions.has('shop-penalty:read')
  const canWrite = !!session?.permissions.has('shop-penalty:write')
  const canSuspend = !!session?.permissions.has('merchant-approval:suspend')
  const history = useShopPenalties(vendorId, canRead)
  const suspensions = useShopSuspensions(vendorId, !!session?.permissions.has('merchant-approval:read'))
  const [action, setAction] = useState<Action | null>(null)
  const h = history.data
  const consequence = CONSEQUENCE[h?.consequence ?? 'NONE'] ?? CONSEQUENCE.NONE
  const open = (suspensions.data?.items ?? []).find((s) => s.status === 'SCHEDULED' || s.status === 'APPLIED')

  if (!canRead) return <p className="text-muted-foreground">Bạn không có quyền xem điểm phạt của các quán.</p>

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to="/admin/penalties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Điểm phạt các quán
      </Link>
      {history.isError ? <FormError message={problemMessage(history.error)} /> : null}
      {history.isPending ? <Skeleton className="h-40" /> : null}
      {h ? (
        <>
          <Card className="gap-2 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-2xl font-bold">{h.name}</h1>
              {canWrite ? <Button onClick={() => setAction({ kind: 'add' })}>Cộng điểm</Button> : null}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl font-semibold tabular-nums">{h.activePoints}</span>
              <span className="text-muted-foreground">điểm còn hiệu lực</span>
              <Badge className={consequence.className}>{consequence.label}</Badge>
              {h.reviewFlagged ? <Badge className="bg-danger-subtle text-danger-fg">Nên xem xét đình chỉ</Badge> : null}
            </div>
            {h.restrictionStartsAt ? <p className="text-sm text-muted-foreground">Hạn chế hiển thị bắt đầu {formatDateTime(h.restrictionStartsAt)}</p> : null}
          </Card>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Lịch sử điểm</h2>
            {(h.penalties ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Quán chưa có điểm phạt nào.</Card> : null}
            <ul className="flex flex-col gap-3">
              {(h.penalties ?? []).map((p) => (
                <li key={p.id}>
                  <Card className="gap-1 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{p.points} điểm</span>
                        <Badge variant="outline">{p.source === 'MANUAL' ? 'Cộng thủ công' : `Tuần ${p.weekStart}`}</Badge>
                        {p.status === 'WAIVED' ? <Badge className="bg-muted text-muted-foreground">Đã miễn</Badge> : p.expired ? <Badge className="bg-muted text-muted-foreground">Hết hạn</Badge> : <Badge className="bg-warning-subtle text-warning-fg">Còn hiệu lực</Badge>}
                        {p.appealStatus ? <Badge variant="outline">{APPEAL_LABEL[p.appealStatus] ?? p.appealStatus}</Badge> : null}
                      </div>
                      {canWrite ? (
                        <div className="flex gap-2">
                          {p.appealStatus === 'PENDING' ? (
                            <Button size="sm" onClick={() => setAction({ kind: 'appeal', penalty: p })}>
                              Quyết kháng nghị
                            </Button>
                          ) : null}
                          {p.status === 'ACTIVE' && !p.expired ? (
                            <Button size="sm" variant="outline" onClick={() => setAction({ kind: 'waive', penalty: p })}>
                              Miễn điểm
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cấp {formatDateTime(p.issuedAt)} · hết hạn {formatDateTime(p.expiresAt)}
                      {p.faultOrders !== undefined ? ` · ${p.faultOrders} đơn lỗi trên ${p.finishedOrders} đơn` : ''}
                    </p>
                    {p.reason ? <p className="text-sm">Lý do: {p.reason}</p> : null}
                    {p.appealReason ? <p className="text-sm">Quán kháng nghị: {p.appealReason}</p> : null}
                    {p.appealDecisionReason ? <p className="text-sm">Quyết định kháng nghị: {p.appealDecisionReason}</p> : null}
                    {p.decisionReason && p.decisionReason !== p.appealDecisionReason ? <p className="text-sm">Miễn điểm: {p.decisionReason}</p> : null}
                  </Card>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Đình chỉ</h2>
              {canSuspend && !open ? (
                <Button variant="outline" onClick={() => setAction({ kind: 'suspend' })}>
                  Đình chỉ cửa hàng
                </Button>
              ) : null}
              {canSuspend && open?.status === 'SCHEDULED' ? (
                <Button variant="outline" onClick={() => setAction({ kind: 'cancel' })}>
                  Huỷ lịch đình chỉ
                </Button>
              ) : null}
              {canSuspend && open?.status === 'APPLIED' ? <Button onClick={() => setAction({ kind: 'reinstate' })}>Khôi phục cửa hàng</Button> : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Đình chỉ có lịch báo trước ít nhất 5 ngày (mức tối thiểu theo luật); quán vẫn hoạt động đến ngày đó. Chỉ yêu cầu của cơ quan có thẩm quyền mới đình chỉ ngay.
            </p>
            {suspensions.isError ? <FormError message={problemMessage(suspensions.error)} /> : null}
            {suspensions.data && (suspensions.data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Quán chưa bị đình chỉ lần nào.</Card> : null}
            <ul className="flex flex-col gap-3">
              {(suspensions.data?.items ?? []).map((s) => (
                <SuspensionItem key={s.id} suspension={s} />
              ))}
            </ul>
          </section>

          <Actions action={action} onClose={() => setAction(null)} vendorId={vendorId} />
        </>
      ) : null}
    </div>
  )
}

function SuspensionItem({ suspension: s }: { suspension: ShopSuspension }) {
  return (
    <li>
      <Card className="gap-1 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={s.status === 'APPLIED' ? 'bg-danger-subtle text-danger-fg' : s.status === 'SCHEDULED' ? 'bg-warning-subtle text-warning-fg' : 'bg-muted text-muted-foreground'}>
            {SUSPENSION_STATUS[s.status ?? ''] ?? s.status}
          </Badge>
          {s.kind === 'IMMEDIATE' ? <Badge variant="outline">Theo yêu cầu cơ quan</Badge> : null}
        </div>
        <p className="text-sm">{s.reason}</p>
        {s.authorityReference ? <p className="text-sm text-muted-foreground">Yêu cầu: {s.authorityReference}</p> : null}
        <p className="text-sm text-muted-foreground">
          Báo {formatDateTime(s.noticeSentAt)} · hiệu lực {formatDateTime(s.effectiveAt)}
          {s.endedAt ? ` · kết thúc ${formatDateTime(s.endedAt)}` : ''}
        </p>
        {s.endReason ? <p className="text-sm">Lý do kết thúc: {s.endReason}</p> : null}
      </Card>
    </li>
  )
}

/** One dialog per kind of change; each needs a reason the shop reads. */
function Actions({ action, onClose, vendorId }: { action: Action | null; onClose: () => void; vendorId: string }) {
  const waive = useWaivePenalty()
  const add = useAddPenalty()
  const decide = useDecideAppeal()
  const suspend = useSuspendShop()
  const cancel = useCancelSuspension()
  const reinstate = useReinstateShop()
  const [reason, setReason] = useState('')
  const [points, setPoints] = useState(1)
  const [date, setDate] = useState('')
  const [immediate, setImmediate] = useState(false)
  const [authority, setAuthority] = useState('')
  // A date means 00:00 that day, so the first day that is at least 5 days away is the 6th from today.
  const earliest = dayOffset(useNow(60_000), 6)
  const busy = waive.isPending || add.isPending || decide.isPending || suspend.isPending || cancel.isPending || reinstate.isPending

  const title =
    action?.kind === 'waive' ? 'Miễn điểm phạt' : action?.kind === 'appeal' ? 'Quyết định kháng nghị' : action?.kind === 'add' ? 'Cộng điểm phạt' :
    action?.kind === 'suspend' ? 'Đình chỉ cửa hàng' : action?.kind === 'cancel' ? 'Huỷ lịch đình chỉ' : 'Khôi phục cửa hàng'
  const description =
    action?.kind === 'waive' ? 'Điểm của quán được tính lại ngay, nên có thể gỡ hạn chế hiển thị lập tức. Quán thấy lý do này.' :
    action?.kind === 'appeal' ? `Quán nói: ${action.penalty.appealReason}. Chấp nhận thì điểm được miễn; từ chối thì giữ nguyên. Quán thấy lý do này.` :
    action?.kind === 'add' ? 'Điểm hết hạn sau 90 ngày như mọi điểm khác. Đủ 3 điểm thì quán được báo sẽ bị hạn chế hiển thị sau 5 ngày. Quán thấy lý do này.' :
    action?.kind === 'suspend' ? 'Quán được báo ngay kèm lý do và ngày hiệu lực, và vẫn hoạt động đến lúc đó.' :
    action?.kind === 'cancel' ? 'Quán tiếp tục hoạt động bình thường và được báo. Lý do được ghi lại.' : 'Quán hiện lại với khách và nhận đơn trở lại. Lý do được ghi lại.'
  const ready =
    reason.trim().length > 0 && (action?.kind !== 'suspend' || !immediate || authority.trim().length > 0) && (action?.kind !== 'suspend' || immediate || date === '' || date >= earliest)

  const done = () => {
    setReason('')
    setPoints(1)
    setDate('')
    setImmediate(false)
    setAuthority('')
    onClose()
  }

  const submit = (decision?: 'ACCEPT' | 'REJECT') => {
    if (!action) return
    switch (action.kind) {
      case 'waive':
        return waive.mutate({ id: action.penalty.id ?? '', reason }, { onSuccess: done })
      case 'appeal':
        return decide.mutate({ id: action.penalty.id ?? '', decision: decision ?? 'REJECT', reason }, { onSuccess: done })
      case 'add':
        return add.mutate({ vendorId, points, reason }, { onSuccess: done })
      case 'suspend':
        return suspend.mutate({ vendorId, reason, ...(immediate ? { immediate: true, authorityReference: authority } : date ? { effectiveAt: `${date}T00:00:00+07:00` } : {}) }, { onSuccess: done })
      case 'cancel':
        return cancel.mutate({ vendorId, reason }, { onSuccess: done })
      case 'reinstate':
        return reinstate.mutate({ vendorId, reason }, { onSuccess: done })
    }
  }

  return (
    <Dialog open={action !== null} onOpenChange={(open) => (open ? undefined : done())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {action?.kind === 'add' ? (
            <div className="flex flex-col gap-1">
              <Label htmlFor="points">Số điểm (1 đến 3)</Label>
              <Input id="points" type="number" min={1} max={3} className="w-24" value={points} onChange={(e) => setPoints(Math.min(3, Math.max(1, Number(e.target.value))))} />
            </div>
          ) : null}
          {action?.kind === 'suspend' ? (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={immediate} onChange={(e) => setImmediate(e.target.checked)} />
                Đình chỉ ngay theo yêu cầu của cơ quan có thẩm quyền
              </label>
              {immediate ? (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="authority">Số hiệu và ngày của yêu cầu</Label>
                  <Input id="authority" value={authority} maxLength={300} onChange={(e) => setAuthority(e.target.value)} placeholder="Ví dụ: CV 123/QLTT ngày 08/10/2026" />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="effective">Ngày hiệu lực (để trống là đúng 5 ngày)</Label>
                  <Input id="effective" type="date" min={earliest} className="w-44" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              )}
            </>
          ) : null}
          <div className="flex flex-col gap-1">
            <Label htmlFor="reason">Lý do</Label>
            <Textarea id="reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          {action?.kind === 'appeal' ? (
            <>
              <Button variant="outline" disabled={!ready || busy} onClick={() => submit('REJECT')}>
                Từ chối
              </Button>
              <Button disabled={!ready || busy} onClick={() => submit('ACCEPT')}>
                Chấp nhận, miễn điểm
              </Button>
            </>
          ) : (
            <Button disabled={!ready || busy} onClick={() => submit()}>
              Xác nhận
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Today plus some days, as yyyy-mm-dd in Vietnam time. */
function dayOffset(now: number, days: number): string {
  const d = new Date(now + days * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}
