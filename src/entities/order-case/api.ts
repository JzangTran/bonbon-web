import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type OrderCase = components['schemas']['OrderCase']
export type OrderCaseLine = components['schemas']['OrderCaseLine']
export type ShopCaseSummary = components['schemas']['OrderCaseSummary']
export type AdminCaseSummary = components['schemas']['AdminOrderCaseSummary']
export type AdminCaseDetail = components['schemas']['AdminOrderCase']
export type CaseHistory = components['schemas']['OrderCaseHistory']
export type CaseStatus = 'AWAITING_SHOP' | 'AWAITING_CUSTOMER' | 'OPEN' | 'UPHELD' | 'DISMISSED'

export const CASES_KEY = ['order-cases'] as const

// --- the administrators' queue

export function useAdminCases(status: CaseStatus, page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...CASES_KEY, 'admin', status, page],
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/order-cases', { params: { query: { status, page, size: 20 } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAdminCase(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...CASES_KEY, 'admin', 'detail', id],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/order-cases/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Upheld (all of it, or only the listed lines) or dismissed, with a reason both sides see. */
export function useDecideCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; outcome: 'UPHELD' | 'DISMISSED'; reason: string; lines?: { orderItemId: string; quantity: number }[] }) => {
      const { data, error } = await api.POST('/api/admin/order-cases/{id}/decide', {
        params: { path: { id: input.id } },
        body: { outcome: input.outcome, reason: input.reason.trim(), ...(input.lines && input.lines.length > 0 ? { lines: input.lines } : {}) },
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: (_, input) => {
      toast.success(input.outcome === 'UPHELD' ? 'Đã chấp nhận khiếu nại. Khách sẽ được hoàn tiền.' : 'Đã bác bỏ khiếu nại.')
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
  })
}

export function useReopenCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await api.POST('/api/admin/order-cases/{id}/reopen', { params: { path: { id } }, body: { reason: reason.trim() } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã mở lại khiếu nại.')
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}

// --- the shop's side

export function useShopCases(status: CaseStatus | null, page: number) {
  return useQuery({
    queryKey: [...CASES_KEY, 'shop', status, page],
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/order-cases', { params: { query: { page, size: 20, ...(status ? { status } : {}) } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useShopCase(id: string) {
  return useQuery({
    queryKey: [...CASES_KEY, 'shop', 'detail', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/order-cases/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAcceptCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.POST('/api/merchant/order-cases/{id}/accept', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã chấp nhận khiếu nại. Khách được hoàn tiền.')
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
  })
}

export function useDisputeCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const { data, error } = await api.POST('/api/merchant/order-cases/{id}/dispute', { params: { path: { id } }, body: { note: note.trim() } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã chuyển cho quản trị viên quyết định.')
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: CASES_KEY })
    },
  })
}
