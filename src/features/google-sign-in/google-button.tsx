import { useEffect, useRef } from 'react'
import { env } from '@/shared/config/env'

type CredentialResponse = { credential: string }

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: CredentialResponse) => void; ux_mode?: 'popup' }) => void
          renderButton: (
            parent: HTMLElement,
            options: { type?: 'standard'; theme?: 'outline'; size?: 'large'; text?: 'continue_with'; shape?: 'pill'; width?: number; locale?: string },
          ) => void
        }
      }
    }
  }
}

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Google Identity Services failed to load'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

/** The official Google Identity Services button; hands the ID token (credential) to {@code onCredential}. */
export function GoogleButton({ onCredential }: { onCredential: (idToken: string) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const callback = useRef(onCredential)
  useEffect(() => {
    callback.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!env.googleClientId || !box.current) return
    const target = box.current
    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !window.google) return
        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          ux_mode: 'popup',
          callback: (response) => callback.current(response.credential),
        })
        target.replaceChildren()
        window.google.accounts.id.renderButton(target, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: Math.min(400, target.clientWidth || 320),
          locale: 'vi',
        })
      })
      .catch(() => {
        target.textContent = 'Không tải được nút đăng nhập Google.'
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!env.googleClientId) return null
  return <div ref={box} className="flex min-h-10 justify-center" />
}
