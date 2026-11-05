import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon, CircleIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { GoogleSignIn } from '@/features/google-sign-in'
import { api, problemCode, problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { AuthHero, AuthStepPage, FormError, FormSuccess, SuccessMark } from '@/widgets/auth-shell'
import { LegalNote } from '@/widgets/auth-shell/legal-note'
import { SELLER_POINTS } from '@/widgets/auth-shell/seller-points'
import { merchantPath, legalUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

const schema = z.object({
  name: z.string().trim().min(1, t('Vui lòng nhập họ tên')).max(100, t('Tối đa 100 ký tự')),
  email: z.email(t('Email không hợp lệ')).max(255),
  password: z.string().min(8, t('Mật khẩu tối thiểu 8 ký tự')).max(100, t('Tối đa 100 ký tự')),
  acceptTerms: z.boolean().refine((v) => v, t('Bạn cần đồng ý để tiếp tục')),
  marketing: z.boolean(),
})
type Values = z.infer<typeof schema>

const STEPS = [{ label: t('Nhập email') }, { label: t('Tạo mật khẩu') }, { label: t('Xác thực email') }]
const RESEND_SECONDS = 60

function useCurrentDocument(type: 'SELLER_TERMS' | 'CUSTOMER_TERMS' | 'PRIVACY_POLICY') {
  return useQuery({
    queryKey: ['legal-document', type],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/legal/documents/{type}', { params: { path: { type } } })
      if (error || !data) throw error
      return data
    },
  })
}

/**
 * Seller sign-up in three steps: the email on the entry card, then name and password, then "check your mailbox". One email and
 * password work for both modes: a new account can order as a customer too, an email that already has an account asks for that
 * account's password and adds selling to it, and a seller goes to sign in.
 * The account is created in one call at the end of step 2; the email link finishes it.
 */
export function SellerRegisterPage() {
  const navigate = useNavigate()
  const terms = useCurrentDocument('SELLER_TERMS')
  const customerTerms = useCurrentDocument('CUSTOMER_TERMS')
  const privacy = useCurrentDocument('PRIVACY_POLICY')
  const [step, setStep] = useState<1 | 2 | 3 | 'link'>(1)
  const [checking, setChecking] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', acceptTerms: false, marketing: false },
  })
  const errors = form.formState.errors
  const email = useWatch({ control: form.control, name: 'email' })
  const password = useWatch({ control: form.control, name: 'password' })

  const toStepTwo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!(await form.trigger('email'))) return
    setChecking(true)
    const { data, error: problem } = await api.POST('/api/auth/email-status', { body: { email: email.trim() } })
    setChecking(false)
    if (!data) {
      setError(problemMessage(problem))
    } else if (data.status === 'NEW') {
      setStep(2)
    } else if (data.status === 'ACCOUNT') {
      setStep('link')
    } else if (data.status === 'SELLER') {
      navigate(merchantPath('/login'), { state: { email: email.trim(), notice: t('Email này đã có tài khoản người bán. Nhập mật khẩu của tài khoản để đăng nhập.') } })
    } else {
      setError(t('Email này đăng nhập bằng Google. Hãy đăng nhập app bonbon rồi chọn Đăng ký trở thành người bán hàng trong Tài khoản.'))
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    if (!captchaToken) {
      setError(t('Vui lòng xác nhận bạn không phải robot.'))
      return
    }
    if (!terms.data?.id || !customerTerms.data?.id || !privacy.data?.id) return
    const { error: problem } = await api.POST('/api/auth/register', {
      body: {
        email: values.email,
        password: values.password,
        name: values.name,
        role: 'SELLER',
        acceptedDocumentIds: [terms.data.id, customerTerms.data.id, privacy.data.id],
        marketingConsent: values.marketing,
        captchaToken,
        alsoCustomer: true,
      },
    })
    if (problem) {
      if (problemCode(problem) === 'LEGAL_DOCUMENTS_CHANGED') {
        form.setValue('acceptTerms', false)
        await Promise.all([terms.refetch(), customerTerms.refetch(), privacy.refetch()])
      }
      setError(problemMessage(problem))
      return
    }
    setStep(3)
  })

  if (step === 1) {
    return (
      <AuthHero
        heading={t('Đăng ký')}
        eyebrow={t('bonbon dành cho người bán')}
        headline={t('Trở thành người bán')}
        headlineSoft={t('ngay hôm nay')}
        points={SELLER_POINTS}
        cardTitle={t('Đăng ký')}
        footer={
          <>
            {t('Bạn đã có tài khoản?')}{' '}
            <Link to={merchantPath('/login')} className="text-link font-medium">
              {t('Đăng nhập')}
            </Link>
          </>
        }
      >
        <form onSubmit={toStepTwo} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input id="email" type="email" autoComplete="email" placeholder="Email" className="h-11" aria-invalid={!!errors.email} {...form.register('email')} />
            {errors.email ? <p role="alert" className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <FormError message={error} />
          <Button type="submit" size="lg" disabled={email.trim().length === 0 || checking}>
            {t('Tiếp theo')}
          </Button>
        </form>
          <GoogleSignIn />
        <LegalNote action={t('đăng ký')} />
      </AuthHero>
    )
  }

  if (step === 3) return <SentStep email={email} />
  if (step === 'link') return <LinkAccountStep email={email.trim()} onBack={() => setStep(1)} />

  const longEnough = password.length >= 8 && password.length <= 100
  return (
    <AuthStepPage
      heading={t('Đăng ký')}
      steps={STEPS}
      current={2}
      title={t('Thiết lập tài khoản')}
      description={t('Bước cuối! Cho bonbon biết tên bạn và đặt mật khẩu cho {v0}.', { v0: email })}
      onBack={() => setStep(1)}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">{t('Họ tên')}</Label>
          <Input id="name" autoComplete="name" className="h-11" aria-invalid={!!errors.name} {...form.register('name')} />
          {errors.name ? <p role="alert" className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{t('Mật khẩu')}</Label>
          <PasswordInput id="password" autoComplete="new-password" className="h-11" aria-invalid={!!errors.password} {...form.register('password')} />
          <ul className="mt-1 flex flex-col gap-1 text-xs" aria-label={t('Yêu cầu mật khẩu')}>
            <li className={cn('flex items-center gap-1.5', longEnough ? 'text-success-fg' : 'text-muted-foreground')}>
              {longEnough ? <CheckIcon className="size-3.5" /> : <CircleIcon className="size-3.5" />}
              {t('Từ 8 đến 100 ký tự')}
            </li>
            <li className="flex items-center gap-1.5 text-muted-foreground">
              <CircleIcon className="size-3.5 opacity-0" />
              {t('Nên có cả chữ hoa, chữ thường và số')}
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...form.register('acceptTerms')} />
          <span>
            {t('Tôi đồng ý với')}{' '}
            <a href={legalUrl('SELLER_TERMS')} target="_blank" rel="noreferrer" className="text-link">
              {terms.data?.title ?? t('Điều khoản dành cho người bán')}
            </a>
            {', '}
            <a href={legalUrl('CUSTOMER_TERMS')} target="_blank" rel="noreferrer" className="text-link">
              {customerTerms.data?.title ?? t('Điều khoản sử dụng')}
            </a>{' '}
            {t('và đã đọc')}{' '}
            <a href={legalUrl('PRIVACY_POLICY')} target="_blank" rel="noreferrer" className="text-link">
              {privacy.data?.title ?? t('Chính sách quyền riêng tư')}
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms ? <p role="alert" className="text-sm text-destructive">{errors.acceptTerms.message}</p> : null}
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" {...form.register('marketing')} />
          {t('Nhận tin khuyến mãi và hướng dẫn bán hàng qua email (không bắt buộc).')}
        </label>

        <Captcha onToken={setCaptchaToken} />
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting || terms.isLoading || privacy.isLoading}>
          {form.formState.isSubmitting ? t('Đang tạo tài khoản…') : t('Đăng ký')}
        </Button>
      </form>
    </AuthStepPage>
  )
}

