import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type AdminOrderRow = components['schemas']['AdminOrderRow']
export type AdminOrderDetail = components['schemas']['AdminOrderDetail']
export type AdminCustomerRow = components['schemas']['AdminCustomerRow']
export type AdminCustomerDetail = components['schemas']['AdminCustomerDetail']
export type RevealReason = 'DISPUTE' | 'DATA_REQUEST' | 'SAFETY' | 'OTHER'

export const REASON_LABEL: Record<RevealReason, string> = {
  DISPUTE: 'Tranh chấp',
  DATA_REQUEST: 'Yêu cầu về dữ liệu',
  SAFETY: 'An toàn',
  OTHER: 'Lý do khác',
}

export type OrderQuery = { kind: 'code' | 'customerEmail' | 'customerPhone'; value: string }
export type CustomerQuery = { kind: 'email' | 'phone'; value: string }

/** Every search is written to the audit log, so it only runs when asked for (enabled), never on its own. */
export function useOrderSearch(query: OrderQuery | null) {
  return useQuery({
    queryKey: ['lookup', 'orders', query],
    enabled: !!query?.value.trim(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/orders', { params: { query: { [query!.kind]: query!.value.trim() } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useCustomerSearch(query: CustomerQuery | null) {
  return useQuery({
    queryKey: ['lookup', 'customers', query],
    enabled: !!query?.value.trim(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/customers', { params: { query: { [query!.kind]: query!.value.trim() } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Opening a record is audited too, so it is fetched once and not again when the window regains focus. */
export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['lookup', 'order', id],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/orders/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: ['lookup', 'customer', id],
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/customers/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

type RevealInput = { reason: RevealReason; note?: string }

export function useRevealOrder(id: string) {
  return useMutation({
    mutationFn: async (input: RevealInput) => {
      const { data, error } = await api.POST('/api/admin/orders/{id}/reveal', { params: { path: { id } }, body: { reason: input.reason, note: input.note?.trim() || undefined } })
      if (error || !data) throw error
      return data
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}

export function useRevealCustomer(id: string) {
  return useMutation({
    mutationFn: async (input: RevealInput) => {
      const { data, error } = await api.POST('/api/admin/customers/{id}/reveal', { params: { path: { id } }, body: { reason: input.reason, note: input.note?.trim() || undefined } })
      if (error || !data) throw error
      return data
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}
