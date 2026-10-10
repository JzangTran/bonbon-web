import { useState } from 'react'
import { REASON_LABEL, type RevealReason } from '../api'
import { problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

/** Asks why the full contact details are needed. The answer is written to the audit log with the administrator's name. */
export function RevealDialog({ pending, error, onSubmit, onClose }: { pending: boolean; error: unknown; onSubmit: (input: { reason: RevealReason; note: string }) => void; onClose: () => void }) {
  const [reason, setReason] = useState<RevealReason>('DISPUTE')
  const [note, setNote] = useState('')
  const needsNote = reason === 'OTHER'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xem thông tin liên hệ đầy đủ</DialogTitle>
          <DialogDescription>Chọn lý do. Việc xem được ghi lại cùng tên bạn và lý do này.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div role="radiogroup" aria-label="Lý do" className="flex flex-wrap gap-2">
            {(Object.keys(REASON_LABEL) as RevealReason[]).map((r) => (
              <Button key={r} type="button" role="radio" aria-checked={reason === r} size="sm" variant={reason === r ? 'default' : 'outline'} onClick={() => setReason(r)}>
                {REASON_LABEL[r]}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reveal-note">Ghi chú{needsNote ? ' (bắt buộc)' : ''}</Label>
            <Textarea id="reveal-note" rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error ? <FormError message={problemMessage(error)} /> : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Huỷ</Button>
          </DialogClose>
          <Button disabled={pending || (needsNote && !note.trim())} onClick={() => onSubmit({ reason, note })}>
            Xem đầy đủ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
