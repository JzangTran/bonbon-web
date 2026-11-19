import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession, type Role } from '@/entities/session'
import { api, problemCode, problemMessage } from '@/shared/api'
import { developersPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { isEmail, isPersonName } from '@/shared/lib/validate'
import { Button, buttonClass } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'
import { Textarea } from '@/shared/ui/textarea'
import { AuthHero, FormError, FormSuccess } from '@/widgets/auth-shell'

export { DeveloperReferencePage } from './reference'

/**
 * The developer portal's front page: the API reference is not public. Like the partner programmes of Grab, Shopee Open Platform and
 * TikTok Shop Partner Center, a person asks the team, an administrator approves, and only then does the reference open.
 */
export function DevelopersHomePage() {
  const { session } = useSession()
  const signedIn = session?.role === 'DEVELOPER'
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-8 px-4 py-16">
      <div className="flex flex-col gap-3">
        <p className="text-small font-medium text-primary">{t('bonbon dành cho lập trình viên')}</p>
        <h1 className="text-title-1">{t('Tài liệu API bonbon')}</h1>
        <p className="text-muted-foreground">
          {t('Mọi endpoint, tham số và mã lỗi của API bonbon. Trang này chỉ mở cho tài khoản đã liên hệ đội ngũ phát triển và được quản trị viên duyệt.')}
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {[
          [t('Gửi yêu cầu'), t('Cho biết bạn là ai và định dùng API để làm gì.')],
          [t('Chờ duyệt'), t('Quản trị viên xem xét và trả lời qua email.')],
          [t('Đăng nhập'), t('Được duyệt thì đăng nhập để đọc tài liệu.')],
        ].map(([title, text], i) => (
          <li key={title} className="flex flex-col gap-1 rounded-sm border bg-card p-4">
            <span className="text-caption font-semibold text-primary">{i + 1}</span>
            <span className="font-medium">{title}</span>
            <span className="text-body-sm text-muted-foreground">{text}</span>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        {signedIn ? (
          <Link to={developersPath('/reference')} className={buttonClass()}>
            {t('Mở tài liệu API')}
          </Link>
        ) : (
          <>
            <Link to={developersPath('/request')} className={buttonClass()}>
              {t('Xin quyền truy cập')}
            </Link>
            <Link to={developersPath('/login')} className={buttonClass({ variant: 'outline' })}>
              {t('Đăng nhập')}
            </Link>
          </>
        )}
      </div>
    </main>
  )
}

type Draft = { name: string; email: string; company: string; website: string; purpose: string }

export function DeveloperRequestPage() {
  const [d, setD] = useState<Draft>({ name: '', email: '', company: '', website: '', purpose: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD((v) => ({ ...v, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: typeof errors = {}
    if (!isPersonName(d.name)) next.name = t('Họ tên chỉ gồm chữ cái và khoảng trắng')
    if (!isEmail(d.email)) next.email = t('Email không hợp lệ')
    if (d.website && !/^https:\/\/\S+$/.test(d.website.trim())) next.website = t('Địa chỉ phải bắt đầu bằng https://')
    if (d.purpose.trim().length < 20) next.purpose = t('Mô tả ít nhất 20 ký tự để đội ngũ hiểu bạn cần gì.')
    setErrors(next)
    if (Object.keys(next).length) return
    setBusy(true)
    setError(null)
    const { error: problem } = await api.POST('/api/developer/access-requests', {
      body: {
        name: d.name.trim(),
        email: d.email.trim(),
        company: d.company.trim() || undefined,
        website: d.website.trim() || undefined,
        purpose: d.purpose.trim(),
        captchaToken: captchaToken ?? undefined,
      },
    })
    setBusy(false)
    if (problem) {
      setError(problemMessage(problem))
      return
    }
    setDone(true)
  }

  return (
    <AuthHero
      heading={t('Xin quyền truy cập API')}
      eyebrow={t('bonbon dành cho lập trình viên')}
      headline={t('Xin quyền truy cập')}
      headlineSoft={t('tài liệu API')}
      cardTitle={t('Xin quyền truy cập API')}
      footer={
        <>
          {t('Đã được duyệt?')}{' '}
          <Link to={developersPath('/login')} className="text-link font-medium">
            {t('Đăng nhập')}
          </Link>
        </>
      }
    >
      {done ? (
        <FormSuccess message={t('Đã gửi yêu cầu. Quản trị viên sẽ trả lời qua email; khi được duyệt, bạn đăng nhập ở trang này.')} />
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <FormRow label={t('Họ tên')} htmlFor="dev-name" required error={errors.name}>
            <Input id="dev-name" maxLength={100} value={d.name} onChange={set('name')} autoComplete="name" />
          </FormRow>
          <FormRow label="Email" htmlFor="dev-email" required error={errors.email} hint={t('Dùng email này để đăng nhập khi được duyệt.')}>
            <Input id="dev-email" type="email" maxLength={254} value={d.email} onChange={set('email')} autoComplete="email" />
          </FormRow>
          <FormRow label={t('Công ty hoặc nhóm')} htmlFor="dev-company">
            <Input id="dev-company" maxLength={150} value={d.company} onChange={set('company')} autoComplete="organization" />
          </FormRow>
          <FormRow label={t('Trang web hoặc kho mã')} htmlFor="dev-site" error={errors.website}>
            <Input id="dev-site" type="url" maxLength={300} value={d.website} onChange={set('website')} placeholder="https://" />
          </FormRow>
          <FormRow label={t('Bạn định dùng API để làm gì?')} htmlFor="dev-purpose" required error={errors.purpose}>
            <Textarea id="dev-purpose" rows={4} maxLength={1000} value={d.purpose} onChange={set('purpose')} />
          </FormRow>
          <Captcha onToken={setCaptchaToken} />
          <FormError message={error} />
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? t('Đang gửi…') : t('Gửi yêu cầu')}
          </Button>
        </form>
      )}
    </AuthHero>
  )
}

export function DeveloperLoginPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsCaptcha, setNeedsCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { data, error: problem } = await api.POST('/api/developer/auth/login', { body: { email: email.trim(), password, captchaToken: captchaToken ?? undefined } })
    setBusy(false)
    if (!data?.tokens?.accessToken || !data.user?.id) {
      if (problemCode(problem) === 'CAPTCHA_REQUIRED') setNeedsCaptcha(true)
      setError(problemMessage(problem))
      return
    }
    signIn({
      accessToken: data.tokens.accessToken,
      userId: data.user.id,
      email: data.user.email ?? '',
      name: data.user.name ?? '',
      role: 'DEVELOPER' as Role,
      availableRoles: ['DEVELOPER'],
    })
    navigate(developersPath('/reference'), { replace: true })
  }

  return (
    <AuthHero
      heading={t('Đăng nhập')}
      eyebrow={t('bonbon dành cho lập trình viên')}
      headline={t('Tài liệu API')}
      headlineSoft={t('cho tài khoản đã duyệt')}
      cardTitle={t('Đăng nhập')}
      footer={
        <>
          {t('Chưa có quyền?')}{' '}
          <Link to={developersPath('/request')} className="text-link font-medium">
            {t('Xin quyền truy cập')}
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input type="email" autoComplete="email" placeholder="Email" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <PasswordInput autoComplete="current-password" placeholder={t('Mật khẩu')} className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} aria-label={t('Mật khẩu')} />
        {needsCaptcha ? <Captcha onToken={setCaptchaToken} /> : null}
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={busy || !email || !password}>
          {busy ? t('Đang đăng nhập…') : t('Đăng nhập')}
        </Button>
        <Link to="/forgot-password" className="text-link -mt-2 self-start text-caption">
          {t('Quên mật khẩu')}
        </Link>
      </form>
    </AuthHero>
  )
}
