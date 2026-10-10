import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  CaseEvidence,
  LOG_ACTION_LABEL,
  LOG_ACTOR_LABEL,
  NO_SHOW_OUTCOME,
  useAdminCase,
  useDecideCase,
  useReopenCase,
  type AdminCaseDetail,
  type CaseHistory,
} from '@/entities/order-case'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

/** One case with everything needed to decide it, and the decision itself (review-order-cases.md). */
export function AdminOrderCaseDetailPage() {
  const { id = '' } = useParams()
  const { session } = useSession()
  const canRead = !!session?.permissions.has('order-case:read')
  const canDecide = !!session?.permissions.has('order-case:decide')
  const detail = useAdminCase(id, canRead)

  if (!canRead) return <p className="text-muted-foreground">Bạn không có quyền xem khiếu nại về đơn hàng.</p>
  const d = detail.data

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to="/admin/order-cases" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Danh sách khiếu nại
      </Link>
      {detail.isError ? <FormError message={problemMessage(detail.error)} /> : null}
      {detail.isPending ? <Skeleton className="h-64" /> : null}
      {d?.orderCase ? (
        <>
          <p className="text-sm text-muted-foreground">
            Quán <span className="font-medium text-foreground">{d.vendorName}</span>
          </p>
          <CaseEvidence orderCase={d.orderCase} />
          <div className="grid gap-3 sm:grid-cols-2">
            <History title="Khách này" history={d.customerHistory} />
            <History title="Quán này" history={d.shopHistory} />
          </div>
          {d.noResponse && d.orderCase.type !== 'CUSTOMER_NO_SHOW' ? <p className="text-sm text-warning-fg">Quán không trả lời trong thời hạn.</p> : null}
          <Log log={d.log ?? []} />
          {canDecide && d.orderCase.status === 'OPEN' ? <DecidePanel key={d.orderCase.id} detail={d} /> : null}
          {canDecide && (d.orderCase.status === 'UPHELD' || d.orderCase.status === 'DISMISSED') && !d.reopened ? <ReopenPanel id={id} /> : null}
        </>
      ) : null}
    </div>
  )
}

function History({ title, history }: { title: string; history?: CaseHistory }) {
  const recent = history?.dismissedLast90Days ?? 0
  return (
    <Card className="gap-1 p-4 text-sm">
      <h3 className="font-semibold">{title}</h3>
      <p>
        {history?.total ?? 0} khiếu nại khác: {history?.upheld ?? 0} được chấp nhận, {history?.dismissed ?? 0} bị bác bỏ.
      </p>
      {recent > 0 ? <p className="text-warning-fg">{recent} bị bác bỏ trong 90 ngày gần nhất.</p> : null}
    </Card>
  )
}

function Log({ log }: { log: NonNullable<AdminCaseDetail['log']> }) {
  return (
    <Card className="gap-2 p-4">
      <h3 className="font-semibold">Diễn biến</h3>
      <ol className="flex flex-col gap-2 text-sm">
        {log.map((entry, i) => (
          <li key={i} className="flex flex-col">
            <span>
              <span className="font-medium">{LOG_ACTION_LABEL[entry.action ?? ''] ?? entry.action}</span>
              <span className="text-muted-foreground">
                {' '}
                · {LOG_ACTOR_LABEL[entry.by ?? ''] ?? entry.by} · {formatDateTime(entry.at)}
              </span>
            </span>
            {entry.detail && entry.action !== 'FILED' ? <span className="text-muted-foreground">{entry.detail}</span> : null}
          </li>
        ))}
      </ol>
    </Card>
  )
}

type NoShowOutcome = 'CUSTOMER_AT_FAULT' | 'CUSTOMER_RECEIVED' | 'SHOP_NEVER_CAME'

