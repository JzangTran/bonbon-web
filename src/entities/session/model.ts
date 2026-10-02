import { createContext } from 'react'

export type Role = 'SELLER' | 'ADMIN'

export type Session = {
  userId: string
  role: Role
  permissions: ReadonlySet<string>
}

export type SessionContextValue = {
  session: Session | null
  setSession: (session: Session | null) => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
