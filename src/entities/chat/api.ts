import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'

export type Conversation = components['schemas']['ConversationSummary']
export type ChatMessage = components['schemas']['ChatMessage']
export type AdminConversation = components['schemas']['AdminConversationView']

export const CHAT_KEY = ['chat'] as const

const PAGE = 30

/** The shop's conversations, newest first. The socket calls {@code invalidate} when a message arrives; the poll is the fallback. */
export function useConversations(page: number, live: boolean) {
  return useQuery({
    queryKey: [...CHAT_KEY, 'list', page],
    placeholderData: keepPreviousData,
    refetchInterval: live ? false : 15_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/conversations', { params: { query: { page, size: 30 } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Messages of one conversation; pages go back in time ("load older"). Each page is newest first. */
export function useThread(conversationId: string | null, live: boolean) {
  return useInfiniteQuery({
    queryKey: [...CHAT_KEY, 'thread', conversationId],
    enabled: !!conversationId,
    initialPageParam: undefined as string | undefined,
    refetchInterval: live ? false : 10_000,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.GET('/api/conversations/{id}/messages', {
        params: { path: { id: conversationId! }, query: { before: pageParam, size: PAGE } },
      })
      if (error || !data) throw error
      return data
    },
    getNextPageParam: (last) => (last.hasMore ? last.nextBefore : undefined),
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await api.POST('/api/conversations/{id}/read', { params: { path: { id: conversationId } } })
      if (error) throw error
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [...CHAT_KEY, 'list'] }),
  })
}

/** Sends text and/or one image (uploaded first), optionally replying to a message. */
export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { text: string; image: File | null; replyToMessageId?: string }) => {
      let imageKey: string | undefined
      if (input.image) {
        const form = new FormData()
        form.append('file', input.image)
        const { data, error } = await api.POST('/api/conversations/images', {
          body: form as unknown as { file: string },
          bodySerializer: (body) => body as unknown as FormData,
        })
        if (error || !data) throw error
        imageKey = data.imageKey
      }
      const { data, error } = await api.POST('/api/conversations/{id}/messages', {
        params: { path: { id: conversationId } },
        body: { text: input.text.trim() || undefined, imageKey, replyToMessageId: input.replyToMessageId },
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: CHAT_KEY }),
    onError: (error) => toast.error(problemMessage(error)),
  })
}

// --- the administrators, read only

export function useAdminConversation(id: string) {
  return useQuery({
    queryKey: [...CHAT_KEY, 'admin', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/conversations/{id}', { params: { path: { id } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Opening the first page is what the backend audits, so it is fetched once and not refetched on focus. */
export function useAdminThread(id: string) {
  return useInfiniteQuery({
    queryKey: [...CHAT_KEY, 'admin-thread', id],
    initialPageParam: undefined as string | undefined,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await api.GET('/api/admin/conversations/{id}/messages', {
        params: { path: { id }, query: { before: pageParam, size: PAGE } },
      })
      if (error || !data) throw error
      return data
    },
    getNextPageParam: (last) => (last.hasMore ? last.nextBefore : undefined),
  })
}
