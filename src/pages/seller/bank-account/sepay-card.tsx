import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CopyButton } from '@/shared/ui/copy-button'
import { CheckCircle2Icon } from 'lucide-react'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { intlLocale, t } from '@/shared/i18n'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FormError } from '@/widgets/auth-shell'

const OUTCOME: Record<string, { label: string; tone: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  PAID: { label: 'Đã ghi nhận', tone: 'default' },
  AMOUNT_SHORT: { label: 'Thiếu tiền', tone: 'destructive' },
  NOT_FOUND: { label: 'Không thấy đơn', tone: 'secondary' },
  NO_CODE: { label: 'Không có mã đơn', tone: 'secondary' },
  ALREADY_PAID: { label: 'Đơn đã thanh toán', tone: 'outline' },
  NOT_A_BANK_TRANSFER: { label: 'Đơn không chuyển khoản', tone: 'outline' },
  OUTGOING: { label: 'Tiền ra', tone: 'outline' },
}
const money = (n?: number) => (n ?? 0).toLocaleString(intlLocale) + ' ₫'
const time = (iso?: string | null) => (iso ? new Date(iso).toLocaleString(intlLocale, { dateStyle: 'short', timeStyle: 'short' }) : '')

function Copy({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-sm bg-muted px-2 py-1.5 text-xs">{value}</code>
      <CopyButton value={value} label={label} iconOnly />
    </div>
  )
}

/**
 * The SePay sub-account (VA) code: for banks SePay only reports when the content starts with "SEVQR TKP<code>" (VietinBank
 * personal accounts among them), bonbon puts that in front of the order code in the VietQR content.
 */
function SubAccount({ current, canEdit }: { current: string | null; canEdit: boolean }) {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const [code, setCode] = useState(current ?? '')
  const [error, setError] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: async (value: string) => {
      const { data, error } = await api.PUT('/api/merchant/payments/sepay/sub-account', { body: { code: value } })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      setCode(data.subAccount ?? '')
      queryClient.setQueryData(['merchant', 'sepay'], data)
      feedback.success(data.subAccount ? t('Đã lưu mã tài khoản ảo. Mã VietQR của đơn mới tự ghi nội dung SEVQR kèm mã này.') : t('Đã bỏ mã tài khoản ảo. Mã VietQR của đơn mới chỉ còn mã đơn.'))
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = code.trim().toUpperCase().replace(/^TKP(?=.)/, '')
    if (value && !/^[A-Z0-9]{1,10}$/.test(value)) {
      setError(t('Mã tài khoản ảo gồm 1–10 chữ cái hoặc chữ số.'))
      return
    }
    setError(null)
    save.mutate(value)
  }
  const preview = (code.trim().toUpperCase().replace(/^TKP(?=.)/, '') || current) ?? ''
  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-sm border p-3" noValidate>
      <Label htmlFor="sepay-va" className="text-sm font-semibold">
        {t('Mã tài khoản ảo (VA) SePay')}
      </Label>
      <p className="text-xs text-muted-foreground">
        {t('Chỉ cần khi SePay yêu cầu nội dung chuyển khoản bắt đầu bằng SEVQR TKP… (ví dụ VietinBank cá nhân). Nhập phần mã sau TKP, mã VietQR sẽ tự ghi đúng nội dung.')}
      </p>
      <div className="flex flex-wrap gap-2">
        <Input
          id="sepay-va"
          className="w-40 uppercase"
          maxLength={13}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="2PO"
          disabled={!canEdit}
          autoComplete="off"
          aria-invalid={!!error}
        />
        {canEdit ? (
          <Button type="submit" variant="outline" disabled={save.isPending}>
            {t('Lưu mã')}
          </Button>
        ) : null}
      </div>
      {preview ? (
        <p className="text-xs text-muted-foreground">
          {t('Nội dung chuyển khoản sẽ là')} <code className="font-mono">SEVQR TKP{preview} BONBON123</code>
        </p>
      ) : null}
      <FormError message={error} />
    </form>
  )
}

/**
 * Automatic transfer confirmation through SePay (confirm-bank-transfer): the shop links its bank account in SePay, pastes the
 * webhook address and key shown here, and every incoming transfer with the order code marks that order paid. The last ten
 * transfers show what matched and why something did not, the way Stripe and Shopify show webhook deliveries.
 */
