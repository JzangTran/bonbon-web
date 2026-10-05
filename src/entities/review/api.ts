import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type Review = components['schemas']['Review']
export type ReviewPage = components['schemas']['ReviewPage']

export const REVIEWS_KEY = ['reviews'] as const
const PAGE_SIZE = 20

/** The shop's own reviews, newest first; {@code unreplied} keeps the ones still waiting for an answer. */
export function useSellerReviews(unreplied: boolean, page: number) {
  return useQuery({
    queryKey: [...REVIEWS_KEY, 'seller', unreplied, page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/reviews', { params: { query: { unreplied, page, size: PAGE_SIZE } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Write, rewrite or remove the shop's reply (rewrite and remove only within 24 hours of posting). */
export function useReplyActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: [...REVIEWS_KEY, 'seller'] })
  const onError = (error: unknown) => {
    toast.error(problemMessage(error))
    // The window may have closed or a moderator hidden it meanwhile: show what it really is now.
    void refresh()
  }
  const save = useMutation({
    mutationFn: async ({ reviewId, text, existing }: { reviewId: string; text: string; existing: boolean }) => {
      const path = { params: { path: { id: reviewId } }, body: { text: text.trim() } }
      const result = existing ? await api.PUT('/api/merchant/reviews/{id}/response', path) : await api.POST('/api/merchant/reviews/{id}/response', path)
      if (result.error || !result.data) throw result.error
      return result.data
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.existing ? 'Đã cập nhật phản hồi.' : 'Đã gửi phản hồi.')
      void refresh()
    },
    onError,
  })
  const remove = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await api.DELETE('/api/merchant/reviews/{id}/response', { params: { path: { id: reviewId } } })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Đã xoá phản hồi.')
      void refresh()
    },
    onError,
  })
  return { save, remove }
}

export type ModerationFilter = { vendorId?: string; hidden?: boolean; maxRating?: number; page: number }

/** Every review, hidden ones included, for the moderator. */
export function useAdminReviews(filter: ModerationFilter, enabled: boolean) {
  return useQuery({
    queryKey: [...REVIEWS_KEY, 'admin', filter],
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/reviews', {
        params: {
          query: {
            page: filter.page,
            size: PAGE_SIZE,
            ...(filter.vendorId ? { vendorId: filter.vendorId } : {}),
            ...(filter.hidden !== undefined ? { hidden: filter.hidden } : {}),
            ...(filter.maxRating ? { maxRating: filter.maxRating } : {}),
          },
        },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export type ModerationTarget = { kind: 'review' | 'reply'; id: string }

/** Hide (with a reason) or restore a review or a shop's reply; nothing is deleted. */
export function useModerationActions() {
  const queryClient = useQueryClient()
  const refresh = () => queryClient.invalidateQueries({ queryKey: [...REVIEWS_KEY, 'admin'] })
  const hide = useMutation({
    mutationFn: async ({ target, reason }: { target: ModerationTarget; reason: string }) => {
      const body = { reason: reason.trim() }
      const result =
        target.kind === 'review'
          ? await api.POST('/api/admin/reviews/{id}/hide', { params: { path: { id: target.id } }, body })
          : await api.POST('/api/admin/review-responses/{id}/hide', { params: { path: { id: target.id } }, body })
      if (result.error || !result.data) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success('Đã ẩn.')
      void refresh()
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void refresh()
    },
  })
  const unhide = useMutation({
    mutationFn: async (target: ModerationTarget) => {
      const result =
        target.kind === 'review'
          ? await api.POST('/api/admin/reviews/{id}/unhide', { params: { path: { id: target.id } } })
          : await api.POST('/api/admin/review-responses/{id}/unhide', { params: { path: { id: target.id } } })
      if (result.error || !result.data) throw result.error
      return result.data
    },
    onSuccess: () => {
      toast.success('Đã khôi phục.')
      void refresh()
    },
    onError: (error) => {
      toast.error(problemMessage(error))
      void refresh()
    },
  })
  return { hide, unhide }
}
