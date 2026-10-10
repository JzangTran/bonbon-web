import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type HelpArticle = components['schemas']['HelpArticleSummary']
export type AdminHelpArticle = components['schemas']['AdminHelpArticle']
export type HelpAudience = 'ALL' | 'CUSTOMER' | 'SELLER'
export type HelpStatus = 'DRAFT' | 'PUBLISHED'

export const HELP_KEY = ['help'] as const

export const AUDIENCE_LABEL: Record<string, string> = { ALL: 'Mọi người', CUSTOMER: 'Khách', SELLER: 'Người bán' }

/** What a signed-in seller (or a guest) can read: published articles meant for them. */
export function useHelpArticles(q: string) {
  return useQuery({
    queryKey: [...HELP_KEY, 'public', q],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/help-articles', { params: { query: q.trim() ? { q: q.trim() } : {} } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAdminHelpArticles(status: HelpStatus | 'ALL_STATUSES', q: string, page: number) {
  return useQuery({
    queryKey: [...HELP_KEY, 'admin', status, q, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/help-articles', {
        params: { query: { ...(status === 'ALL_STATUSES' ? {} : { status }), ...(q.trim() ? { q: q.trim() } : {}), page, size: 20 } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export type HelpDraft = { title: string; body: string; audience: HelpAudience; keywords: string[]; status: HelpStatus }

/** Creates the article, or changes the one with {@code id}. Keywords replace the whole list. */
export function useSaveHelpArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, draft }: { id: string | null; draft: HelpDraft }) => {
      const payload = { ...draft, title: draft.title.trim(), body: draft.body.trim() }
      const result = id
        ? await api.PATCH('/api/admin/help-articles/{id}', { params: { path: { id } }, body: payload })
        : await api.POST('/api/admin/help-articles', { body: payload })
      if (result.error || !result.data) throw result.error
      return result.data
    },
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Đã lưu bài.' : 'Đã tạo bài.')
      void queryClient.invalidateQueries({ queryKey: HELP_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}

export function useDeleteHelpArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/admin/help-articles/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Đã xoá bài.')
      void queryClient.invalidateQueries({ queryKey: HELP_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}
