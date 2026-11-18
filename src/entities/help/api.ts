import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFeedback } from '@/shared/ui/feedback'
import { api, type components } from '@/shared/api'
import { t } from '@/shared/i18n'

export type HelpArticle = components['schemas']['HelpArticleSummary']
export type AdminHelpArticle = components['schemas']['AdminHelpArticle']
export type HelpAudience = 'ALL' | 'CUSTOMER' | 'SELLER'
export type HelpStatus = 'DRAFT' | 'PUBLISHED'

export const HELP_KEY = ['help'] as const

export const AUDIENCE_LABEL: Record<string, string> = { ALL: t('Mọi người'), CUSTOMER: t('Khách'), SELLER: t('Người bán') }

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

/** One published article by id, for the public help center page. */
export function useHelpArticle(id: string | undefined) {
  return useQuery({
    queryKey: [...HELP_KEY, 'public', 'one', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/help-articles/{id}', { params: { path: { id: id! } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAdminHelpArticles(status: HelpStatus | 'ALL_STATUSES', q: string, page: number, size = 25) {
  return useQuery({
    queryKey: [...HELP_KEY, 'admin', status, q, page, size],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/help-articles', {
        params: { query: { ...(status === 'ALL_STATUSES' ? {} : { status }), ...(q.trim() ? { q: q.trim() } : {}), page, size } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export type HelpDraft = { title: string; body: string; audience: HelpAudience; keywords: string[]; status: HelpStatus }

/** Creates the article, or changes the one with {@code id}. Keywords replace the whole list. */
export function useSaveHelpArticle() {
  const feedback = useFeedback()
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
      feedback.success(id ? t('Đã lưu bài. Người đọc thấy bản mới ngay khi bài đang hiển thị.') : t('Đã tạo bài. Bài nằm trong danh sách bên dưới; kiểm tra lại trước khi chia sẻ đường dẫn.'))
      void queryClient.invalidateQueries({ queryKey: HELP_KEY })
    },
    onError: (error) => feedback.error(error),
  })
}

export function useDeleteHelpArticle() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/admin/help-articles/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: () => {
      feedback.success(t('Đã xoá bài. Bài không còn hiện ở trung tâm trợ giúp và trong kết quả tìm kiếm.'))
      void queryClient.invalidateQueries({ queryKey: HELP_KEY })
    },
    onError: (error) => feedback.error(error),
  })
}
