import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useSession } from '@/entities/session'
import { api, problemCode, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AuthShell, FormError } from '@/widgets/auth-shell'

export function AdminLoginPage() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [needsCaptcha, setNeedsCaptcha] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { data, error: problem } = await api.POST('/api/admin/auth/login', {
      body: { email, password, captchaToken: captchaToken ?? undefined },
    })
    setSubmitting(false)
    if (problem || !data?.accessToken || !data.refreshToken || !data.userId) {
      if (problemCode(problem) === 'CAPTCHA_REQUIRED') setNeedsCaptcha(true)
      setError(problemMessage(problem))
      return
    }
    signIn({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      userId: data.userId,
      email: data.email ?? email,
      name: data.name ?? '',
      role: 'ADMIN',
    })
    const from = (location.state as { from?: string } | null)?.from
    navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true })
  }

  return (
    <AuthShell title="Đăng nhập quản trị" description="Chỉ dành cho quản trị viên bonbon.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="admin-email">Email</Label>
          <Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="admin-password">Mật khẩu</Label>
          <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {needsCaptcha ? <Captcha onToken={setCaptchaToken} /> : null}
        <FormError message={error} />
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
      </form>
    </AuthShell>
  )
}
