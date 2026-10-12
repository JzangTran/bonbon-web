import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type LegalVersion = components['schemas']['LegalDocumentVersion']
export type LegalDetail = components['schemas']['LegalDocumentDetail']
export type LegalDocumentType = 'CUSTOMER_TERMS' | 'SELLER_TERMS' | 'PRIVACY_POLICY'
export type LegalStatus = 'DRAFT' | 'SCHEDULED' | 'EFFECTIVE' | 'SUPERSEDED' | 'CANCELLED'

export const LEGAL_KEY = ['admin', 'legal-documents'] as const

export function useLegalVersions(enabled: boolean) {
  return useQuery({
    queryKey: [...LEGAL_KEY, 'list'],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/legal-documents')
      if (error || !data) throw error
      return data
    },
  })
}

export function useLegalVersion(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...LEGAL_KEY, 'detail', id],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/legal-documents/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

type Draft = { type: LegalDocumentType; title: string; summary: string; content: string; requiresReacceptance: boolean }

export function useCreateLegalDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Draft) => {
      const { data, error } = await api.POST('/api/admin/legal-documents', { body })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEGAL_KEY }),
  })
}

export function useUpdateLegalDraft(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<Omit<Draft, 'type'>>) => {
      const { data, error } = await api.PATCH('/api/admin/legal-documents/{id}', { params: { path: { id } }, body })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEGAL_KEY }),
  })
}

export function usePublishLegal(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (effectiveAt: string | undefined) => {
      const { data, error } = await api.POST('/api/admin/legal-documents/{id}/publish', { params: { path: { id } }, body: { effectiveAt } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEGAL_KEY }),
  })
}

export function useCancelLegal(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data, error } = await api.POST('/api/admin/legal-documents/{id}/cancel', { params: { path: { id } }, body: { reason: reason || undefined } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEGAL_KEY }),
  })
}
