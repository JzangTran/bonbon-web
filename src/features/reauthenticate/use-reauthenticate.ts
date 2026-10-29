import { t } from '@/shared/i18n'
import { useCallback } from 'react'
import { useSession, type Role } from '@/entities/session'
import { api, problemCode, problemMessage } from '@/shared/api'

/** The stable codes a call answers with when the sign-in is older than the action allows. */
export function isReauthRequired(error: unknown): boolean {
  const code = problemCode(error)
  return code === 'REAUTH_REQUIRED' || code === 'REAUTHENTICATION_REQUIRED'
}

/**
 * Signs the current person in again with their password, which stamps a fresh sign-in time into the tokens. Resolves to null on
 * success, else the message to show. The same user and role keep their cached data.
 */
export function useReauthenticate() {
  const { session, signIn } = useSession()
  return useCallback(
    async (password: string): Promise<string | null> => {
      if (!session) return t('Phiên đăng nhập đã hết.')
      if (session.role === 'ADMIN') {
        const { data, error } = await api.POST('/api/admin/auth/login', { body: { email: session.email, password } })
        if (!data?.accessToken || !data.refreshToken || !data.userId) return problemMessage(error, t('Mật khẩu không đúng.'))
        signIn({ accessToken: data.accessToken, refreshToken: data.refreshToken, userId: data.userId, email: data.email ?? session.email, name: data.name ?? session.name, role: 'ADMIN' })
        return null
      }
      const { data, error } = await api.POST('/api/auth/login', { body: { email: session.email, password } })
      if (!data) return problemMessage(error, t('Mật khẩu không đúng.'))
      let login = data
      if (data.needsRoleSelection && data.roleToken) {
        const { data: picked, error: pickError } = await api.POST('/api/auth/select-role', { body: { role: session.role, roleToken: data.roleToken } })
        if (!picked) return problemMessage(pickError as unknown)
        login = picked
      }
      const tokens = login.tokens
      if (!tokens?.accessToken || !tokens.refreshToken || !login.user?.id) return t('Không đăng nhập lại được, hãy thử lại.')
      signIn({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userId: login.user.id,
        email: login.user.email ?? session.email,
        name: login.user.name ?? session.name,
        role: session.role as Role,
        availableRoles: (login.user.availableRoles ?? session.availableRoles) as Role[],
      })
      return null
    },
    [session, signIn],
  )
}
