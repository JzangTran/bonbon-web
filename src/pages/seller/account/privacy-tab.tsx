import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { api, problemMessage } from '@/shared/api'
import { intlLocale, t } from '@/shared/i18n'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { FormRow } from '@/shared/ui/form-row'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

const TYPES: { id: 'CORRECT' | 'WITHDRAW' | 'RESTRICT' | 'OBJECT'; label: string; hint: string }[] = [
  { id: 'CORRECT', label: 'Sửa dữ liệu', hint: 'Thông tin sai mà bạn không tự sửa được, ví dụ tên trên đơn cũ.' },
  { id: 'WITHDRAW', label: 'Rút lại đồng ý', hint: 'Thôi đồng ý cho một mục đích xử lý dữ liệu.' },
  { id: 'RESTRICT', label: 'Hạn chế xử lý', hint: 'Tạm ngưng dùng một phần dữ liệu trong khi chờ làm rõ.' },
  { id: 'OBJECT', label: 'Phản đối xử lý', hint: 'Không muốn dữ liệu được dùng cho một việc cụ thể.' },
]
const TYPE_LABEL: Record<string, string> = { ACCESS: 'Tải dữ liệu', CORRECT: 'Sửa dữ liệu', WITHDRAW: 'Rút lại đồng ý', RESTRICT: 'Hạn chế xử lý', OBJECT: 'Phản đối xử lý', DELETE: 'Xoá dữ liệu' }
const STATUS_LABEL: Record<string, string> = { RECEIVED: 'Đã nhận', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành', REJECTED: 'Từ chối' }
const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(intlLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')

/**
 * Personal data (data-subject-requests.md): download a copy at once, or ask for the rest with the deadline shown. Modeled on the
 * privacy centers of Shopify, Google and Facebook: self-service first, a short form for the cases that need a person, and a history.
 */
export function PrivacyTab() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const history = useQuery({
    queryKey: ['account', 'data-requests'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/me/data-requests')
      if (error || !data) throw error
      return data
    },
  })
  const exportNow = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/me/data-export', {})
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['account', 'data-requests'] })
      if (data.downloadUrl) window.location.assign(data.downloadUrl)
      feedback.success(t('Đã tạo tệp dữ liệu. Liên kết tải nằm ở lịch sử bên dưới và dùng được trong 7 ngày.'))
    },
    onError: (e) => feedback.error(e),
  })
  const [type, setType] = useState<(typeof TYPES)[number]['id']>('CORRECT')
  const [details, setDetails] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const ask = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/me/data-requests', { body: { type, details: details.trim() } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['account', 'data-requests'] })
      setDetails('')
      feedback.success(t('Đã gửi yêu cầu về dữ liệu. Bạn nhận phản hồi qua email trong 2 ngày làm việc.'))
    },
    onError: (e) => setFormError(problemMessage(e)),
  })

  return (
    <div className="flex flex-col gap-12">
      <Card>
        <CardHeader>
          <CardTitle>{t('Tải dữ liệu của bạn')}</CardTitle>
          <CardDescription>{t('Tệp JSON gồm hồ sơ, địa chỉ, các lần đồng ý, đơn hàng, đánh giá, tin nhắn đã gửi và thông tin cửa hàng. Mỗi giờ một lần.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => exportNow.mutate()} disabled={exportNow.isPending}>
            <DownloadIcon className="size-4" aria-hidden="true" />
            {exportNow.isPending ? t('Đang tạo tệp…') : t('Tải dữ liệu')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('Gửi yêu cầu về dữ liệu')}</CardTitle>
          <CardDescription>{t('Quản trị viên phản hồi trong 2 ngày làm việc và hoàn thành trong 10–15 ngày. Muốn xoá tài khoản, dùng tab Xoá tài khoản.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (details.trim().length < 10) return setFormError(t('Mô tả ít nhất 10 ký tự để quản trị viên hiểu yêu cầu.'))
              setFormError(null)
              ask.mutate()
            }}
          >
            <fieldset className="grid gap-2 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-medium">{t('Loại yêu cầu')}</legend>
              {TYPES.map((o) => (
                <label key={o.id} className="flex cursor-pointer flex-col gap-1 rounded-sm border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent/40">
                  <span className="flex items-center gap-2 font-medium">
                    <input type="radio" name="dsr-type" className="accent-[var(--color-primary)]" checked={type === o.id} onChange={() => setType(o.id)} />
                    {t(o.label)}
                  </span>
                  <span className="text-xs text-muted-foreground">{t(o.hint)}</span>
                </label>
              ))}
            </fieldset>
            <FormRow label={t('Mô tả yêu cầu')} htmlFor="dsr-details" required>
              <Textarea id="dsr-details" rows={4} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)} />
            </FormRow>
            <FormError message={formError} />
            <Button type="submit" disabled={ask.isPending} className="self-start">
              {t('Gửi yêu cầu')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">{t('Lịch sử yêu cầu')}</h2>
        {history.isError ? <FormError message={problemMessage(history.error)} /> : null}
        {history.data && !history.data.length ? <p className="text-sm text-muted-foreground">{t('Chưa có yêu cầu nào.')}</p> : null}
        <ul className="flex flex-col divide-y rounded-sm border empty:hidden">
          {(history.data ?? []).map((r) => (
            <li key={r.id} className="flex flex-col gap-1.5 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{t(TYPE_LABEL[r.type ?? ''] ?? r.type ?? '')}</span>
                <Badge variant={r.status === 'REJECTED' ? 'destructive' : r.status === 'COMPLETED' ? 'default' : 'secondary'}>{t(STATUS_LABEL[r.status ?? ''] ?? '')}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Gửi {d}').replace('{d}', day(r.receivedAt))}
                {r.status === 'RECEIVED' || r.status === 'IN_PROGRESS' ? ` · ${t('Hạn hoàn thành {d}').replace('{d}', day(r.dueAt))}${r.extended ? ` (${t('đã gia hạn')})` : ''}` : ''}
              </p>
              {r.details ? <p className="text-muted-foreground">{r.details}</p> : null}
              {r.responseNote && r.type !== 'ACCESS' ? <p>{t('Trả lời: ')}{r.responseNote}</p> : null}
              {r.downloadUrl ? (
                <a href={r.downloadUrl} className="text-link inline-flex items-center gap-1 self-start">
                  <DownloadIcon className="size-3.5" aria-hidden="true" />
                  {t('Tải tệp')}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
