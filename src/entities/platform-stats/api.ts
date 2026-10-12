import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type PlatformOverview = components['schemas']['PlatformOverview']
export type PlatformOverviewBucket = components['schemas']['PlatformOverviewBucket']
export type MerchantRevenueRow = components['schemas']['MerchantRevenueRow']
export type UserGrowthReport = components['schemas']['UserGrowthReport']
export type StatsGranularity = 'day' | 'week' | 'month'
export type MerchantSort = 'revenue' | 'orders' | 'commission' | 'name'

export const PLATFORM_STATS_KEY = ['admin', 'platform-stats'] as const

type Range = { from: string; to: string }

/** Both ends are Vietnam-time days and inclusive; the server fills every period of the range, empty ones as zero. */
export function usePlatformOverview(range: Range, granularity: StatsGranularity, enabled: boolean) {
  return useQuery({
    queryKey: [...PLATFORM_STATS_KEY, 'overview', range, granularity],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/stats/overview', { params: { query: { ...range, granularity } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useRevenueByMerchant(range: Range, sort: MerchantSort, q: string, page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...PLATFORM_STATS_KEY, 'by-merchant', range, sort, q, page],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/stats/revenue-by-merchant', {
        params: { query: { ...range, sort, q: q.trim() || undefined, page, size: 20 } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export function useUserGrowth(range: Range, granularity: StatsGranularity, enabled: boolean) {
  return useQuery({
    queryKey: [...PLATFORM_STATS_KEY, 'user-growth', range, granularity],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/stats/user-growth', { params: { query: { ...range, granularity } } })
      if (error || !data) throw error
      return data
    },
  })
}
