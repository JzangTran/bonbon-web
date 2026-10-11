import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type AdminAppConfig = components['schemas']['AdminAppConfig']
export type AppVersionPolicy = components['schemas']['AppVersionPolicy']
export type MaintenanceStatus = components['schemas']['MaintenanceStatus']
export type AppPlatform = 'ANDROID' | 'IOS'
export type MaintenanceLevel = 'NONE' | 'READ_ONLY' | 'FULL'

export const APP_CONFIG_KEY = ['admin', 'app-config'] as const

export function useAdminAppConfig(enabled: boolean) {
  return useQuery({
    queryKey: APP_CONFIG_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/app-config')
      if (error || !data) throw error
      return data
    },
  })
}

type PolicyInput = { platform: AppPlatform; minSupportedVersion: string; latestVersion: string; storeUrl?: string; message?: string; reason: string }

export function useSetVersionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ platform, ...body }: PolicyInput) => {
      const { data, error } = await api.PUT('/api/admin/app-config/version-policy/{platform}', { params: { path: { platform } }, body })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => queryClient.setQueryData(APP_CONFIG_KEY, data),
  })
}

type MaintenanceInput = { level: MaintenanceLevel; message?: string; startsAt?: string; endsAt?: string; reason: string }

export function useSetMaintenance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: MaintenanceInput) => {
      const { data, error } = await api.PUT('/api/admin/app-config/maintenance', { body })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => queryClient.setQueryData(APP_CONFIG_KEY, data),
  })
}
