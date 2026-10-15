import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type AppNotification = components['schemas']['NotificationItem']

export const NOTIFICATIONS_KEY = ['notifications'] as const

/** The signed-in person's in-app notifications, newest first, with the total of unread ones. Polled: the feed is a side panel, not a page. */
export function useNotifications(size = 20) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, size],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/notifications', { params: { query: { size } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useAckNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.POST('/api/notifications/{id}/ack', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  })
}

export function useAckAllNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { error } = await api.POST('/api/notifications/ack-all')
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  })
}
