import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { api, problemCode, problemMessage } from '@/shared/api'
import { intlLocale, t } from '@/shared/i18n'
import { compactPhone, isEmail, isVnPhone, passwordProblem } from '@/shared/lib/validate'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { PasswordStrength } from '@/shared/ui/password-strength'
import { FormError, FormSuccess } from '@/widgets/auth-shell'

const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(intlLocale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '')
const LINK_STATUS: Record<string, string> = {
  PENDING_AUTHORIZATION: 'Chờ bạn trả lời',
  AUTHORIZED: 'Đang quản lý cửa hàng',
  DECLINED: 'Bạn đã từ chối',
  CANCELLED: 'Đã huỷ',
  EXPIRED: 'Hết hạn',
  UNLINKED: 'Đã gỡ',
}

/**
 * Main account and links, from the shop account's side (register-main-account.md, link-shop.md): create the main account that will
 * manage several shops and a team, and answer the main accounts that ask to manage this shop.
 */
export function MainAccountTab() {
  const own = useQuery({
    queryKey: ['account', 'main-account'],
    retry: false,
    queryFn: async () => {
      const { data, error, response } = await api.GET('/api/merchant/link-requests/main-account')
      if (response.status === 404) return null
      if (error || !data) throw error
      return data
    },
  })
  return (
    <div className="flex flex-col gap-12">
      {own.data ? (
        <Card>
          <CardHeader>
            <CardTitle>{t('Tài khoản chính của bạn')}</CardTitle>
            <CardDescription>{t('Đăng nhập trang người bán bằng tên này để quản lý nhiều cửa hàng và nhân viên.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[9rem_1fr] gap-x-4 gap-y-2 text-body-sm">
              <dt className="text-muted-foreground">{t('Tên đăng nhập')}</dt>
              <dd className="font-mono">{own.data.login}</dd>
              <dt className="text-muted-foreground">{t('Tên hiển thị')}</dt>
              <dd>{own.data.accountName}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{own.data.email}</dd>
            </dl>
          </CardContent>
        </Card>
      ) : own.data === null ? (
        <RegisterCard />
      ) : null}
      <IncomingCard />
    </div>
  )
}

function RegisterCard() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Quản lý nhiều cửa hàng và nhân viên')}</CardTitle>
        <CardDescription>
          {t('Tạo tài khoản chính để quản lý nhiều cửa hàng cùng lúc và tạo tài khoản cho nhân viên với quyền riêng ở từng cửa hàng. Cửa hàng này được liên kết ngay.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setOpen(true)}>{t('Tạo tài khoản chính')}</Button>
      </CardContent>
      {open ? (
        <RegisterDialog
          onClose={() => setOpen(false)}
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: ['account', 'main-account'] })
            setOpen(false)
          }}
        />
      ) : null}
    </Card>
  )
}

type Form = { accountName: string; email: string; phone: string; username: string; password: string; confirmPassword: string; code: string; currentPassword: string }

function RegisterDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const feedback = useFeedback()
  const [f, setF] = useState<Form>({ accountName: '', email: '', phone: '', username: '', password: '', confirmPassword: '', code: '', currentPassword: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(false)
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((v) => ({ ...v, [k]: k === 'username' ? e.target.value.toLowerCase().replace(/\s/g, '') : k === 'code' ? e.target.value.replace(/\D/g, '') : e.target.value }))

  const send = useMutation({
    mutationFn: async () => {
      const { error: problem, response } = await api.POST('/api/seller-team/main-accounts/code', { body: { email: f.email.trim() } })
      if (!response.ok) throw problem
    },
    onSuccess: () => {
      setSent(true)
      setError(null)
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const save = useMutation({
    mutationFn: async () => {
      const { data, error: problem } = await api.POST('/api/seller-team/main-accounts', {
        body: {
          accountName: f.accountName.trim(),
          email: f.email.trim(),
          phone: compactPhone(f.phone) || undefined,
          username: f.username,
          password: f.password,
          confirmPassword: f.confirmPassword,
          code: f.code,
          currentPassword: f.currentPassword || undefined,
        },
      })
      if (problem || !data) throw problem
      return data
    },
    onSuccess: (data) => {
      feedback.success(t('Đã tạo {login}. Đăng xuất rồi đăng nhập bằng tên này để quản lý nhóm.').replace('{login}', data.login ?? ''))
      onDone()
    },
    onError: (e) => {
      if (problemCode(e) === 'REAUTH_REQUIRED') setNeedsPassword(true)
      setError(problemMessage(e))
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!f.accountName.trim()) next.accountName = t('Vui lòng nhập tên hiển thị')
    if (!isEmail(f.email)) next.email = t('Email không hợp lệ')
    const phone = compactPhone(f.phone)
    if (phone && !isVnPhone(phone, 'any')) next.phone = t('Số điện thoại Việt Nam không hợp lệ')
    if (!/^[a-z0-9._-]{3,40}$/.test(f.username)) next.username = t('3–40 ký tự: chữ thường không dấu, số, dấu chấm, gạch dưới, gạch ngang')
    const weak = passwordProblem(f.password, f.email, f.accountName)
    if (weak) next.password = weak
    if (f.password !== f.confirmPassword) next.confirmPassword = t('Mật khẩu nhập lại không khớp')
    if (!/^\d{6}$/.test(f.code)) next.code = t('Mã gồm 6 chữ số.')
    setErrors(next)
    if (!Object.keys(next).length) save.mutate()
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('Tạo tài khoản chính')}</DialogTitle>
          <DialogDescription>{t('Tên đăng nhập không đổi được: nó đứng trước tên đăng nhập của mọi nhân viên, ví dụ lananh:nhanvien01.')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto" noValidate>
          <FormRow label={t('Tên hiển thị')} htmlFor="ma-name" required error={errors.accountName}>
            <Input id="ma-name" maxLength={100} value={f.accountName} onChange={set('accountName')} placeholder={t('Chuỗi quán Sen')} />
          </FormRow>
          <FormRow label={t('Tên đăng nhập')} htmlFor="ma-user" required error={errors.username} hint={f.username ? `${f.username}:main` : undefined}>
            <Input id="ma-user" maxLength={40} value={f.username} onChange={set('username')} spellCheck={false} autoComplete="off" />
          </FormRow>
          <FormRow label={t('Mật khẩu')} htmlFor="ma-pass" required error={errors.password}>
            <Input id="ma-pass" type="password" maxLength={100} value={f.password} onChange={set('password')} autoComplete="new-password" />
          </FormRow>
          {!errors.password ? <PasswordStrength password={f.password} email={f.email} name={f.accountName} /> : null}
          <FormRow label={t('Nhập lại mật khẩu')} htmlFor="ma-pass2" required error={errors.confirmPassword}>
            <Input id="ma-pass2" type="password" maxLength={100} value={f.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
          </FormRow>
          <FormRow label={t('Số điện thoại liên hệ')} htmlFor="ma-phone" error={errors.phone}>
            <Input id="ma-phone" type="tel" inputMode="tel" maxLength={15} value={f.phone} onChange={set('phone')} />
          </FormRow>
          <FormRow label="Email" htmlFor="ma-email" required error={errors.email} hint={t('Dùng để xác nhận và lấy lại mật khẩu.')}>
            <div className="flex gap-2">
              <Input id="ma-email" type="email" maxLength={254} value={f.email} onChange={set('email')} />
              <Button type="button" variant="outline" disabled={send.isPending || !isEmail(f.email)} onClick={() => send.mutate()}>
                {sent ? t('Gửi lại') : t('Gửi mã')}
              </Button>
            </div>
          </FormRow>
          <FormRow label={t('Mã xác nhận')} htmlFor="ma-code" required error={errors.code}>
            <Input id="ma-code" inputMode="numeric" maxLength={6} value={f.code} onChange={set('code')} autoComplete="one-time-code" />
          </FormRow>
          {sent ? <FormSuccess message={t('Đã gửi mã. Mã có hiệu lực 5 phút.')} /> : null}
          {needsPassword ? (
            <FormRow label={t('Mật khẩu tài khoản cửa hàng')} htmlFor="ma-current" required>
              <Input id="ma-current" type="password" maxLength={100} value={f.currentPassword} onChange={set('currentPassword')} autoComplete="current-password" />
            </FormRow>
          ) : null}
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {t('Tạo tài khoản chính')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function IncomingCard() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const incoming = useQuery({
    queryKey: ['account', 'link-requests'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/link-requests')
      if (error || !data) throw error
      return data
    },
  })
  const [askPassword, setAskPassword] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['account', 'link-requests'] })
  const act = useMutation({
    mutationFn: async ({ id, action, pw }: { id: string; action: 'authorize' | 'decline' | 'end'; pw?: string }) => {
      const res =
        action === 'authorize'
          ? await api.POST('/api/merchant/link-requests/{id}/authorize', { params: { path: { id } }, body: { password: pw } })
          : action === 'decline'
            ? await api.POST('/api/merchant/link-requests/{id}/decline', { params: { path: { id } } })
            : await api.DELETE('/api/merchant/link-requests/{id}', { params: { path: { id } } })
      if (!res.response.ok) throw res.error
    },
    onSuccess: (_, v) => {
      refresh()
      setAskPassword(null)
      setPassword('')
      feedback.success(v.action === 'authorize' ? t('Đã đồng ý liên kết. Tài khoản chính quản lý được cửa hàng từ bây giờ; bạn thu hồi được bất cứ lúc nào.') : t('Đã cập nhật.'))
    },
    onError: (e, v) => {
      if (problemCode(e) === 'REAUTH_REQUIRED') setAskPassword(v.id)
      else feedback.error(e)
    },
  })
  const rows = incoming.data ?? []
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Tài khoản chính quản lý cửa hàng này')}</CardTitle>
        <CardDescription>{t('Chỉ đồng ý với tài khoản bạn biết. Bạn gỡ được bất cứ lúc nào, có hiệu lực ngay.')}</CardDescription>
      </CardHeader>
      <CardContent>
        {incoming.isError ? <FormError message={problemMessage(incoming.error)} /> : null}
        {incoming.data && !rows.length ? <p className="text-body-sm text-muted-foreground">{t('Chưa có yêu cầu nào.')}</p> : null}
        <ul className="flex flex-col divide-y">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="font-medium">{r.mainAccountName}</p>
                <p className="font-mono text-caption text-muted-foreground">{r.mainLogin}</p>
                <p className="text-caption text-muted-foreground">{t('Gửi {d}').replace('{d}', day(r.requestedAt))}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={r.status === 'AUTHORIZED' ? 'default' : r.status === 'PENDING_AUTHORIZATION' ? 'secondary' : 'outline'}>{t(LINK_STATUS[r.status ?? ''] ?? '')}</Badge>
                {r.status === 'PENDING_AUTHORIZATION' ? (
                  <>
                    <Button size="sm" variant="outline" disabled={act.isPending} onClick={() => r.id && act.mutate({ id: r.id, action: 'decline' })}>
                      {t('Từ chối')}
                    </Button>
                    <Button size="sm" disabled={act.isPending} onClick={() => r.id && act.mutate({ id: r.id, action: 'authorize' })}>
                      {t('Đồng ý')}
                    </Button>
                  </>
                ) : null}
                {r.status === 'AUTHORIZED' ? (
                  <Button size="sm" variant="ghost" disabled={act.isPending} onClick={() => r.id && act.mutate({ id: r.id, action: 'end' })}>
                    {t('Gỡ liên kết')}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <Dialog open={!!askPassword} onOpenChange={(o) => !o && setAskPassword(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('Xác nhận bằng mật khẩu')}</DialogTitle>
            <DialogDescription>{t('Đồng ý là giao quyền quản lý cửa hàng. Hãy nhập mật khẩu tài khoản cửa hàng.')}</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (askPassword) act.mutate({ id: askPassword, action: 'authorize', pw: password })
            }}
          >
            <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-label={t('Mật khẩu')} />
            <DialogFooter>
              <Button type="submit" disabled={!password || act.isPending}>
                {t('Đồng ý')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