/** An email that already has a customer account: its password adds selling to that same account. */
function LinkAccountStep({ email, onBack }: { email: string; onBack: () => void }) {
  const navigate = useNavigate()
  const terms = useCurrentDocument('SELLER_TERMS')
  const privacy = useCurrentDocument('PRIVACY_POLICY')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!captchaToken) return setError(t('Vui lòng xác nhận bạn không phải robot.'))
    if (!terms.data?.id || !privacy.data?.id) return
    setBusy(true)
    const { error: problem } = await api.POST('/api/auth/register', {
      body: { email, password, role: 'SELLER', acceptedDocumentIds: [terms.data.id, privacy.data.id], captchaToken },
    })
    setBusy(false)
    if (problem) {
      setError(problemMessage(problem))
      return
    }
    navigate(merchantPath('/login'), { state: { email, notice: t('Đã thêm kênh bán hàng vào tài khoản của bạn. Đăng nhập để mở quán.') } })
  }

  return (
    <AuthStepPage
      heading={t('Đăng ký')}
      steps={STEPS}
      current={2}
      title={t('Email này đã có tài khoản bonbon')}
      description={t('Nhập mật khẩu của tài khoản {v0} để dùng chung tài khoản này cho việc bán hàng.', { v0: email })}
      onBack={onBack}
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="account-password">{t('Mật khẩu')}</Label>
          <PasswordInput id="account-password" autoComplete="current-password" className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>
            {t('Tôi đồng ý với')}{' '}
            <a href={legalUrl('SELLER_TERMS')} target="_blank" rel="noreferrer" className="text-link">
              {terms.data?.title ?? t('Điều khoản dành cho người bán')}
            </a>{' '}
            {t('và đã đọc')}{' '}
            <a href={legalUrl('PRIVACY_POLICY')} target="_blank" rel="noreferrer" className="text-link">
              {privacy.data?.title ?? t('Chính sách quyền riêng tư')}
            </a>
            .
          </span>
        </label>
        <Captcha onToken={setCaptchaToken} />
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={busy || password.length < 8 || !accepted}>
          {t('Thêm kênh bán hàng')}
        </Button>
      </form>
    </AuthStepPage>
  )
}

