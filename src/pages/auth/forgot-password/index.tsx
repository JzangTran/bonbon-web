import { useState } from 'react'
import { Link } from 'react-router'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AuthShell, FormError, FormSuccess } from '@/widgets/auth-shell'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: problem } = await api.POST('/api/auth/forgot-password', { body: { email } })
    setSubmitting(false)
    if (problem) setError(problemMessage(problem))
    else setSent(true)
  }

  return (
    <AuthShell
      title="Quên mật khẩu"
      description="Nhập email đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu (hiệu lực 1 giờ)."
      footer={<Link to="/seller/login" className="text-primary underline-offset-4 hover:underline">Về trang đăng nhập</Link>}
    >
      {sent ? (
        <FormSuccess message="Nếu email này có tài khoản, chúng tôi đã gửi liên kết đặt lại mật khẩu." />
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" size="lg" disabled={submitting}>
            Gửi liên kết
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