/** Uphold all, uphold part (a quantity per line) or dismiss; a no-show picks one of three outcomes instead. Everything needs a reason, which both sides see. */
function DecidePanel({ detail }: { detail: AdminCaseDetail }) {
  const orderCase = detail.orderCase
  const lines = orderCase?.lines ?? []
  const noShow = orderCase?.type === 'CUSTOMER_NO_SHOW'
  const canNarrow = !noShow && orderCase?.type !== 'NOT_RECEIVED' && !detail.reopened && lines.length > 0
  const [partial, setPartial] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>(() => Object.fromEntries(lines.map((l) => [l.orderItemId ?? '', l.quantity ?? 0])))
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState<'UPHELD' | 'DISMISSED' | null>(null)
  const [noShowOutcome, setNoShowOutcome] = useState<NoShowOutcome | null>(null)
  const decide = useDecideCase()

  const chosen = partial ? lines.filter((l) => (quantities[l.orderItemId ?? ''] ?? 0) > 0).map((l) => ({ orderItemId: l.orderItemId ?? '', quantity: quantities[l.orderItemId ?? ''] ?? 0 })) : []
  const partialInvalid = partial && (chosen.length === 0 || lines.some((l) => (quantities[l.orderItemId ?? ''] ?? 0) > (l.quantity ?? 0)))
  const ready = reason.trim().length > 0 && !partialInvalid && (!noShow || noShowOutcome !== null)

  return (
    <Card className="gap-4 p-4">
      <h3 className="font-semibold">Quyết định</h3>
      {noShow ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Kết cục</legend>
          {(['CUSTOMER_AT_FAULT', 'CUSTOMER_RECEIVED', 'SHOP_NEVER_CAME'] as const).map((o) => (
            <label key={o} className="flex items-start gap-2 text-sm">
              <input type="radio" name="no-show-outcome" className="mt-1" checked={noShowOutcome === o} onChange={() => setNoShowOutcome(o)} />
              <span>{NO_SHOW_OUTCOME[o]}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {canNarrow ? (
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={partial} onChange={(e) => setPartial(e.target.checked)} />
            Chỉ chấp nhận một phần số món khách báo
          </label>
          {partial ? (
            <ul className="flex flex-col gap-2 rounded-sm bg-muted p-3 text-sm">
              {lines.map((line) => (
                <li key={line.orderItemId} className="flex items-center justify-between gap-3">
                  <span>{line.name}</span>
                  <span className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={line.quantity}
                      className="w-20"
                      aria-label={`Số phần ${line.name}`}
                      value={quantities[line.orderItemId ?? ''] ?? 0}
                      onChange={(e) => setQuantities({ ...quantities, [line.orderItemId ?? '']: Number(e.target.value) })}
                    />
                    <span className="text-muted-foreground">/ {line.quantity}</span>
                  </span>
                </li>
              ))}
              <li className="text-xs text-muted-foreground">Tiền hoàn tính lại theo tỷ lệ số phần. Để 0 để bỏ một món.</li>
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="decision-reason">Lý do (khách và quán đều thấy)</Label>
        <Textarea id="decision-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {noShow ? (
          <Button disabled={!ready || decide.isPending} onClick={() => setPending(noShowOutcome === 'CUSTOMER_AT_FAULT' ? 'UPHELD' : 'DISMISSED')}>
            Quyết định
          </Button>
        ) : (
          <>
            <Button disabled={!ready || decide.isPending} onClick={() => setPending('UPHELD')}>
              Chấp nhận, hoàn tiền cho khách
            </Button>
            <Button variant="outline" disabled={reason.trim().length === 0 || decide.isPending} onClick={() => setPending('DISMISSED')}>
              Bác bỏ
            </Button>
          </>
        )}
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => (open ? undefined : setPending(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noShow ? 'Quyết định báo cáo khách vắng mặt?' : pending === 'UPHELD' ? 'Chấp nhận khiếu nại?' : 'Bác bỏ khiếu nại?'}</DialogTitle>
            <DialogDescription>
              {noShow
                ? `${noShowOutcome ? NO_SHOW_OUTCOME[noShowOutcome] : ''}. Đơn được kết thúc theo kết cục này và cả hai bên được báo.`
                : pending === 'UPHELD'
                ? 'Khách được hoàn tiền và quán chịu khoản đó trong sổ cái. Có thể xem lại một lần bằng cách mở lại khiếu nại.'
                : 'Không có khoản tiền nào thay đổi. Khiếu nại bị bác bỏ được tính vào lịch sử của khách.'}
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-sm bg-muted p-3 text-sm whitespace-pre-wrap">{reason.trim()}</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Xem lại</Button>
            </DialogClose>
            <Button
              disabled={decide.isPending}
              onClick={() => {
                if (!orderCase?.id || !pending) return
                decide.mutate(
                  { id: orderCase.id, outcome: pending, reason, ...(pending === 'UPHELD' && partial ? { lines: chosen } : {}), ...(noShow && noShowOutcome ? { noShowOutcome } : {}) },
                  { onSuccess: () => setPending(null) },
                )
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function ReopenPanel({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const reopen = useReopenCase()
  return (
    <Card className={cn('gap-2 p-4')}>
      <h3 className="font-semibold">Xem lại quyết định</h3>
      <p className="text-sm text-muted-foreground">Mở lại được một lần, kèm lý do. Khách và quán đều được báo. Bút toán đã ghi không bị sửa.</p>
      <div>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Mở lại khiếu nại
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mở lại khiếu nại?</DialogTitle>
            <DialogDescription>Khiếu nại trở lại hàng đợi để quyết lại. Nếu đã được chấp nhận rồi bị bác bỏ, sổ cái ghi một điều chỉnh ngược để trả lại cho quán.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reopen-reason">Lý do</Label>
            <Textarea id="reopen-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button disabled={reason.trim().length === 0 || reopen.isPending} onClick={() => reopen.mutate({ id, reason }, { onSuccess: () => setOpen(false) })}>
              Mở lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
