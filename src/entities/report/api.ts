import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'
import { t } from '@/shared/i18n'

export type ReportRow = components['schemas']['ReportRow']
export type ReportDetail = components['schemas']['ReportDetail']
export type ModerationTerm = components['schemas']['ModerationTerm']
export type ReportStatus = 'OPEN' | 'ACTIONED' | 'DISMISSED'

export const REPORTS_KEY = ['admin', 'reports'] as const
const TERMS_KEY = ['admin', 'moderation-terms'] as const

export const TARGET_LABEL: Record<string, string> = {
  SHOP: t('Cửa hàng'),
  MESSAGE: t('Tin nhắn'),
  REVIEW: t('Đánh giá'),
  REVIEW_RESPONSE: t('Phản hồi của quán'),
}

export const REASON_LABEL: Record<string, string> = {
  SPAM: t('Tin rác, quảng cáo'),
  OFFENSIVE: t('Xúc phạm, quấy rối'),
  SCAM_OR_FRAUD: t('Lừa đảo'),
  INAPPROPRIATE_IMAGE: t('Hình ảnh không phù hợp'),
  FALSE_INFORMATION: t('Thông tin sai sự thật'),
  OTHER: t('Lý do khác'),
}

export const DECISION_LABEL: Record<string, string> = {
  NO_VIOLATION: t('Không vi phạm'),
  DUPLICATE: t('Trùng báo cáo'),
  CONTENT_HIDDEN: t('Đã gỡ hoặc ẩn nội dung'),
  MESSAGING_RESTRICTED: t('Đã hạn chế nhắn tin'),
  ESCALATED: t('Đã chuyển xử lý'),
}

export const ACTION_LABEL: Record<string, { label: string; hint: string }> = {
  DISMISS: { label: t('Không vi phạm'), hint: t('Giữ nguyên nội dung; người báo cáo được báo không có vi phạm.') },
  DUPLICATE: { label: t('Trùng báo cáo'), hint: t('Đã xử lý ở báo cáo khác.') },
  HIDE: { label: t('Gỡ hoặc ẩn nội dung'), hint: t('Tin nhắn hiện là đã bị gỡ; đánh giá hoặc phản hồi bị ẩn và điểm của quán được tính lại.') },
  RESTRICT: { label: t('Gỡ tin và hạn chế nhắn tin'), hint: t('Người gửi không nhắn được trong số ngày bạn chọn.') },
  ESCALATE: { label: t('Chuyển xử lý'), hint: t('Ghi nhận để xem xét điểm phạt hoặc đình chỉ; báo cáo không tự đình chỉ quán.') },
}

/** The moderation queue (review-reports.md): open reports first, contested ones on top, oldest first. */
export function useReports(status: ReportStatus, targetType: string | undefined, page: number, enabled: boolean, size = 20) {
  return useQuery({
    queryKey: [...REPORTS_KEY, status, targetType, page, size],
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/reports', { params: { query: { status, targetType, page, size } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: [...REPORTS_KEY, 'detail', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/reports/{id}', { params: { path: { id: id ?? '' } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useDecideReport(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: components['schemas']['ReportDecisionRequest']) => {
      const { data, error } = await api.POST('/api/admin/reports/{id}/decide', { params: { path: { id } }, body })
      if (error || !data) throw error
      return data
    },
    onSuccess: async () => {
      toast.success(t('Đã quyết định. Người báo cáo và người bị xử lý đã được báo.'))
      await queryClient.invalidateQueries({ queryKey: REPORTS_KEY })
    },
  })
}

/** Words masked as *** in what the other side of a chat reads. */
export function useModerationTerms(enabled: boolean) {
  return useQuery({
    queryKey: TERMS_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/moderation-terms')
      if (error || !data) throw error
      return data
    },
  })
}

export function useTermActions() {
  const queryClient = useQueryClient()
  const done = () => void queryClient.invalidateQueries({ queryKey: TERMS_KEY })
  const onError = (error: unknown) => toast.error(problemMessage(error))
  const add = useMutation({
    mutationFn: async (term: string) => {
      const { data, error } = await api.POST('/api/admin/moderation-terms', { body: { term } })
      if (error || !data) throw error
      return data
    },
    onSuccess: done,
    onError,
  })
  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await api.PATCH('/api/admin/moderation-terms/{id}', { params: { path: { id } }, body: { active } })
      if (error) throw error
    },
    onSuccess: done,
    onError,
  })
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/admin/moderation-terms/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: done,
    onError,
  })
  return { add, toggle, remove }
}

/** Questions the help-center chatbot could not answer, most asked first. */
export function useUnansweredQuestions(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'help-chat', 'unanswered'],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/help-articles/unanswered-questions', { params: { query: { days: 30, limit: 50 } } })
      if (error || !data) throw error
      return data
    },
  })
}
