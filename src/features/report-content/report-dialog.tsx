import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Textarea } from '@/shared/ui/textarea'
import { t } from '@/shared/i18n'

export type ReportTarget = { type: 'SHOP' | 'MESSAGE' | 'REVIEW' | 'REVIEW_RESPONSE'; id: string }
type Reason = 'SPAM' | 'OFFENSIVE' | 'SCAM_OR_FRAUD' | 'INAPPROPRIATE_IMAGE' | 'FALSE_INFORMATION' | 'OTHER'

const REASONS: { id: Reason; label: string; hint: string }[] = [
  { id: 'OFFENSIVE', label: t('Xúc phạm, quấy rối'), hint: t('Lời lẽ thô tục, đe doạ, kỳ thị.') },
  { id: 'SCAM_OR_FRAUD', label: t('Lừa đảo'), hint: t('Đòi trả tiền hay liên hệ ngoài ứng dụng.') },
  { id: 'SPAM', label: t('Tin rác, quảng cáo'), hint: t('Gửi lặp lại hoặc không liên quan.') },
  { id: 'INAPPROPRIATE_IMAGE', label: t('Hình ảnh không phù hợp'), hint: t('Ảnh phản cảm hoặc không liên quan.') },
  { id: 'FALSE_INFORMATION', label: t('Thông tin sai sự thật'), hint: t('Giá, món, hoặc đánh giá không đúng thực tế.') },
  { id: 'OTHER', label: t('Lý do khác'), hint: t('Ghi rõ bên dưới.') },
]

/**
 * Report a message, review, reply or shop (report-content.md): a reason, an optional note (required for "other"), sent once. The content
 * stays visible until an administrator decides; the reporter is told the outcome later.
 */
export function ReportDialog({ target, open, onOpenChange }: { target: ReportTarget | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const feedback = useFeedback()
  const [reason, setReason] = useState<Reason | null>(null)
  const [note, setNote] = useState('')
  const send = useMutation({
    mutationFn: async () => {
      if (!target || !reason) return null
      const { data, error } = await api.POST('/api/reports', {
        body: { targetType: target.type, targetId: target.id, reasonCode: reason, note: note.trim() || undefined },
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      feedback.success(data?.alreadyReported ? t('Bạn đã báo cáo nội dung này rồi. Chúng tôi đang xem xét.') : t('Cảm ơn bạn. Chúng tôi sẽ xem xét trong vòng 24 giờ.'))
      setReason(null)
      setNote('')
      onOpenChange(false)
    },
  })
  const needsNote = reason === 'OTHER' && note.trim() === ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Báo cáo vi phạm')}</DialogTitle>
          <DialogDescription>
            {t('Báo cáo được gửi tới quản trị viên bonbon. Người bị báo cáo không biết ai đã báo cáo. Nội dung vẫn hiện cho tới khi có quyết định.')}
          </DialogDescription>
        </DialogHeader>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-label">{t('Lý do')}</legend>
          {REASONS.map((r) => (
            <label key={r.id} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-body-sm has-checked:border-primary has-checked:bg-accent">
              <input type="radio" name="report-reason" className="mt-1" checked={reason === r.id} onChange={() => setReason(r.id)} />
              <span>
                <span className="font-medium">{r.label}</span>
                <span className="block text-caption text-muted-foreground">{r.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col gap-1">
          <label htmlFor="report-note" className="text-label">
            {reason === 'OTHER' ? t('Mô tả (bắt buộc)') : t('Mô tả thêm (không bắt buộc)')}
          </label>
          <Textarea id="report-note" maxLength={500} rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          <span className="self-end text-caption text-muted-foreground">{note.length}/500</span>
        </div>
        {send.isError ? <p role="alert" className="text-body-sm text-destructive">{problemMessage(send.error)}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('Huỷ')}
          </Button>
          <Button disabled={!reason || needsNote || send.isPending} onClick={() => send.mutate()}>
            {send.isPending ? t('Đang gửi…') : t('Gửi báo cáo')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
