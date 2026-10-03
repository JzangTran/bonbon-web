import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, setAuthHandlers } from '@/shared/api'
import { loadSession, saveSession, SessionContext, toSession, withTokens, type Session, type SignInInput } from './model'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession)
  const current = useRef(session)

  const update = useCallback((next: Session | null) => {
    current.current = next
    saveSession(next)
    setSession(next)
  }, [])

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => current.current?.accessToken ?? null,
      refresh: async () => {
        const refreshToken = current.current?.refreshToken
        if (!refreshToken) return null
        const { data, response } = await api.POST('/api/auth/refresh', { body: { refreshToken } })
        if (!response.ok || !data?.accessToken || !current.current) {
          update(null)
          return null
        }
        update(withTokens(current.current, data))
        return data.accessToken
      },
    })
  }, [update])

  const signIn = useCallback((input: SignInInput) => update(toSession(input)), [update])

  const signOut = useCallback(async () => {
    const refreshToken = current.current?.refreshToken
    if (current.current) {
      await api.POST('/api/auth/logout', { body: { refreshToken } }).catch(() => undefined)
    }
    update(null)
  }, [update])

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut])
  return <SessionContext value={value}>{children}</SessionContext>
}
