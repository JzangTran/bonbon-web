import { t } from '@/shared/i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { problemFieldErrors} from '@/shared/api'
import { SHOP_QUERY_KEY, type ShopApplication } from './api'

/** Parses a typed amount ("12.500", "1,5"); an empty field is "not set". */
export const parseAmount = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/\./g, '').replace(',', '.')))

/**
 * Runs one of the shop-profile calls, stores the returned shop in the cache and toasts the result; field errors from
 * the problem response are kept for the form. A new address sends the shop back to review, which the message says.
 */
export function useApplyShop<T>(call: (input: T) => Promise<{ data?: ShopApplication; error?: unknown }>, success: string) {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const mutation = useMutation({
    mutationFn: async (input: T) => {
      const { data, error } = await call(input)
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      setFieldErrors({})
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      feedback.success(data.status === 'PENDING' ? t('Đã lưu thông tin quán. Địa chỉ mới cần được duyệt lại; trong lúc chờ, quán vẫn bán ở địa chỉ cũ.') : success)
    },
    onError: (e) => {
      setFieldErrors(problemFieldErrors(e))
      feedback.error(e)
    },
  })
  return { ...mutation, fieldErrors }
}
