import { useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type Member = components['schemas']['TeamMember']
export type Role = components['schemas']['SellerRole']
export type Permission = components['schemas']['SellerPermission']
export type MainAccount = components['schemas']['MainAccount']

export const TEAM_KEYS = {
  members: ['team', 'members'] as const,
  roles: ['team', 'roles'] as const,
  permissions: ['team', 'permissions'] as const,
  me: ['team', 'me'] as const,
}

export function useMembers() {
  return useQuery({
    queryKey: TEAM_KEYS.members,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/seller-team/members')
      if (error || !data) throw error
      return data
    },
  })
}

export function useRoles() {
  return useQuery({
    queryKey: TEAM_KEYS.roles,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/seller-team/roles')
      if (error || !data) throw error
      return data
    },
  })
}

export function usePermissions() {
  return useQuery({
    queryKey: TEAM_KEYS.permissions,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/seller-team/permissions')
      if (error || !data) throw error
      return data
    },
  })
}

export function useMainAccount() {
  return useQuery({
    queryKey: TEAM_KEYS.me,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/seller-team/me')
      if (error || !data) throw error
      return data
    },
  })
}

/** Permissions grouped the way the role editor shows them. */
export function grouped(permissions: Permission[]): [string, Permission[]][] {
  const out = new Map<string, Permission[]>()
  for (const p of permissions) {
    const g = p.group ?? ''
    out.set(g, [...(out.get(g) ?? []), p])
  }
  return [...out.entries()]
}