/** Step three: the link is on its way. The resend button waits a minute, like the code screens it replaces. */
function SentStep({ email }: { email: string }) {
  const navigate = useNavigate()
  const [wait, setWait] = useState(RESEND_SECONDS)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])

  const resend = async () => {
    setError(null)
    setNotice(null)
    const { error: problem } = await api.POST('/api/auth/resend-verification', { body: { email } })
    if (problem) {
      setError(problemMessage(problem))
      return
    }
    setNotice(t('Nếu tài khoản cần xác thực, chúng tôi đã gửi lại liên kết.'))
    setWait(RESEND_SECONDS)
  }

  return (
    <AuthStepPage
      heading={t('Đăng ký')}
      steps={STEPS}
      current={3}
      title={t('Kiểm tra hộp thư của bạn')}
      description={t('Chúng tôi đã gửi liên kết xác thực tới {v0}. Liên kết có hiệu lực 24 giờ.', { v0: email })}
    >
      <SuccessMark mascot="check-email" />
      <p className="text-center text-sm text-muted-foreground">{t('Mở email và bấm liên kết để hoàn tất đăng ký. Không thấy thư? Hãy xem cả mục thư rác.')}</p>
      {notice ? <FormSuccess message={notice} /> : null}
      <FormError message={error} />
      <Button type="button" variant="outline" size="lg" disabled={wait > 0} onClick={resend}>
        {wait > 0 ? t('Gửi lại sau {v0} giây', { v0: wait }) : t('Gửi lại email xác thực')}
      </Button>
      <Button type="button" size="lg" onClick={() => navigate(merchantPath('/login'))}>
        {t('Đến trang đăng nhập')}
      </Button>
    </AuthStepPage>
  )
}
