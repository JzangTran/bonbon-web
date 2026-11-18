import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { api, problemMessage } from '@/shared/api'
import { intlLocale, t } from '@/shared/i18n'
import { isEmail } from '@/shared/lib/validate'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError, FormSuccess } from '@/widgets/auth-shell'
import { TEAM_KEYS, useMainAccount } from './api'

const STATUS: Record<string, { label: string; tone: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  AUTHORIZED: { label: 'Đang quản lý', tone: 'default' },
  PENDING_AUTHORIZATION: { label: 'Chờ chủ cửa hàng đồng ý', tone: 'secondary' },
  DECLINED: { label: 'Bị từ chối', tone: 'destructive' },
  CANCELLED: { label: 'Đã huỷ', tone: 'outline' },
  EXPIRED: { label: 'Hết hạn', tone: 'outline' },
  UNLINKED: { label: 'Đã gỡ liên kết', tone: 'outline' },
}

const date = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(intlLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')

/** The shops this main account manages and the requests on their way (link-shop.md). Both sides must agree; either can end it. */
export function SellerTeamShopsPage() {
  const feedback = useFeedback()
  const main = useMainAccount()
  const queryClient = useQueryClient()
  const [linking, setLinking] = useState(false)
  const end = useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await api.DELETE('/api/seller-team/links/{id}', { params: { path: { id } } })
      if (!response.ok) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.me })
      feedback.success(t('Đã cập nhật liên kết cửa hàng. Thành viên thấy thay đổi ở lần đăng nhập tới.'))
    },
    onError: (e) => feedback.error(e),
  })
  const links = main.data?.links ?? []
  const active = links.filter((l) => l.status === 'AUTHORIZED' || l.status === 'PENDING_AUTHORIZATION')
  const past = links.filter((l) => !active.includes(l))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1>{t('Cửa hàng liên kết')}</h1>
          <p className="text-sm text-muted-foreground">
            {main.data ? `${main.data.login} · ${main.data.email}` : null}
          </p>
        </div>
        <Button onClick={() => setLinking(true)}>
          <LinkIcon className="size-4" aria-hidden="true" />
          {t('Liên kết cửa hàng')}
        </Button>
      </div>
      {main.isPending ? <Skeleton className="h-40" /> : null}
      {main.isError ? <FormError message={problemMessage(main.error)} /> : null}
      {main.data && !active.length ? (
        <EmptyState title={t('Chưa quản lý cửa hàng nào')}>{t('Nhập email đăng nhập của tài khoản cửa hàng; chủ cửa hàng đồng ý trong Tài khoản và bảo mật là xong.')}</EmptyState>
      ) : null}
      <ul className="flex flex-col divide-y rounded-sm border">
        {active.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium">{l.shopName}</p>
              <p className="text-xs text-muted-foreground">
                {l.status === 'PENDING_AUTHORIZATION'
                  ? t('Gửi ngày {d}, hết hạn {e}').replace('{d}', date(l.requestedAt)).replace('{e}', date(l.expiresAt))
                  : t('Từ ngày {d}').replace('{d}', date(l.decidedAt))}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={STATUS[l.status ?? '']?.tone}>{t(STATUS[l.status ?? '']?.label ?? l.status ?? '')}</Badge>
              <Button variant="ghost" size="sm" disabled={end.isPending} onClick={() => l.id && end.mutate(l.id)}>
                {l.status === 'PENDING_AUTHORIZATION' ? t('Huỷ yêu cầu') : t('Rời cửa hàng')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {past.length ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">{t('Lịch sử liên kết ({n})').replace('{n}', String(past.length))}</summary>
          <ul className="mt-3 flex flex-col gap-2">
            {past.map((l) => (
              <li key={l.id} className="flex justify-between gap-3">
                <span>{l.shopName}</span>
                <span className="text-muted-foreground">{t(STATUS[l.status ?? '']?.label ?? '')} · {date(l.endedAt ?? l.decidedAt ?? l.requestedAt)}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
      {linking ? <LinkDialog email={main.data?.email ?? ''} onClose={() => setLinking(false)} /> : null}
    </div>
  )
}

function LinkDialog({ email, onClose }: { email: string; onClose: () => void }) {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const [shopEmail, setShopEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const send = useMutation({
    mutationFn: async () => {
      const { error: problem, response } = await api.POST('/api/seller-team/links/code', {})
      if (!response.ok) throw problem
    },
    onSuccess: () => {
      setSent(true)
      setError(null)
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const request = useMutation({
    mutationFn: async () => {
      const { error: problem } = await api.POST('/api/seller-team/links', { body: { shopEmail: shopEmail.trim(), code: code.trim() } })
      if (problem) throw problem
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.me })
      feedback.success(t('Đã gửi yêu cầu liên kết. Chủ cửa hàng cần đồng ý trong 7 ngày; quá hạn thì yêu cầu tự huỷ.'))
      onClose()
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmail(shopEmail)) return setError(t('Email không hợp lệ'))
    if (!/^\d{6}$/.test(code.trim())) return setError(t('Mã gồm 6 chữ số.'))
    request.mutate()
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Liên kết cửa hàng')}</DialogTitle>
          <DialogDescription>{t('Yêu cầu chỉ có hiệu lực khi chủ cửa hàng đồng ý từ tài khoản của họ.')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <FormRow label={t('Email đăng nhập của cửa hàng')} htmlFor="link-email" required>
            <Input id="link-email" type="email" maxLength={254} value={shopEmail} onChange={(e) => setShopEmail(e.target.value)} />
          </FormRow>
          <FormRow label={t('Mã xác nhận')} htmlFor="link-code" required hint={t('Mã gửi tới {email}').replace('{email}', email)}>
            <div className="flex gap-2">
              <Input id="link-code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} autoComplete="one-time-code" />
              <Button type="button" variant="outline" disabled={send.isPending} onClick={() => send.mutate()}>
                {sent ? t('Gửi lại') : t('Gửi mã')}
              </Button>
            </div>
          </FormRow>
          {sent ? <FormSuccess message={t('Đã gửi mã. Mã có hiệu lực 5 phút.')} /> : null}
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" disabled={request.isPending}>
              {t('Gửi yêu cầu')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
