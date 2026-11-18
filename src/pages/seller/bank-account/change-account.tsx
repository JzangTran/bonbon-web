import { useState } from 'react'
import { BankPicker } from '@/entities/bank'
import { useApplyShop } from '@/entities/shop'
import { useReauthGate } from '@/features/reauthenticate'
import { api, problemMessage } from '@/shared/api'
import { t } from '@/shared/i18n'
import { isPersonName } from '@/shared/lib/validate'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { FormError } from '@/widgets/auth-shell'

type Body = { bankName: string; accountNumber: string; accountHolderName: string }

/**
 * Changing where the shop is paid: customers' VietQR transfers and the platform's payouts go to the new account at once. A sign-in
 * older than ten minutes asks for the password first; the owner gets a notice of the change.
 */
export function ChangePayoutAccountDialog({ onClose }: { onClose: () => void }) {
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [holder, setHolder] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof Body, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const gate = useReauthGate()
  const save = useApplyShop((body: Body) => api.PUT('/api/merchant/shop/payout-account', { body }), t('Đã đổi tài khoản nhận tiền. Từ đơn tiếp theo khách chuyển khoản vào tài khoản mới; nhớ liên kết tài khoản này trong SePay nếu quán dùng.'))

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const next: typeof errors = {}
    if (!bankName) next.bankName = t('Chọn ngân hàng')
    if (!/^\d{6,19}$/.test(accountNumber)) next.accountNumber = t('Số tài khoản gồm 6–19 chữ số')
    if (!isPersonName(holder)) next.accountHolderName = t('Tên chủ tài khoản chỉ gồm chữ cái và khoảng trắng')
    setErrors(next)
    if (Object.keys(next).length) return
    setError(null)
    const attempt = () =>
      save.mutate(
        { bankName, accountNumber, accountHolderName: holder.trim().toUpperCase() },
        {
          onSuccess: onClose,
          onError: (problem) => {
            if (!gate.handle(problem, attempt)) setError(problemMessage(problem))
          },
        },
      )
    attempt()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Đổi tài khoản nhận tiền')}</DialogTitle>
          <DialogDescription>
            {t('Áp dụng ngay cho mã VietQR khách chuyển khoản và cho các lần bonbon chi trả. Nếu quán dùng SePay, nhớ liên kết tài khoản mới trong SePay.')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <FormRow label={t('Ngân hàng')} htmlFor="new-bank" required error={errors.bankName}>
            <BankPicker id="new-bank" value={bankName} onChange={setBankName} invalid={!!errors.bankName} />
          </FormRow>
          <FormRow label={t('Số tài khoản')} htmlFor="new-account" required error={errors.accountNumber}>
            <Input id="new-account" inputMode="numeric" maxLength={19} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))} autoComplete="off" />
          </FormRow>
          <FormRow label={t('Chủ tài khoản')} htmlFor="new-holder" required error={errors.accountHolderName} hint={t('Viết đúng như trên thẻ hoặc app ngân hàng, không dấu.')}>
            <Input id="new-holder" maxLength={100} value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="NGUYEN VAN A" autoComplete="off" />
          </FormRow>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {t('Đổi tài khoản')}
            </Button>
          </DialogFooter>
        </form>
        {gate.dialog}
      </DialogContent>
    </Dialog>
  )
}
