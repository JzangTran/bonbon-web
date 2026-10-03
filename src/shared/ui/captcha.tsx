import { useEffect, useRef } from 'react'
import { env } from '@/shared/config/env'

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void }) => number
      reset: (id?: number) => void
    }
    onBonbonRecaptchaLoad?: () => void
  }
}

const SCRIPT_ID = 'recaptcha-script'

/**
 * reCAPTCHA v2 checkbox, shown only when the backend asks for it (CAPTCHA_REQUIRED) or on forms that always
 * need it. Without VITE_RECAPTCHA_SITE_KEY a development stand-in is rendered instead.
 */
export function Captcha({ onToken }: { onToken: (token: string | null) => void }) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!env.recaptchaSiteKey || !box.current) return
    const target = box.current
    const render = () => {
      if (!window.grecaptcha || target.childElementCount > 0) return
      window.grecaptcha.render(target, {
        sitekey: env.recaptchaSiteKey,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(null),
      })
    }
    if (window.grecaptcha) {
      render()
      return
    }
    window.onBonbonRecaptchaLoad = render
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onBonbonRecaptchaLoad&render=explicit&hl=vi'
      script.async = true
      document.head.appendChild(script)
    }
  }, [onToken])

  if (!env.recaptchaSiteKey) {
    return (
      <label className="flex items-center gap-2 rounded-md border border-dashed border-input p-3 text-sm">
        <input type="checkbox" onChange={(e) => onToken(e.target.checked ? 'dev-captcha' : null)} />
        Tôi không phải robot <span className="text-muted-foreground">(bản dev, chưa cấu hình reCAPTCHA)</span>
      </label>
    )
  }
  return <div ref={box} />
}
