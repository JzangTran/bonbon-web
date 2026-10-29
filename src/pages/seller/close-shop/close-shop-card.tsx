import { t } from '@/shared/i18n'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { CLOSE_REASON_LABEL, useCloseShop, type CloseReason } from '@/entities/shop'
import { useReauthGate } from '@/features/reauthenticate'
import { problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { merchantPath } from '@/shared/config/sites'

const REASONS = Object.keys(CLOSE_REASON_LABEL) as CloseReason[]

/** Closing for good (close-shop.md): irreversible, so it says what will happen first and asks for a recent sign-in. */
export function CloseShopCard() {
  const close = useCloseShop()
  const navigate = useNavigate()
  const gate = useReauthGate()
  const [reason, setReason] = useState<CloseReason>('STOP_SELLING')
  const [text, setText] = useState('')
  const [understood, setUnderstood] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsText = reason === 'OTHER'
  const valid = understood && (!needsText || text.trim() !== '')

  const submit = () => {
    setError(null)
    const attempt = () =>
      close.mutate(
        { reason, reasonText: text.trim() || undefined },
        {
          onSuccess: () => {
            toast.success(t('Cửa hàng đang đóng. Bạn vẫn hoàn tất các đơn đang làm.'))
            navigate(merchantPath('/closing'), { replace: true })
          },
          onError: (e) => {
            if (!gate.handle(e, attempt)) setError(problemMessage(e))
          },
        },
      )
    attempt()
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>{t('Đóng cửa hàng')}</CardTitle>
        <CardDescription>{t('Đóng hẳn cửa hàng, không mở lại được. Muốn bán lại phải mở một cửa hàng mới.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{t('Cửa hàng biến mất khỏi danh sách và không nhận đơn mới ngay khi bạn xác nhận.')}</li>
          <li>{t('Các đơn đang làm vẫn làm tiếp; khiếu nại và kháng nghị đang mở vẫn xử lý; bạn vẫn xem được thu nhập.')}</li>
          <li>{t('Cửa hàng chỉ đóng hẳn khi không còn đơn đang làm, khiếu nại hay kháng nghị, không còn tiền bị giữ và số dư sổ cái về 0: số dương được chi trả cho bạn, số âm bạn cần thanh toán hoặc được quản trị viên xử lý.')}</li>
          <li>{t('Thực đơn và lịch sử đơn hàng được giữ lại để đối chiếu.')}</li>
        </ul>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">{t('Lý do')}</legend>
          <div role="radiogroup" aria-label={t('Lý do đóng cửa hàng')} className="grid gap-2 sm:grid-cols-2">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={cn('rounded-sm border px-3 py-2 text-left text-sm', reason === r ? 'border-primary bg-primary/5 font-semibold' : 'hover:bg-muted/50')}
              >
                {CLOSE_REASON_LABEL[r]}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="close-text">{needsText ? t('Ghi rõ lý do') : t('Ghi chú thêm (không bắt buộc)')}</Label>
          <Textarea id="close-text" rows={2} maxLength={500} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
          <span>{t('Tôi hiểu rằng đóng cửa hàng là vĩnh viễn và không hoàn tác được.')}</span>
        </label>
        <FormError message={error} />
        <div>
          <Button variant="destructive" disabled={!valid || close.isPending} onClick={() => setConfirm(true)}>
            {t('Đóng cửa hàng')}
          </Button>
        </div>
      </CardContent>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Đóng cửa hàng ngay bây giờ?')}</DialogTitle>
            <DialogDescription>
              {t('Cửa hàng sẽ ngừng nhận đơn mới ngay. Bạn có thể được yêu cầu nhập lại mật khẩu để xác nhận.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('Để sau')}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirm(false)
                submit()
              }}
            >
              {t('Đóng cửa hàng')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {gate.dialog}
    </Card>
  )
}
