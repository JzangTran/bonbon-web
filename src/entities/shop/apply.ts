import { t } from '@/shared/i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { problemFieldErrors, problemMessage } from '@/shared/api'
import { SHOP_QUERY_KEY, type ShopApplication } from './api'

/** Parses a typed amount ("12.500", "1,5"); an empty field is "not set". */
export const parseAmount = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/\./g, '').replace(',', '.')))

/**
 * Runs one of the shop-profile calls, stores the returned shop in the cache and toasts the result; field errors from
 * the problem response are kept for the form. A new address sends the shop back to review, which the message says.
 */
export function useApplyShop<T>(call: (input: T) => Promise<{ data?: ShopApplication; error?: unknown }>, success: string) {
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
      toast.success(data.status === 'PENDING' ? t('Đã lưu. Địa chỉ mới cần được duyệt lại.') : success)
    },
    onError: (e) => {
      setFieldErrors(problemFieldErrors(e))
      toast.error(problemMessage(e))
    },
  })
  return { ...mutation, fieldErrors }
}