export function SepayCard() {
  const feedback = useFeedback()
  const { session } = useSession()
  const canEdit = session?.permissions.has('vendor:write') ?? false
  const queryClient = useQueryClient()
  const [apiKey, setApiKey] = useState<string | null>(null)
  const status = useQuery({
    queryKey: ['merchant', 'sepay'],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/payments/sepay')
      if (error || !data) throw error
      return data
    },
  })
  const connect = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/merchant/payments/sepay', {})
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      setApiKey(data.apiKey ?? null)
      void queryClient.invalidateQueries({ queryKey: ['merchant', 'sepay'] })
    },
    onError: (e) => feedback.error(e),
  })
  const disconnect = useMutation({
    mutationFn: async () => {
      const { error, response } = await api.DELETE('/api/merchant/payments/sepay', {})
      if (!response.ok) throw error
    },
    onSuccess: () => {
      setApiKey(null)
      void queryClient.invalidateQueries({ queryKey: ['merchant', 'sepay'] })
      feedback.success(t('Đã ngắt kết nối SePay. Đơn chuyển khoản không còn tự xác nhận; bạn đánh dấu đã nhận tiền cho từng đơn.'))
    },
    onError: (e) => feedback.error(e),
  })
  const s = status.data

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{t('Tự xác nhận chuyển khoản')}</CardTitle>
          {s?.connected ? <Badge>{t('Đã kết nối')}</Badge> : <Badge variant="outline">{t('Chưa kết nối')}</Badge>}
        </div>
        <CardDescription>
          {t('Kết nối SePay để đơn chuyển khoản tự chuyển sang đã thanh toán khi tiền về, không cần mở app ngân hàng kiểm tra.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {status.isError ? <FormError message={problemMessage(status.error)} /> : null}
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
          <li>{t('Tạo tài khoản ở sepay.vn và liên kết tài khoản ngân hàng nhận tiền của quán.')}</li>
          <li>{t('Trong SePay, thêm webhook với địa chỉ bên dưới, kiểu chứng thực API Key.')}</li>
          <li>{t('Dán khoá bonbon tạo cho bạn vào ô API Key rồi lưu.')}</li>
        </ol>
        {s ? <Copy value={s.webhookUrl ?? ''} label={t('Sao chép địa chỉ webhook')} /> : null}
        {apiKey ? (
          <div className="flex flex-col gap-2 rounded-sm border border-primary/40 bg-accent/30 p-3">
            <p className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2Icon className="size-4 text-primary" aria-hidden="true" />
              {t('Khoá chỉ hiện một lần. Sao chép ngay.')}
            </p>
            <Copy value={apiKey} label={t('Sao chép khoá')} />
          </div>
        ) : null}
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => connect.mutate()} disabled={connect.isPending}>
              {s?.connected ? t('Tạo khoá mới') : t('Tạo khoá và kết nối')}
            </Button>
            {s?.connected ? (
              <Button variant="outline" onClick={() => disconnect.mutate()} disabled={disconnect.isPending}>
                {t('Ngắt kết nối')}
              </Button>
            ) : null}
          </div>
        ) : null}
        {s?.connected ? <SubAccount current={s.subAccount ?? null} canEdit={canEdit} /> : null}
        {s?.connected ? (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">{t('Giao dịch gần đây')}</h3>
            <p className="text-xs text-muted-foreground">
              {s.lastEventAt ? t('SePay gọi lần cuối {d}').replace('{d}', time(s.lastEventAt)) : t('SePay chưa gọi lần nào. Thử chuyển một khoản nhỏ để kiểm tra.')}
            </p>
            <ul className="flex flex-col divide-y rounded-sm border text-sm empty:hidden">
              {(s.recent ?? []).map((e) => (
                <li key={e.sepayId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span className="flex flex-col">
                    <span className="font-medium tabular-nums">{money(e.amount)}</span>
                    <span className="max-w-72 truncate text-xs text-muted-foreground">
                      {e.orderNumber ? `#${e.orderNumber} · ` : ''}
                      {e.content}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{time(e.receivedAt)}</span>
                    <Badge variant={OUTCOME[e.outcome ?? '']?.tone}>{t(OUTCOME[e.outcome ?? '']?.label ?? e.outcome ?? '')}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </CardContent>
    </Card>
  )
}
