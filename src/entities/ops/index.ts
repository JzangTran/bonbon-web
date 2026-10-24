import { useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type OpsStatus = components['schemas']['OpsStatus']
export type OpsCheck = components['schemas']['OpsCheck']

/** Status of the running instance and the parts it stands on; asks again every 15 seconds while the page is open. */
export function useOpsStatus() {
  return useQuery({
    queryKey: ['ops', 'status'],
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/ops/status')
      if (error || !data) throw error
      return data
    },
  })
}
