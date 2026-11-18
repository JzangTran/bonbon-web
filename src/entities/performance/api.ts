import { t } from '@/shared/i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFeedback } from '@/shared/ui/feedback'
import { api, type components } from '@/shared/api'

export type ShopPerformance = components['schemas']['ShopPerformance']
export type PerformanceWeek = components['schemas']['PerformanceWeek']
export type ShopPenalty = components['schemas']['ShopPenalty']
export type ShopFault = components['schemas']['ShopFault']
export type MyShopSuspension = components['schemas']['MyShopSuspension']

export const PERFORMANCE_KEY = ['merchant', 'performance'] as const

/** The week to date and the closed weeks, the points and what they lead to (view-shop-performance.md). */
export function useMyPerformance() {
  return useQuery({
    queryKey: [...PERFORMANCE_KEY, 'summary'],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/performance')
      if (error || !data) throw error
      return data
    },
  })
}

/** The orders behind one week's figure, with the reason each one counted. */
export function useWeekFaults(week: string | null) {
  return useQuery({
    queryKey: [...PERFORMANCE_KEY, 'faults', week],
    enabled: week !== null,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/performance/faults', { params: { query: { week: week ?? '' } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAppealPenalty() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await api.POST('/api/merchant/penalties/{id}/appeal', { params: { path: { id } }, body: { reason: reason.trim() } })
      if (error) throw error
    },
    onSuccess: () => {
      feedback.success(t('Đã gửi kháng nghị. Quản trị viên xem xét và bạn nhận thông báo kết quả; điểm phạt giữ nguyên tới khi có quyết định.'))
      void queryClient.invalidateQueries({ queryKey: PERFORMANCE_KEY })
    },
    onError: (error) => {
      feedback.error(error)
      void queryClient.invalidateQueries({ queryKey: PERFORMANCE_KEY })
    },
  })
}

/** Whether the shop is, or is about to be, suspended; the shop can still read why. */
export function useMySuspension() {
  return useQuery({
    queryKey: ['merchant', 'suspension'],
    refetchInterval: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/suspension')
      if (error || !data) throw error
      return data
    },
  })
}
