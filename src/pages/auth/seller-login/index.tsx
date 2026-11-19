import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { teamOf, useSession, type Role } from '@/entities/session'
import { GoogleSignIn } from '@/features/google-sign-in'
import { api, problemCode, problemMessage, type components } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'
import { Label } from '@/shared/ui/label'
import { AuthHero, FormError, FormSuccess } from '@/widgets/auth-shell'
import { LegalNote } from '@/widgets/auth-shell/legal-note'
import { SELLER_POINTS } from '@/widgets/auth-shell/seller-points'
import { merchantPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { QrLogin } from './qr-login'

/** A main account signs in as `name:main`, a member as `name:code` (seller-team); everyone else with an email. */
const TEAM_LOGIN = /^[a-z0-9._-]{2,40}:[a-z0-9._-]{2,40}$/
const isTeamLogin = (v: string) => TEAM_LOGIN.test(v.trim().toLowerCase())

const schema = z.object({
  email: z
    .string()
    .trim()
    .refine((v) => isTeamLogin(v) || z.email().safeParse(v).success, t('Nhập email, hoặc tên đăng nhập nhóm dạng tên:main / tên:mã')),
  password: z.string().min(1, t('Vui lòng nhập mật khẩu')).max(100, t('Mật khẩu tối đa 100 ký tự')),
})
type Values = z.infer<typeof schema>
type LoginResponse = components['schemas']['LoginResponse']

export function SellerLoginPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [needsCaptcha, setNeedsCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resent, setResent] = useState(false)
  // the seller sign-up sends an email that already has an account here, with what to do next
  const arrived = location.state as { email?: string; notice?: string } | null
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: arrived?.email ?? '', password: '' } })

  const finish = (data: LoginResponse) => {
    if (data.deletionCancelled) {
      // shown across the page change that follows sign-in, so a snackbar (no page region survives it)
      toast.success(t('Việc xoá tài khoản đã được huỷ vì bạn đăng nhập lại.'), { description: t('Tài khoản của bạn vẫn như cũ.'), duration: 12_000 })
    }
    const { tokens, user } = data
    if (!tokens?.accessToken || !user?.id) return
    signIn({
      accessToken: tokens.accessToken,
      userId: user.id,
      email: user.email ?? '',
      name: user.name ?? '',
      role: 'SELLER',
      availableRoles: (user.availableRoles ?? []) as Role[],
      team: teamOf((user as { team?: unknown }).team),
    })
    const from = (location.state as { from?: string } | null)?.from
    navigate(from && from.startsWith(merchantPath()) ? from : merchantPath(), { replace: true })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    setUnverifiedEmail(null)
    if (isTeamLogin(values.email)) {
      const { data: team, error: teamProblem } = await api.POST('/api/seller-team/login', {
        body: { login: values.email.trim().toLowerCase(), password: values.password, captchaToken: captchaToken ?? undefined },
      })
      if (teamProblem || !team) {
        if (problemCode(teamProblem) === 'CAPTCHA_REQUIRED') setNeedsCaptcha(true)
        setError(problemMessage(teamProblem))
        return
      }
      finish(team)
      return
    }
    const { data, error: problem } = await api.POST('/api/auth/login', {
      body: { ...values, captchaToken: captchaToken ?? undefined },
    })
    if (problem || !data) {
      if (problemCode(problem) === 'CAPTCHA_REQUIRED') setNeedsCaptcha(true)
      if (problemCode(problem) === 'EMAIL_NOT_VERIFIED') setUnverifiedEmail(values.email)
      setError(problemMessage(problem))
      return
    }
    const roles = (data.availableRoles ?? data.user?.availableRoles ?? []) as Role[]
    if (!roles.includes('SELLER')) {
      setError(t('Tài khoản này là tài khoản khách hàng. Hãy dùng ứng dụng bonbon trên điện thoại để đặt món.'))
      return
    }
    if (data.needsRoleSelection && data.roleToken) {
      // The web app is for sellers only: a dual-role identity always continues as SELLER here.
      const { data: picked, error: pickError } = await api.POST('/api/auth/select-role', {
        body: { role: 'SELLER', roleToken: data.roleToken },
      })
      if (!picked) {
        setError(problemMessage(pickError as unknown))
        return
      }
      finish(picked)
      return
    }
    finish(data)
  })

  const resend = async () => {
    if (!unverifiedEmail) return
    await api.POST('/api/auth/resend-verification', { body: { email: unverifiedEmail } })
    setResent(true)
  }

  return (
    <AuthHero
      heading={t('Đăng nhập')}
      eyebrow={t('bonbon dành cho người bán')}
      headline={t('Bán hàng')}
      headlineSoft={t('ngay trong khu của bạn')}
      points={SELLER_POINTS}
      cardTitle={t('Đăng nhập')}
      footer={
        <>
          {t('Bạn mới biết đến bonbon?')}{' '}
          <Link to={merchantPath('/register')} className="text-link font-medium">
            {t('Đăng ký')}
          </Link>
        </>
      }
    >
      {arrived?.notice ? <FormSuccess message={arrived.notice} /> : null}
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="sr-only">
            {t('Email hoặc tên đăng nhập nhóm')}
          </Label>
          <Input
            id="email"
            type="text"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            autoComplete="username"
            placeholder={t('Email hoặc tên:main')}
            aria-describedby="login-hint"
            className="h-11"
            aria-invalid={!!form.formState.errors.email}
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p role="alert" className="text-body-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : (
            <p id="login-hint" className="text-caption text-muted-foreground">{t('Tài khoản chính: tên:main. Thành viên: tên:mã do chủ cấp.')}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="sr-only">
            {t('Mật khẩu')}
          </Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder={t('Mật khẩu')}
            className="h-11"
            aria-invalid={!!form.formState.errors.password}
            {...form.register('password')}
          />
          {form.formState.errors.password ? <p role="alert" className="text-body-sm text-destructive">{form.formState.errors.password.message}</p> : null}
        </div>
        {needsCaptcha ? <Captcha onToken={setCaptchaToken} /> : null}
        <FormError message={error} />
        {unverifiedEmail && !resent ? (
          <Button type="button" variant="outline" onClick={resend}>
            {t('Gửi lại email xác thực')}
          </Button>
        ) : null}
        {resent ? <FormSuccess message={t('Nếu tài khoản cần xác thực, chúng tôi đã gửi lại liên kết. Hãy kiểm tra hộp thư.')} /> : null}
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? t('Đang đăng nhập…') : t('Đăng nhập')}
        </Button>
        <Link to="/forgot-password" className="text-link -mt-2 self-start text-caption">
          {t('Quên mật khẩu')}
        </Link>
      </form>
      <GoogleSignIn />
      <QrLogin onSignedIn={finish} />
      <LegalNote action={t('đăng nhập')} />
    </AuthHero>
  )
}
