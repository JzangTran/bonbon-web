import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession, type Role } from '@/entities/session'
import { api, isApiProblem, problemCode, problemMessage, type components } from '@/shared/api'
import { env } from '@/shared/config/env'
import { Button } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FormError } from '@/widgets/auth-shell'
import { GoogleButton } from './google-button'

type LoginResponse = components['schemas']['LoginResponse']
type Extras = { acceptedDocumentIds?: string[]; marketingConsent?: boolean; password?: string; captchaToken?: string }
/** What the backend asked for before Google can sign the seller in (login-oauth.md). */
type Step = { kind: 'idle' } | { kind: 'consent'; email?: string } | { kind: 'password'; captcha: boolean } | { kind: 'blocked'; message: string }

function useDocument(type: 'SELLER_TERMS' | 'PRIVACY_POLICY', enabled: boolean) {
  return useQuery({
    queryKey: ['legal-document', type],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/legal/documents/{type}', { params: { path: { type } } })
      if (error || !data) throw error
      return data
    },
  })
}

/**
 * "Continue with Google" for sellers. The web app is for sellers only, so every request asks for the SELLER role:
 * a new Google identity is created as a seller after consent, a customer-only one gets the seller role after
 * accepting the seller terms, and an existing email/password account is linked once its password is given.
 */
export function GoogleSignIn() {
  const { signIn } = useSession()
  const navigate = useNavigate()
  const [idToken, setIdToken] = useState<string | null>(null)
  const [step, setStep] = useState<Step>({ kind: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const terms = useDocument('SELLER_TERMS', step.kind === 'consent')
  const privacy = useDocument('PRIVACY_POLICY', step.kind === 'consent')

  if (!env.googleClientId) return null

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
    navigate('/seller', { replace: true })
  }

  const submit = async (token: string, extras: Extras = {}) => {
    setError(null)
    setBusy(true)
    const { data, error: problem } = await api.POST('/api/auth/login/oauth', {
      body: { provider: 'GOOGLE', token, role: 'SELLER', ...extras },
    })
    setBusy(false)
    if (data) {
      finish(data)
      return
    }
    const code = problemCode(problem)
    const linkMethod = isApiProblem(problem) ? (problem as { linkMethod?: string }).linkMethod : undefined
    if (code === 'OAUTH_SIGNUP_REQUIRED' || code === 'CONSENT_REQUIRED') {
      setStep({ kind: 'consent', email: isApiProblem(problem) ? (problem as { email?: string }).email : undefined })
      if (code === 'CONSENT_REQUIRED' && step.kind === 'consent') setError(problemMessage(problem))
      return
    }
    if (code === 'ACCOUNT_EXISTS_LINK_REQUIRED' && linkMethod === 'PASSWORD') {
      setStep({ kind: 'password', captcha: false })
      return
    }
    if (code === 'CAPTCHA_REQUIRED') {
      setStep({ kind: 'password', captcha: true })
      setError(problemMessage(problem))
      return
    }
    if (code === 'ACCOUNT_EXISTS_LINK_REQUIRED' || code === 'OAUTH_EMAIL_UNVERIFIED' || code === 'LEGAL_DOCUMENTS_CHANGED') {
      setStep({ kind: 'blocked', message: problemMessage(problem) })
      return
    }
    setError(problemMessage(problem))
  }

  const onCredential = (token: string) => {
    setIdToken(token)
    setStep({ kind: 'idle' })
    void submit(token)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        hoặc
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton onCredential={onCredential} />

      {step.kind === 'consent' && idToken ? (
        <div className="flex flex-col gap-3 rounded-lg border p-4">
          <p className="text-sm font-medium">
            {step.email ? `Mở tài khoản bán hàng cho ${step.email}` : 'Thêm vai trò người bán vào tài khoản Google này'}
          </p>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 size-4" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span>
              Tôi đồng ý với{' '}
              <Link to="/legal/SELLER_TERMS" target="_blank" className="text-primary underline">
                {terms.data?.title ?? 'Điều khoản dành cho người bán'}
              </Link>{' '}
              và đã đọc{' '}
              <Link to="/legal/PRIVACY_POLICY" target="_blank" className="text-primary underline">
                {privacy.data?.title ?? 'Chính sách quyền riêng tư'}
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" className="mt-0.5 size-4" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            Nhận tin khuyến mãi qua email (không bắt buộc).
          </label>
          <Button
            type="button"
            disabled={!acceptTerms || busy || !terms.data?.id || !privacy.data?.id}
            onClick={() => submit(idToken, { acceptedDocumentIds: [terms.data!.id!, privacy.data!.id!], marketingConsent: marketing })}
          >
            Tiếp tục với Google
          </Button>
        </div>
      ) : null}

      {step.kind === 'password' && idToken ? (
        <form
          className="flex flex-col gap-3 rounded-lg border p-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submit(idToken, { password, captchaToken: captchaToken ?? undefined })
          }}
        >
          <p className="text-sm">Email này đã có tài khoản bonbon. Nhập mật khẩu của tài khoản đó để liên kết với Google.</p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="link-password">Mật khẩu bonbon</Label>
            <Input id="link-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {step.captcha ? <Captcha onToken={setCaptchaToken} /> : null}
          <Button type="submit" disabled={!password || busy}>
            Liên kết và đăng nhập
          </Button>
        </form>
      ) : null}

      {step.kind === 'blocked' ? <FormError message={step.message} /> : null}
      <FormError message={error} />
    </div>
  )
}
