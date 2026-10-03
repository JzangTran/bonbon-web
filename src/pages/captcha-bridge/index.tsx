import { useCallback, useState } from 'react'
import { Captcha } from '@/shared/ui/captcha'

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void }
  }
}

/**
 * Opened inside the mobile app's WebView: reCAPTCHA only runs on a domain registered for the site key, so the
 * app solves it here and receives the token through postMessage. The token goes only to the hosting WebView,
 * never to another window.
 */
export function CaptchaBridgePage() {
  const [solved, setSolved] = useState(false)
  const onToken = useCallback((token: string | null) => {
    if (!token) {
      setSolved(false)
      return
    }
    setSolved(true)
    window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'bonbon-captcha', token }))
  }, [])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-sm text-muted-foreground">Đánh dấu ô bên dưới để xác minh bạn không phải robot.</p>
      <Captcha onToken={onToken} />
      {solved ? <p className="text-sm text-success-fg">Đã xác minh, đang quay lại ứng dụng…</p> : null}
    </main>
  )
}
