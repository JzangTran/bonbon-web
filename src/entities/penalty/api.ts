import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type PenaltyShopRow = components['schemas']['PenaltyShopRow']
export type PenaltyAppealRow = components['schemas']['PenaltyAppealRow']
export type PenaltyHistory = components['schemas']['ShopPenaltyHistory']
export type PenaltyRecord = components['schemas']['PenaltyRecord']
export type ShopSuspension = components['schemas']['ShopSuspension']

export const PENALTIES_KEY = ['admin', 'penalties'] as const

export function usePenaltyShops(page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...PENALTIES_KEY, 'shops', page],
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/shop-penalties', { params: { query: { page, size: 20 } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function usePenaltyAppeals(page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...PENALTIES_KEY, 'appeals', page],
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/shop-penalties/appeals', { params: { query: { page, size: 20 } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useShopPenalties(vendorId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...PENALTIES_KEY, 'history', vendorId],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/shops/{id}/penalties', { params: { path: { id: vendorId } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useShopSuspensions(vendorId: string, enabled: boolean) {
  return useQuery({
    queryKey: [...PENALTIES_KEY, 'suspensions', vendorId],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchants/{id}/suspensions', { params: { path: { id: vendorId } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Runs a change, tells the administrator what happened, and refreshes everything about penalties and suspensions. */
function useChange<T>(success: string, run: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: run,
    onSuccess: () => {
      toast.success(success)
      void queryClient.invalidateQueries({ queryKey: PENALTIES_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: PENALTIES_KEY })
    },
  })
}

export function useWaivePenalty() {
  return useChange('Đã miễn điểm. Quán được báo.', async ({ id, reason }: { id: string; reason: string }) => {
    const { error } = await api.POST('/api/admin/shop-penalties/{id}/waive', { params: { path: { id } }, body: { reason: reason.trim() } })
    if (error) throw error
  })
}

export function useAddPenalty() {
  return useChange('Đã cộng điểm. Quán được báo.', async ({ vendorId, points, reason }: { vendorId: string; points: number; reason: string }) => {
    const { error } = await api.POST('/api/admin/shops/{id}/penalties', { params: { path: { id: vendorId } }, body: { points, reason: reason.trim() } })
    if (error) throw error
  })
}

export function useDecideAppeal() {
  return useChange('Đã quyết định kháng nghị. Quán được báo.', async ({ id, decision, reason }: { id: string; decision: 'ACCEPT' | 'REJECT'; reason: string }) => {
    const { error } = await api.POST('/api/admin/shop-penalties/{id}/appeal-decision', { params: { path: { id } }, body: { decision, reason: reason.trim() } })
    if (error) throw error
  })
}

export function useSuspendShop() {
  return useChange('Đã lập lịch đình chỉ. Quán được báo.', async (input: { vendorId: string; reason: string; effectiveAt?: string; immediate?: boolean; authorityReference?: string }) => {
    const { error } = await api.POST('/api/admin/merchants/{id}/suspend', {
      params: { path: { id: input.vendorId } },
      body: {
        reason: input.reason.trim(),
        ...(input.effectiveAt ? { effectiveAt: input.effectiveAt } : {}),
        ...(input.immediate ? { immediate: true, authorityReference: (input.authorityReference ?? '').trim() } : {}),
      },
    })
    if (error) throw error
  })
}

export function useCancelSuspension() {
  return useChange('Đã huỷ lịch đình chỉ. Quán được báo.', async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
    const { error } = await api.POST('/api/admin/merchants/{id}/suspension/cancel', { params: { path: { id: vendorId } }, body: { reason: reason.trim() } })
    if (error) throw error
  })
}

export function useReinstateShop() {
  return useChange('Đã khôi phục cửa hàng. Quán được báo.', async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
    const { error } = await api.POST('/api/admin/merchants/{id}/reinstate', { params: { path: { id: vendorId } }, body: { reason: reason.trim() } })
    if (error) throw error
  })
}
