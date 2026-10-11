import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type TicketSummary = components['schemas']['SupportTicketSummary']
export type TicketDetail = components['schemas']['SupportTicketDetail']
export type AdminTicketRow = components['schemas']['AdminSupportTicketRow']
export type AdminTicketDetail = components['schemas']['AdminSupportTicketDetail']
export type TicketStatus = 'OPEN' | 'ANSWERED' | 'CLOSED'

export const TICKETS_KEY = ['support-tickets'] as const

export const TICKET_STATUS: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Chờ hỗ trợ', className: 'bg-warning-subtle text-warning-fg' },
  ANSWERED: { label: 'Đã trả lời', className: 'bg-success-subtle text-success-fg' },
  CLOSED: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground' },
}

// --- the person asking for help

export function useMyTickets(page: number) {
  return useQuery({
    queryKey: [...TICKETS_KEY, 'mine', page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/support/tickets', { params: { query: { page, size: 20 } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useMyTicket(id: string) {
  return useQuery({
    queryKey: [...TICKETS_KEY, 'mine', 'detail', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/support/tickets/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

async function uploadAttachment(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data, error } = await api.POST('/api/support/attachments', {
    body: form as unknown as { file: string },
    bodySerializer: (body) => body as unknown as FormData,
  })
  if (error || !data?.attachmentKey) throw error
  return data.attachmentKey
}

/** Opens a ticket; images are uploaded first and their keys sent with it. */
export function useOpenTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { subject: string; message: string; orderId?: string; images: File[] }) => {
      const attachmentKeys = await Promise.all(input.images.map(uploadAttachment))
      const { data, error } = await api.POST('/api/support/tickets', {
        body: { subject: input.subject.trim(), message: input.message.trim(), orderId: input.orderId || undefined, attachmentKeys },
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã gửi phiếu. Chúng tôi sẽ trả lời sớm.')
      void queryClient.invalidateQueries({ queryKey: TICKETS_KEY })
    },
  })
}

export function useReplyTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { body: string; images: File[] }) => {
      const attachmentKeys = await Promise.all(input.images.map(uploadAttachment))
      const { data, error } = await api.POST('/api/support/tickets/{id}/messages', { params: { path: { id } }, body: { body: input.body.trim(), attachmentKeys } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: TICKETS_KEY }),
    onError: (error) => toast.error(problemMessage(error)),
  })
}

export function useCloseTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/support/tickets/{id}/close', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã đóng phiếu.')
      void queryClient.invalidateQueries({ queryKey: TICKETS_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}

// --- the administrators' inbox

export function useTicketInbox(status: TicketStatus, page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...TICKETS_KEY, 'admin', status, page],
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/support/tickets', { params: { query: { status, page, size: 20 } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAdminTicket(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...TICKETS_KEY, 'admin', 'detail', id],
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/support/tickets/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAnswerTicket(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: string) => {
      const { data, error } = await api.POST('/api/admin/support/tickets/{id}/reply', { params: { path: { id } }, body: { body: body.trim() } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      toast.success('Đã trả lời. Người dùng được báo.')
      void queryClient.invalidateQueries({ queryKey: TICKETS_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}
