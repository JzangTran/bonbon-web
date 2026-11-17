import { createContext } from 'react'

export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'DEVELOPER'

/** A main account or member session (seller-team): who signed in, the shop open now (null = team console) and the shops to switch to. */
export type TeamSession = {
  kind: 'MAIN_ACCOUNT' | 'MEMBER'
  login: string
  displayName: string
  shopId: string | null
  shopName: string | null
  shops: { vendorId: string; name: string; status: string }[]
}

/** Who is signed in. Lives in memory only: the access token is short-lived and the refresh token is in an HttpOnly cookie. */
export type Session = {
  /** Only for a main account or member. */
  team?: TeamSession
  userId: string
  email: string
  name: string
  role: Role
  availableRoles: Role[]
  permissions: ReadonlySet<string>
  accessToken: string
}

export type SignInInput = {
  team?: TeamSession
  accessToken: string
  userId: string
  email: string
  name: string
  role: Role
  availableRoles?: Role[]
}

/**
 * `restoring`: the page just loaded and is asking the server (with the cookie) whether someone is signed in.
 * `offline`: that question could not reach the server; pages that need a session say so instead of sending people to sign in.
 */
export type SessionStatus = 'restoring' | 'ready' | 'offline'

export type SessionContextValue = {
  session: Session | null
  status: SessionStatus
  signIn: (input: SignInInput) => void
  signOut: () => Promise<void>
  /** Asks the server again after `offline`. */
  retry: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)

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
    team: input.team,
  }
}

/** The `team` part of a server user summary, as the session keeps it. */
export function teamOf(raw: unknown): TeamSession | undefined {
  const t = raw as Partial<TeamSession> & { shops?: { vendorId?: string; name?: string; status?: string }[] } | null | undefined
  if (!t?.kind) return undefined
  return {
    kind: t.kind,
    login: t.login ?? '',
    displayName: t.displayName ?? '',
    shopId: t.shopId ?? null,
    shopName: t.shopName ?? null,
    shops: (t.shops ?? []).map((s) => ({ vendorId: s.vendorId ?? '', name: s.name ?? '', status: s.status ?? '' })),
  }
}

/**
 * Nothing about the person is stored in the browser. The only thing kept is a flag saying "someone signed in here", so a page load
 * knows whether to ask the server (anonymous visitors make no call), and so the other tabs hear about a sign-out.
 */
const HINT_KEY = 'bonbon.web.signedIn'

export function hasSignInHint(): boolean {
  try {
    return localStorage.getItem(HINT_KEY) === '1'
  } catch {
    return false
  }
}

export function setSignInHint(on: boolean) {
  try {
    if (on) localStorage.setItem(HINT_KEY, '1')
    else localStorage.removeItem(HINT_KEY)
  } catch {
    // storage blocked: every load will simply ask the server
  }
}

export const SIGN_IN_HINT_KEY = HINT_KEY

/** Before this change the whole session (tokens, email, name) sat in localStorage: remove it wherever it is still there. */
export function forgetLegacySession() {
  try {
    localStorage.removeItem('bonbon.web.session')
  } catch {
    // nothing to forget
  }
}
