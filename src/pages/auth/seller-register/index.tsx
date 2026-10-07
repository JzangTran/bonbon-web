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

const schema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100, 'Tối đa 100 ký tự'),
  email: z.email('Email không hợp lệ').max(255),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100, 'Tối đa 100 ký tự'),
  acceptTerms: z.boolean().refine((v) => v, 'Bạn cần đồng ý để tiếp tục'),
  marketing: z.boolean(),
})
type Values = z.infer<typeof schema>

const STEPS = [{ label: 'Nhập email' }, { label: 'Tạo mật khẩu' }, { label: 'Xác thực email' }]
const RESEND_SECONDS = 60

function useCurrentDocument(type: 'SELLER_TERMS' | 'PRIVACY_POLICY') {
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
 * Seller sign-up in three steps: the email on the entry card, then name and password, then "check your mailbox".
 * The account is created in one call at the end of step 2; the email link finishes it.
 */
export function SellerRegisterPage() {
  const terms = useCurrentDocument('SELLER_TERMS')
  const privacy = useCurrentDocument('PRIVACY_POLICY')
  const [step, setStep] = useState<1 | 2 | 3>(1)
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
    if (await form.trigger('email')) setStep(2)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null)
    if (!captchaToken) {
      setError('Vui lòng xác nhận bạn không phải robot.')
      return
    }
    if (!terms.data?.id || !privacy.data?.id) return
    const { error: problem } = await api.POST('/api/auth/register', {
      body: {
        email: values.email,
        password: values.password,
        name: values.name,
        role: 'SELLER',
        acceptedDocumentIds: [terms.data.id, privacy.data.id],
        marketingConsent: values.marketing,
        captchaToken,
      },
    })
    if (problem) {
      if (problemCode(problem) === 'LEGAL_DOCUMENTS_CHANGED') {
        form.setValue('acceptTerms', false)
        await Promise.all([terms.refetch(), privacy.refetch()])
      }
      setError(problemMessage(problem))
      return
    }
    setStep(3)
  })

  if (step === 1) {
    return (
      <AuthHero
        heading="Đăng ký"
        eyebrow="bonbon dành cho người bán"
        headline="Trở thành người bán ngay hôm nay"
        points={SELLER_POINTS}
        cardTitle="Đăng ký"
        footer={
          <>
            Bạn đã có tài khoản?{' '}
            <Link to="/seller/login" className="font-medium text-primary hover:underline">
              Đăng nhập
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
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <Button type="submit" size="lg" className="uppercase tracking-wide" disabled={email.trim().length === 0}>
            Tiếp theo
          </Button>
        </form>
          <GoogleSignIn />
        <LegalNote action="đăng ký" />
      </AuthHero>
    )
  }

  if (step === 3) return <SentStep email={email} />

  const longEnough = password.length >= 8 && password.length <= 100
  return (
    <AuthStepPage
      heading="Đăng ký"
      steps={STEPS}
      current={2}
      title="Thiết lập tài khoản"
      description={`Bước cuối! Cho bonbon biết tên bạn và đặt mật khẩu cho ${email}.`}
      onBack={() => setStep(1)}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Họ tên</Label>
          <Input id="name" autoComplete="name" className="h-11" aria-invalid={!!errors.name} {...form.register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Mật khẩu</Label>
          <PasswordInput id="password" autoComplete="new-password" className="h-11" aria-invalid={!!errors.password} {...form.register('password')} />
          <ul className="mt-1 flex flex-col gap-1 text-xs" aria-label="Yêu cầu mật khẩu">
            <li className={cn('flex items-center gap-1.5', longEnough ? 'text-success-fg' : 'text-muted-foreground')}>
              {longEnough ? <CheckIcon className="size-3.5" /> : <CircleIcon className="size-3.5" />}
              Từ 8 đến 100 ký tự
            </li>
            <li className="flex items-center gap-1.5 text-muted-foreground">
              <CircleIcon className="size-3.5 opacity-0" />
              Nên có cả chữ hoa, chữ thường và số
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...form.register('acceptTerms')} />
          <span>
            Tôi đồng ý với{' '}
            <a href="/legal/SELLER_TERMS" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {terms.data?.title ?? 'Điều khoản dành cho người bán'}
            </a>{' '}
            và đã đọc{' '}
            <a href="/legal/PRIVACY_POLICY" target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {privacy.data?.title ?? 'Chính sách quyền riêng tư'}
            </a>
            .
          </span>
        </label>
        {errors.acceptTerms ? <p className="text-sm text-destructive">{errors.acceptTerms.message}</p> : null}
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1" {...form.register('marketing')} />
          Nhận tin khuyến mãi và hướng dẫn bán hàng qua email (không bắt buộc).
        </label>

        <Captcha onToken={setCaptchaToken} />
        <FormError message={error} />
        <Button type="submit" size="lg" className="uppercase tracking-wide" disabled={form.formState.isSubmitting || terms.isLoading || privacy.isLoading}>
          {form.formState.isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
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
    setNotice('Nếu tài khoản cần xác thực, chúng tôi đã gửi lại liên kết.')
    setWait(RESEND_SECONDS)
  }

  return (
    <AuthStepPage
      heading="Đăng ký"
      steps={STEPS}
      current={3}
      title="Kiểm tra hộp thư của bạn"
      description={`Chúng tôi đã gửi liên kết xác thực tới ${email}. Liên kết có hiệu lực 24 giờ.`}
    >
      <SuccessMark />
      <p className="text-center text-sm text-muted-foreground">Mở email và bấm liên kết để hoàn tất đăng ký. Không thấy thư? Hãy xem cả mục thư rác.</p>
      {notice ? <FormSuccess message={notice} /> : null}
      <FormError message={error} />
      <Button type="button" variant="outline" size="lg" disabled={wait > 0} onClick={resend}>
        {wait > 0 ? `Gửi lại sau ${wait} giây` : 'Gửi lại email xác thực'}
      </Button>
      <Button type="button" size="lg" className="uppercase tracking-wide" onClick={() => navigate('/seller/login')}>
        Đến trang đăng nhập
      </Button>
    </AuthStepPage>
  )
}
