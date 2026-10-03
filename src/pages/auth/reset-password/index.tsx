import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AuthShell, FormError, FormSuccess } from '@/widgets/auth-shell'

const schema = z
  .object({
    newPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100, 'Tối đa 100 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Mật khẩu nhập lại không khớp' })
type Values = z.infer<typeof schema>

/**
 * Sets a password from an emailed link: `mode="reset"` (forgot password) or `mode="initial"` (a new
 * administrator's first password). Either way every existing session ends.
 */
export function SetPasswordPage({ mode }: { mode: 'reset' | 'initial' }) {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { newPassword: '', confirmPassword: '' } })
  const errors = form.formState.errors

  const onSubmit = form.handleSubmit(async ({ newPassword }) => {
    setError(null)
    const path = mode === 'reset' ? '/api/auth/reset-password' : '/api/auth/set-initial-password'
    const { error: problem } = await api.POST(path, { body: { token, newPassword } })
    if (problem) setError(problemMessage(problem))
    else setDone(true)
  })

  const loginPath = mode === 'initial' ? '/admin/login' : '/seller/login'
  return (
    <AuthShell title={mode === 'reset' ? 'Đặt lại mật khẩu' : 'Đặt mật khẩu quản trị'}>
      {done ? (
        <>
          <FormSuccess message="Đã đặt mật khẩu mới. Mọi phiên đăng nhập cũ đã được đăng xuất." />
          <Button asChild>
            <Link to={loginPath}>Đăng nhập</Link>
          </Button>
        </>
      ) : !token ? (
        <FormError message="Liên kết thiếu mã. Hãy yêu cầu liên kết mới." />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...form.register('newPassword')} />
            {errors.newPassword ? <p className="text-sm text-destructive">{errors.newPassword.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...form.register('confirmPassword')} />
            {errors.confirmPassword ? <p className="text-sm text-destructive">{errors.confirmPassword.message}</p> : null}
          </div>
          <FormError message={error} />
          <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
            Lưu mật khẩu
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
