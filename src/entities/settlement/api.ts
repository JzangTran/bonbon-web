import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type CommissionRates = components['schemas']['CommissionRates']
export type CategoryCommissionRate = components['schemas']['CategoryCommissionRate']
export type SettlementOverview = components['schemas']['SettlementOverview']
export type SettlementShopRow = components['schemas']['SettlementShopRow']
export type SettlementStatement = components['schemas']['SettlementStatement']
export type LedgerEntry = components['schemas']['LedgerEntry']

export const COMMISSION_KEY = ['admin', 'commission'] as const
export const SETTLEMENT_KEY = ['admin', 'settlement'] as const

export function useCommissionRates(enabled: boolean) {
  return useQuery({
    queryKey: [...COMMISSION_KEY, 'rates'],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/commission-rates')
      if (error || !data) throw error
      return data
    },
  })
}

export function useCommissionHistory(page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...COMMISSION_KEY, 'history', page],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/commission-rates/history', { params: { query: { page, size: 10 } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Set the global default, or a category's own rate; {@code null} for a category lets it inherit again. */
export function useSetCommissionRate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ categoryId, rate }: { categoryId: string | null; rate: number | null }) => {
      const result =
        categoryId === null
          ? await api.PUT('/api/admin/settings/commission-rate', { body: { ratePercent: rate ?? 0 } })
          : rate === null
            ? await api.DELETE('/api/admin/categories/{id}/commission-rate', { params: { path: { id: categoryId } } })
            : await api.PUT('/api/admin/categories/{id}/commission-rate', { params: { path: { id: categoryId } }, body: { ratePercent: rate } })
      if (result.error || !result.data) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success('Đã lưu tỷ lệ hoa hồng. Đơn đặt từ bây giờ dùng tỷ lệ mới.')
      void queryClient.invalidateQueries({ queryKey: COMMISSION_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}

export type ShopFilter = 'ALL' | 'OWED_TO_SHOP' | 'OWED_BY_SHOP'

export function useSettlementOverview(filter: ShopFilter, page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...SETTLEMENT_KEY, 'overview', filter, page],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/settlement/overview', {
        params: { query: { page, size: 20, ...(filter === 'ALL' ? {} : { status: filter }) } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export function useSettlementVendor(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...SETTLEMENT_KEY, 'vendor', id],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/settlement/vendors/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useVendorLedger(id: string, type: string | null, page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...SETTLEMENT_KEY, 'ledger', id, type, page],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/settlement/vendors/{id}/ledger', {
        params: { path: { id }, query: { page, size: 20, ...(type ? { type } : {}) } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export type Granularity = 'day' | 'week' | 'month'

export function useVendorStatement(id: string, granularity: Granularity, enabled: boolean) {
  return useQuery({
    queryKey: [...SETTLEMENT_KEY, 'statement', id, granularity],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/settlement/vendors/{id}/statement', { params: { path: { id }, query: { granularity } } })
      if (error || !data) throw error
      return data
    },
  })
}

export type RecordInput = { type: 'PAYOUT' | 'COLLECTION' | 'ADJUSTMENT'; amount: number; reference?: string; note?: string }

/** Records money moved outside the system. The key is made once per dialog, so a double click is the same request. */
export function useRecordEntry(vendorId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ input, key }: { input: RecordInput; key: string }) => {
      const { data, error } = await api.POST('/api/admin/settlement/vendors/{id}/entries', {
        params: { path: { id: vendorId }, header: { 'Idempotency-Key': key } },
        body: input,
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã ghi vào sổ.')
      void queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEY })
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void queryClient.invalidateQueries({ queryKey: SETTLEMENT_KEY })
    },
  })
}
