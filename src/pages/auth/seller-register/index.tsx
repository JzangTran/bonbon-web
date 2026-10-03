import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { z } from 'zod'
import { GoogleSignIn } from '@/features/google-sign-in'
import { api, problemCode, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AuthShell, FormError, FormSuccess } from '@/widgets/auth-shell'

const schema = z
  .object({
    name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100, 'Tối đa 100 ký tự'),
    email: z.email('Email không hợp lệ').max(255),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100, 'Tối đa 100 ký tự'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, 'Bạn cần đồng ý để tiếp tục'),
    marketing: z.boolean(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Mật khẩu nhập lại không khớp' })
type Values = z.infer<typeof schema>

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

export function SellerRegisterPage() {
  const terms = useCurrentDocument('SELLER_TERMS')
  const privacy = useCurrentDocument('PRIVACY_POLICY')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [doneFor, setDoneFor] = useState<string | null>(null)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', acceptTerms: false, marketing: false },
  })
  const errors = form.formState.errors

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
    setDoneFor(values.email)
  })

  if (doneFor) {
    return (
      <AuthShell title="Kiểm tra hộp thư của bạn">
        <FormSuccess message={`Chúng tôi đã gửi liên kết xác thực tới ${doneFor}. Liên kết có hiệu lực 24 giờ.`} />
        <Button asChild variant="outline">
          <Link to="/seller/login">Về trang đăng nhập</Link>
        </Button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Đăng ký bán hàng"
      description="Tạo tài khoản người bán. Sau khi xác thực email, bạn có thể mở cửa hàng."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/seller/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field id="name" label="Họ tên" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...form.register('name')} />
        </Field>
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...form.register('email')} />
        </Field>
        <Field id="password" label="Mật khẩu" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...form.register('password')} />
        </Field>
        <Field id="confirmPassword" label="Nhập lại mật khẩu" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...form.register('confirmPassword')} />
        </Field>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...form.register('acceptTerms')} />
          <span>
            Tôi đồng ý với{' '}
            <a href={`/legal/SELLER_TERMS`} target="_blank" rel="noreferrer" className="text-primary underline">
              {terms.data?.title ?? 'Điều khoản dành cho người bán'}
            </a>{' '}
            và đã đọc{' '}
            <a href={`/legal/PRIVACY_POLICY`} target="_blank" rel="noreferrer" className="text-primary underline">
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
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting || terms.isLoading || privacy.isLoading}>
          {form.formState.isSubmitting ? 'Đang tạo tài khoản…' : 'Đăng ký'}
        </Button>
      </form>
      <GoogleSignIn />
    </AuthShell>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
