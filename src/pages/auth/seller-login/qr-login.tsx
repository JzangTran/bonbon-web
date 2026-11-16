import QRCode from 'qrcode'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api, problemCode, problemMessage, type components } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { t } from '@/shared/i18n'

type LoginResponse = components['schemas']['LoginResponse']
type State = components['schemas']['Status']['state']
type Session = { sessionId: string; pollToken: string; image: string; expiresAt: number }

const POLL_MS = 2000

/**
 * "Đăng nhập bằng mã QR" (login-qr-code.md): the page shows a code, the seller scans it with the bonbon app they are already signed in
 * to and confirms there. Only this browser holds the poll token, so the code on screen is not enough to take the sign-in.
 */
export function QrLogin({ onSignedIn }: { onSignedIn: (data: LoginResponse) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button type="button" variant="outline" size="lg" onClick={() => setOpen(true)}>
        <QrGlyph />
        {t('Đăng nhập bằng mã QR')}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('Đăng nhập bằng mã QR')}</DialogTitle>
            <DialogDescription>
              {t('Mở ứng dụng bonbon trên điện thoại (đã đăng nhập tài khoản người bán), vào Tài khoản, chọn Quét mã đăng nhập web rồi hướng camera vào mã này.')}
            </DialogDescription>
          </DialogHeader>
          {open ? <QrPanel onSignedIn={onSignedIn} /> : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function QrPanel({ onSignedIn }: { onSignedIn: (data: LoginResponse) => void }) {
  const [session, setSession] = useState<Session | null>(null)
  const [state, setState] = useState<State | 'LOADING'>('LOADING')
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const exchanging = useRef(false)

  const start = useCallback(async () => {
    setError(null)
    setState('LOADING')
    exchanging.current = false
    const { data, error: problem } = await api.POST('/api/auth/qr-login/start')
    if (!data?.sessionId || !data.pollToken || !data.qrContent) {
      setError(problemCode(problem) === 'RATE_LIMITED' ? problemMessage(problem) : t('Không tạo được mã. Vui lòng thử lại.'))
      setState('EXPIRED')
      return
    }
    const image = await QRCode.toDataURL(data.qrContent, { width: 480, margin: 1, errorCorrectionLevel: 'M', color: { dark: '#1D1D1D', light: '#FFFFFF' } })
    const issuedAt = Date.now()
    setNow(issuedAt)
    setSession({ sessionId: data.sessionId, pollToken: data.pollToken, image, expiresAt: issuedAt + (data.expiresInSeconds ?? 180) * 1000 })
    setState('PENDING')
  }, [])

  const firstStarted = useRef(false)
  useEffect(() => {
    // the first code is asked for as soon as the dialog opens, once (StrictMode runs effects twice in development)
    if (firstStarted.current) return
    firstStarted.current = true
    void start()
  }, [start])

  useEffect(() => {
    if (!session || (state !== 'PENDING' && state !== 'SCANNED')) return
    const timer = window.setInterval(async () => {
      setNow(Date.now())
      if (Date.now() >= session.expiresAt) {
        setState('EXPIRED')
        return
      }
      const body = { sessionId: session.sessionId, pollToken: session.pollToken }
      const { data } = await api.POST('/api/auth/qr-login/status', { body })
      const next = data?.state
      if (!next) return
      if (next === 'CONFIRMED') {
        if (exchanging.current) return
        exchanging.current = true
        const { data: signedIn, error: problem } = await api.POST('/api/auth/qr-login/exchange', { body })
        if (signedIn?.tokens?.accessToken) {
          onSignedIn(signedIn)
          return
        }
        setError(problemMessage(problem))
        setState('EXPIRED')
        return
      }
      setState(next)
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [session, state, onSignedIn])

  const secondsLeft = session ? Math.max(0, Math.ceil((session.expiresAt - now) / 1000)) : 0
  const faded = state !== 'PENDING' && state !== 'SCANNED'

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative grid size-60 place-items-center rounded-md border bg-white p-2">
        {session ? (
          <img src={session.image} alt={t('Mã QR đăng nhập')} className={faded ? 'size-full opacity-15' : 'size-full'} />
        ) : (
          <span className="text-sm text-muted-foreground">{t('Đang tạo mã…')}</span>
        )}
        {state === 'SCANNED' ? (
          <span className="absolute inset-x-4 rounded-md bg-background/95 p-3 text-center text-sm font-medium shadow">
            {t('Đã quét. Hãy xác nhận trên điện thoại.')}
          </span>
        ) : null}
      </div>
      <p role="status" aria-live="polite" className="min-h-5 text-center text-sm text-muted-foreground">
        {error ??
          (state === 'PENDING'
            ? t('Mã hết hạn sau {s} giây', { s: secondsLeft })
            : state === 'REJECTED'
              ? t('Yêu cầu đăng nhập đã bị từ chối trên điện thoại.')
              : state === 'EXPIRED'
                ? t('Mã đã hết hạn.')
                : '')}
      </p>
      {state === 'EXPIRED' || state === 'REJECTED' ? (
        <Button type="button" onClick={() => void start()}>
          {t('Tạo mã mới')}
        </Button>
      ) : null}
    </div>
  )
}

function QrGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M21 14v7h-4M14 18v3" />
    </svg>
  )
}
