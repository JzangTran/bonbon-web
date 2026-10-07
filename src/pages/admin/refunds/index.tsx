import { CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCompleteRefund, useFailRefund, useRefunds, type RefundRow } from '@/entities/refund'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative, formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

const TABS = [
  { id: 'OPEN', label: 'Cần xử lý' },
  { id: 'COMPLETED', label: 'Đã xong' },
  { id: 'ALL', label: 'Tất cả (đối soát)' },
] as const
type Tab = (typeof TABS)[number]['id']

const STATUS: Record<string, { label: string; className: string }> = {
  REQUESTED: { label: 'Chờ chuyển khoản', className: 'bg-warning-subtle text-warning-fg' },
  NEEDS_DESTINATION: { label: 'Chờ khách nhập tài khoản', className: 'bg-info-subtle text-info-fg' },
  PROCESSING: { label: 'Đang hoàn qua MoMo', className: 'bg-info-subtle text-info-fg' },
  COMPLETED: { label: 'Đã hoàn', className: 'bg-success-subtle text-success-fg' },
  FAILED: { label: 'Thất bại', className: 'bg-danger-subtle text-danger-fg' },
}
const REASON: Record<string, string> = {
  ORDER_CLOSED: 'Đơn đã thanh toán bị huỷ hoặc từ chối',
  LATE_PAYMENT: 'Tiền đến sau khi đơn đã đóng',
  CASE_UPHELD: 'Khiếu nại được chấp nhận',
}

/** Refunds MoMo could not send back, waiting for a bank transfer (process-refund.md); also the month-end sheet. */
export function AdminRefundsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('refund:process')
  const [tab, setTab] = useState<Tab>('OPEN')
  const [page, setPage] = useState(0)
  const refunds = useRefunds(tab, page, allowed)
  const complete = useCompleteRefund()
  const fail = useFailRefund()
  const [paying, setPaying] = useState<RefundRow | null>(null)
  const [reference, setReference] = useState('')
  const [bouncing, setBouncing] = useState<RefundRow | null>(null)
  const [reason, setReason] = useState('')
  const data = refunds.data
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const size = data?.size ?? 20

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xử lý hoàn tiền.</p>

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Đã sao chép.')
    } catch {
      toast.error('Không sao chép được.')
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Hoàn tiền</h1>
        <p className="text-sm text-muted-foreground">
          Các khoản MoMo không hoàn lại được. Chuyển đúng số tiền tới tài khoản khách nhập, rồi ghi mã giao dịch của ngân hàng. Không sửa được số tiền.
        </p>
      </div>

      <div role="tablist" className="flex flex-wrap gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id)
              setPage(0)
            }}
            className={cn(
              '-mb-px min-h-10 border-b-2 px-3 text-sm whitespace-nowrap',
              tab === t.id ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {t.label}
            {tab === t.id && total > 0 ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {refunds.isError ? <FormError message={problemMessage(refunds.error)} /> : null}
      {refunds.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? <Card className="p-6 text-muted-foreground">Không có khoản hoàn nào ở mục này.</Card> : null}

      <ul className="flex flex-col gap-3">
        {items.map((refund) => {
          const status = STATUS[refund.status ?? ''] ?? { label: refund.status ?? '', className: '' }
          const destination = refund.destination
          return (
            <li key={refund.id}>
              <Card className="gap-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-semibold tabular-nums">{formatVnd(refund.amount)}</span>
                    <Badge className={status.className}>{status.label}</Badge>
                    {refund.mode === 'GATEWAY' ? <Badge variant="outline">Qua MoMo</Badge> : <Badge variant="outline">Chuyển khoản</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Đơn #{refund.orderNumber} · chờ từ {formatRelative(refund.createdAt)}
                  </p>
                </div>
                <p className="text-sm">
                  {REASON[refund.reason ?? ''] ?? refund.reason}
                  {refund.gatewayResultCode ? <span className="text-muted-foreground"> · mã MoMo {refund.gatewayResultCode}</span> : null}
                </p>
                {refund.failureReason ? <p className="text-sm text-warning-fg">Lần chuyển trước thất bại: {refund.failureReason}</p> : null}

                {destination ? (
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-sm bg-muted p-3 text-sm">
                    <dt className="text-muted-foreground">Ngân hàng</dt>
                    <dd className="col-span-2">{destination.bankName}</dd>
                    <dt className="text-muted-foreground">Số tài khoản</dt>
                    <dd className="font-medium tabular-nums">{destination.accountNumber}</dd>
                    <Button variant="ghost" size="icon-sm" aria-label="Sao chép số tài khoản" onClick={() => void copy(destination.accountNumber ?? '')}>
                      <CopyIcon />
                    </Button>
                    <dt className="text-muted-foreground">Chủ tài khoản</dt>
                    <dd className="col-span-2 font-medium">{destination.accountName}</dd>
                  </dl>
                ) : null}
                {refund.bankReference ? (
                  <p className="text-sm text-muted-foreground">
                    Mã giao dịch {refund.bankReference} · {formatDateTime(refund.transferredAt ?? refund.completedAt)}
                  </p>
                ) : null}

                {refund.mode === 'MANUAL' && refund.status === 'REQUESTED' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setReference('')
                        setPaying(refund)
                      }}
                    >
                      Đã chuyển khoản
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setReason('')
                        setBouncing(refund)
                      }}
                    >
                      Chuyển không được
                    </Button>
                  </div>
                ) : null}
              </Card>
            </li>
          )
        })}
      </ul>

      {total > size ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {Math.ceil(total / size)}
          </span>
          <Button variant="outline" disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
            Trang sau
          </Button>
        </div>
      ) : null}

      <Dialog open={paying !== null} onOpenChange={(open) => (open ? undefined : setPaying(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đã chuyển {formatVnd(paying?.amount)}</DialogTitle>
            <DialogDescription>
              Tới {paying?.destination?.accountName} · {paying?.destination?.bankName} · {paying?.destination?.accountNumber}. Tên chủ tài khoản trên kết quả chuyển phải khớp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bank-reference">Mã giao dịch của ngân hàng</Label>
            <Input id="bank-reference" value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} />
            <p className="text-xs text-muted-foreground">Mỗi mã chỉ dùng cho một khoản hoàn; mã đã dùng sẽ bị từ chối.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={reference.trim().length < 3 || complete.isPending}
              onClick={() => {
                if (paying?.id) complete.mutate({ id: paying.id, bankReference: reference }, { onSuccess: () => setPaying(null) })
              }}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bouncing !== null} onOpenChange={(open) => (open ? undefined : setBouncing(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chuyển khoản không được?</DialogTitle>
            <DialogDescription>Tài khoản đã nhập sẽ bị xoá và khách được yêu cầu nhập tài khoản khác. Lý do hiện cho khách.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fail-reason">Lý do</Label>
            <Textarea id="fail-reason" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ví dụ: tài khoản đã đóng, sai số tài khoản" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={reason.trim().length === 0 || fail.isPending}
              onClick={() => {
                if (bouncing?.id) fail.mutate({ id: bouncing.id, reason }, { onSuccess: () => setBouncing(null) })
              }}
            >
              Báo thất bại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
