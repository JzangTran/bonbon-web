import { createContext } from 'react'
import type { components } from '@/shared/api'

export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN'

type TokenResponse = components['schemas']['TokenResponse']

export type Session = {
  userId: string
  email: string
  name: string
  role: Role
  availableRoles: Role[]
  permissions: ReadonlySet<string>
  accessToken: string
  refreshToken: string
}

export type SignInInput = {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
  name: string
  role: Role
  availableRoles?: Role[]
}

export type SessionContextValue = {
  session: Session | null
  signIn: (input: SignInInput) => void
  signOut: () => Promise<void>
}

export const SessionContext = createContext<SessionContextValue | null>(null)

const STORAGE_KEY = 'bonbon.web.session'

/** Permissions are read from the access token's `permissions` claim (for showing/hiding UI only). */
export function permissionsOf(accessToken: string): Set<string> {
  try {
    const payload = accessToken.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json) as { permissions?: string[] }
    return new Set(claims.permissions ?? [])
  } catch {
    return new Set()
  }
}

export function toSession(input: SignInInput): Session {
  return {
    userId: input.userId,
    email: input.email,
    name: input.name,
    role: input.role,
    availableRoles: input.availableRoles ?? [input.role],
    permissions: permissionsOf(input.accessToken),
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
  }
}

export function withTokens(session: Session, tokens: TokenResponse): Session {
  return {
    ...session,
    accessToken: tokens.accessToken ?? session.accessToken,
    refreshToken: tokens.refreshToken ?? session.refreshToken,
    permissions: permissionsOf(tokens.accessToken ?? session.accessToken),
  }
}

/**
 * Kept in localStorage so a reload stays signed in. The refresh token is therefore readable by scripts on
 * this origin; the backend limits the damage (7-day life, rotation, reuse detection revokes the family).
 */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw) as Omit<Session, 'permissions'>
    return { ...stored, permissions: permissionsOf(stored.accessToken) }
  } catch {
    return null
  }
}

export function saveSession(session: Session | null) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  const { permissions: _ignored, ...rest } = session
  void _ignored
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
}
