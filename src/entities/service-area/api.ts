import { useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

/** The API marks every field optional; the server always sends all of them. */
export type ServiceArea = Required<components['schemas']['ServiceArea']>
export type ServiceAreaInput = components['schemas']['ServiceAreaRequest']

export const SERVICE_AREAS_QUERY_KEY = ['admin', 'service-areas'] as const

/** Every service area, switched-off ones included (administrators only). */
export function useServiceAreas() {
  return useQuery({
    queryKey: SERVICE_AREAS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/service-areas')
      if (error || !data) throw error
      return data as ServiceArea[]
    },
  })
}
