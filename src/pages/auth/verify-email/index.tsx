import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { AuthShell, FormError, FormSuccess } from '@/widgets/auth-shell'

/** Landing page of the emailed link; works for sellers and customers (customers then open the app). */
export function VerifyEmailPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const result = useQuery({
    queryKey: ['verify-email', token],
    enabled: token.length > 0,
    retry: false,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/auth/verify-email', { params: { query: { token } } })
      if (error || !data) throw error
      return data.status
    },
  })

  return (
    <AuthShell title="Xác thực email">
      {!token ? <FormError message="Liên kết thiếu mã xác thực." /> : null}
      {result.isPending && token ? <p className="text-sm text-muted-foreground">Đang xác thực…</p> : null}
      {result.data === 'VERIFIED' ? <FormSuccess message="Email đã được xác thực. Bạn có thể đăng nhập." /> : null}
      {result.data === 'ALREADY_VERIFIED' ? <FormSuccess message="Email này đã được xác thực trước đó." /> : null}
      {result.isError ? <FormError message={problemMessage(result.error)} /> : null}
      {result.data ? (
        <>
          <Button asChild>
            <Link to="/seller/login">Đăng nhập người bán</Link>
          </Button>
          <p className="text-sm text-muted-foreground">Khách hàng: mở ứng dụng bonbon trên điện thoại để đăng nhập.</p>
        </>
      ) : null}
      {result.isError || !token ? <ResendForm /> : null}
    </AuthShell>
  )
}

function ResendForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error: problem } = await api.POST('/api/auth/resend-verification', { body: { email } })
    if (problem) setError(problemMessage(problem))
    else setSent(true)
  }
  if (sent) return <FormSuccess message="Nếu tài khoản cần xác thực, chúng tôi đã gửi liên kết mới." />
  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Label htmlFor="resend-email">Gửi lại liên kết xác thực</Label>
      <Input id="resend-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <FormError message={error} />
      <Button type="submit" variant="outline">
        Gửi lại
      </Button>
    </form>
  )
}
