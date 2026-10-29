import { t } from '@/shared/i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'
import { SHOP_QUERY_KEY } from './api'

export type ClosureStatus = components['schemas']['MyClosureStatus']
export type ClosureBlockers = components['schemas']['ClosureBlockers']
export type CloseReason = 'STOP_SELLING' | 'RELOCATING' | 'TOO_FEW_ORDERS' | 'OTHER'

export const CLOSURE_QUERY_KEY = ['merchant', 'closure'] as const

/** What still stands between a closing shop and CLOSED; refreshed while the page is open since orders and cases finish on their own. */
export function useShopClosure(enabled: boolean) {
  return useQuery({
    queryKey: CLOSURE_QUERY_KEY,
    enabled,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/closure')
      if (error || !data) throw error
      return data
    },
  })
}

/** Closes the shop for good: it becomes CLOSING (no new orders; what is under way is finished) and later CLOSED. Needs a recent sign-in. */
export function useCloseShop() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { reason: CloseReason; reasonText?: string }) => {
      const { data, error } = await api.POST('/api/merchant/shop/close', { body })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      return queryClient.invalidateQueries({ queryKey: CLOSURE_QUERY_KEY })
    },
  })
}

export const CLOSE_REASON_LABEL: Record<string, string> = {
  STOP_SELLING: t('Không bán nữa'),
  RELOCATING: t('Chuyển đi nơi khác'),
  TOO_FEW_ORDERS: t('Ít đơn'),
  OTHER: t('Lý do khác'),
}
