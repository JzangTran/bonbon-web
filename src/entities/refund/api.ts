import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type RefundRow = components['schemas']['RefundRow']
export type RefundPage = components['schemas']['RefundPage']

export const REFUNDS_KEY = ['admin', 'refunds'] as const

/** The refund queue: the open bank transfers by default, {@code COMPLETED} or {@code ALL} for the month-end sheet. */
export function useRefunds(status: 'OPEN' | 'COMPLETED' | 'ALL', page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...REFUNDS_KEY, status, page],
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/refunds', {
        params: { query: { page, size: 20, ...(status === 'OPEN' ? {} : { status }) } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

/** The admin has transferred the money and enters the bank reference. */
export function useCompleteRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, bankReference }: { id: string; bankReference: string }) => {
      const { data, error } = await api.POST('/api/admin/refunds/{id}/complete', { params: { path: { id } }, body: { bankReference: bankReference.trim() } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã ghi nhận chuyển khoản. Khách được báo đã hoàn tiền.')
      void queryClient.invalidateQueries({ queryKey: REFUNDS_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: REFUNDS_KEY })
    },
  })
}

/** The transfer bounced: the customer is asked for another account. */
export function useFailRefund() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await api.POST('/api/admin/refunds/{id}/fail', { params: { path: { id } }, body: { reason: reason.trim() } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã báo chuyển khoản thất bại. Khách sẽ nhập tài khoản khác.')
      void queryClient.invalidateQueries({ queryKey: REFUNDS_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: REFUNDS_KEY })
    },
  })
}
