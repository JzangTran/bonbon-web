import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'
import { useSession, type Role } from '@/entities/session'
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

const schema = z.object({
  email: z.email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
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
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })

  const finish = (data: LoginResponse) => {
    const { tokens, user } = data
    if (!tokens?.accessToken || !tokens.refreshToken || !user?.id) return
    signIn({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.id,
      email: user.email ?? '',
      name: user.name ?? '',
      role: 'SELLER',
      availableRoles: (user.availableRoles ?? []) as Role[],
    })
    const from = (location.state as { from?: string } | null)?.from
    navigate(from && from.startsWith('/seller') ? from : '/seller', { replace: true })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    setUnverifiedEmail(null)
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
      setError('Tài khoản này là tài khoản khách hàng. Hãy dùng ứng dụng bonbon trên điện thoại để đặt món.')
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
      heading="Đăng nhập"
      eyebrow="bonbon dành cho người bán"
      headline="Bán hàng ngay trong khu của bạn"
      points={SELLER_POINTS}
      cardTitle="Đăng nhập"
      footer={
        <>
          Bạn mới biết đến bonbon?{' '}
          <Link to="/seller/register" className="font-medium text-primary hover:underline">
            Đăng ký
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            className="h-11"
            aria-invalid={!!form.formState.errors.email}
            {...form.register('email')}
          />
          {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="sr-only">
            Mật khẩu
          </Label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Mật khẩu"
            className="h-11"
            aria-invalid={!!form.formState.errors.password}
            {...form.register('password')}
          />
          {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
        </div>
        {needsCaptcha ? <Captcha onToken={setCaptchaToken} /> : null}
        <FormError message={error} />
        {unverifiedEmail && !resent ? (
          <Button type="button" variant="outline" onClick={resend}>
            Gửi lại email xác thực
          </Button>
        ) : null}
        {resent ? <FormSuccess message="Nếu tài khoản cần xác thực, chúng tôi đã gửi lại liên kết. Hãy kiểm tra hộp thư." /> : null}
        <Button type="submit" size="lg" className="uppercase tracking-wide" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
        <Link to="/forgot-password" className="-mt-2 self-start text-xs text-primary hover:underline">
          Quên mật khẩu
        </Link>
      </form>
      <GoogleSignIn />
      <LegalNote action="đăng nhập" />
    </AuthHero>
  )
}
