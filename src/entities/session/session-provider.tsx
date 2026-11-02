import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, setAuthHandlers } from '@/shared/api'
import {
  forgetLegacySession,
  hasSignInHint,
  SessionContext,
  setSignInHint,
  SIGN_IN_HINT_KEY,
  toSession,
  type Role,
  type Session,
  type SessionStatus,
  type SignInInput,
} from './model'

type Renewed = { kind: 'ok'; session: Session } | { kind: 'over' } | { kind: 'offline' }

/**
 * Asks the server for a new access token with the refresh-token cookie. Tabs take turns (Web Locks): the cookie is shared and every
 * refresh rotates it, so two tabs presenting the same one at once would look like a stolen token and end the session everywhere.
 */
async function renew(): Promise<Renewed> {
  const call = async (): Promise<Renewed> => {
    try {
      const { data, response } = await api.POST('/api/auth/refresh', {})
      if (!response.ok || !data?.accessToken || !data.user) return response.status >= 500 ? { kind: 'offline' } : { kind: 'over' }
      const u = data.user
      return {
        kind: 'ok',
        session: toSession({
          accessToken: data.accessToken,
          userId: u.id ?? '',
          email: u.email ?? '',
          name: u.name ?? '',
          role: (u.activeRole ?? data.role) as Role,
          availableRoles: (u.availableRoles ?? []) as Role[],
        }),
      }
    } catch {
      // the server could not be reached at all
      return { kind: 'offline' }
    }
  }
  return typeof navigator !== 'undefined' && navigator.locks ? navigator.locks.request('bonbon-refresh', call) : call()
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<SessionStatus>(() => (hasSignInHint() ? 'restoring' : 'ready'))
  const current = useRef<Session | null>(null)
  const queryClient = useQueryClient()

  const update = useCallback(
    (next: Session | null) => {
      const previous = current.current
      current.current = next
      setSignInHint(!!next)
      // Cached server data belongs to whoever fetched it: another user or role must never see it.
      // New tokens for the same user and role (refresh, password change) keep the cache.
      if (previous?.userId !== next?.userId || previous?.role !== next?.role) {
        queryClient.clear()
      }
      setSession(next)
    },
    [queryClient],
  )

  const settle = useCallback(
    (r: Renewed) => {
      if (r.kind === 'ok') update(r.session)
      else if (r.kind === 'over') update(null)
      setStatus(r.kind === 'offline' ? 'offline' : 'ready')
    },
    [update],
  )

  // a page load: rebuild the session from the cookie, if someone signed in here before (status starts as restoring then)
  useEffect(() => {
    forgetLegacySession()
    if (hasSignInHint()) void renew().then(settle)
  }, [settle])

  // signing out in one tab signs out the others
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SIGN_IN_HINT_KEY && e.newValue === null && current.current) update(null)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [update])

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => current.current?.accessToken ?? null,
      refresh: async () => {
        if (!current.current) return null
        const r = await renew()
        if (r.kind === 'ok') {
          update(r.session)
          return r.session.accessToken
        }
        if (r.kind === 'over') update(null)
        else setStatus('offline')
        return null
      },
    })
  }, [update])

  const signIn = useCallback(
    (input: SignInInput) => {
      update(toSession(input))
      setStatus('ready')
    },
    [update],
  )

  const signOut = useCallback(async () => {
    // the server revokes the refresh token and clears its cookie, even when the access token has already expired
    await api.POST('/api/auth/logout', {}).catch(() => undefined)
    update(null)
  }, [update])

  const retry = useCallback(() => {
    setStatus('restoring')
    void renew().then(settle)
  }, [settle])

  const value = useMemo(() => ({ session, status, signIn, signOut, retry }), [session, status, signIn, signOut, retry])
  return <SessionContext value={value}>{children}</SessionContext>
}
