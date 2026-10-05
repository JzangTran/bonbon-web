import { useState } from 'react'
import { useOrderAction, type OrderAction, type OrderStatus } from '@/entities/order'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { NEXT_STEP } from './order-steps'

type Asking = 'reject' | 'cancel' | null

/**
 * The actions an order allows right now (confirm-order.md, update-order-status.md): accept or reject a new one,
 * the next step for a confirmed one, and cancel with a reason until it leaves the kitchen.
 */
export function OrderActions({ id, status, size = 'default' }: { id: string; status: OrderStatus; size?: 'default' | 'lg' }) {
  const action = useOrderAction(id)
  const [asking, setAsking] = useState<Asking>(null)
  const [reason, setReason] = useState('')
  const next = NEXT_STEP[status]
  const run = (a: OrderAction) => action.mutate(a)

  if (status === 'PLACED') {
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <Button size={size} disabled={action.isPending} onClick={() => run({ kind: 'confirm' })}>
            Nhận đơn
          </Button>
          <Button size={size} variant="outline" disabled={action.isPending} onClick={() => setAsking('reject')}>
            Từ chối
          </Button>
        </div>
        <ReasonDialog
          open={asking === 'reject'}
          title="Từ chối đơn này?"
          description="Khách sẽ được báo và đơn bị tính là quán từ chối. Hãy ghi rõ lý do."
          confirmLabel="Từ chối đơn"
          reason={reason}
          setReason={setReason}
          pending={action.isPending}
          onClose={() => setAsking(null)}
          onConfirm={() => action.mutate({ kind: 'reject', reason: reason.trim() }, { onSuccess: () => { setAsking(null); setReason('') } })}
        />
      </>
    )
  }

  if (next) {
    const canCancel = status === 'CONFIRMED' || status === 'PREPARING'
    return (
      <>
        <div className="flex flex-wrap gap-2">
          <Button size={size === 'lg' ? 'lg' : 'default'} disabled={action.isPending} onClick={() => run({ kind: 'advance', to: next.to })}>
            {next.label}
          </Button>
          {canCancel ? (
            <Button size={size} variant="outline" disabled={action.isPending} onClick={() => setAsking('cancel')}>
              Huỷ đơn
            </Button>
          ) : null}
        </div>
        <ReasonDialog
          open={asking === 'cancel'}
          title="Huỷ đơn này?"
          description="Khách sẽ được hoàn tiền nếu đã trả và đơn tính là lỗi của quán. Hãy ghi rõ lý do."
          confirmLabel="Huỷ đơn"
          reason={reason}
          setReason={setReason}
          pending={action.isPending}
          onClose={() => setAsking(null)}
          onConfirm={() => action.mutate({ kind: 'cancel', reason: reason.trim() }, { onSuccess: () => { setAsking(null); setReason('') } })}
        />
      </>
    )
  }
  return null
}

function ReasonDialog({
  open,
  title,
  description,
  confirmLabel,
  reason,
  setReason,
  pending,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  reason: string
  setReason: (value: string) => void
  pending: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="order-reason">Lý do</Label>
          <Textarea id="order-reason" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Quay lại
          </Button>
          <Button variant="destructive" disabled={pending || reason.trim() === ''} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
