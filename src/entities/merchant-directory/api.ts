import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type MerchantRow = components['schemas']['MerchantDirectoryRow']
export type CoverageShop = components['schemas']['CoverageShop']
export type MerchantDetail = components['schemas']['AdminMerchantDetail']
export type MerchantStatus = 'APPROVED' | 'PENDING' | 'SUSPENDED' | 'REJECTED' | 'CLOSED' | 'ALL'

export const MERCHANT_DIRECTORY_KEY = ['admin', 'merchants'] as const

export function useMerchants(status: MerchantStatus, q: string, page: number, enabled: boolean, size = 25) {
  return useQuery({
    queryKey: [...MERCHANT_DIRECTORY_KEY, 'list', status, q, page, size],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchants', { params: { query: { status, q: q.trim() || undefined, page, size } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Observation only: the radii shops chose, with outliers against their province's median flagged for a closer look. */
export function useAreaCoverage(province: string, ward: string, enabled: boolean) {
  return useQuery({
    queryKey: [...MERCHANT_DIRECTORY_KEY, 'coverage', province, ward],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchants/coverage', { params: { query: { province: province || undefined, ward: ward || undefined } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useMerchantDetail(vendorId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...MERCHANT_DIRECTORY_KEY, 'detail', vendorId],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchants/{vendorId}', { params: { path: { vendorId } } })
      if (error || !data) throw error
      return data
    },
  })
}
