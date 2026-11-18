import { t } from '@/shared/i18n'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFeedback } from '@/shared/ui/feedback'
import { api, type components } from '@/shared/api'

export type NotificationPreferences = components['schemas']['NotificationPreferences']
export type NotificationCategory = components['schemas']['NotificationCategorySetting']
export type PushDevice = components['schemas']['PushDeviceView']

const KEY = ['notification-settings'] as const

export function useNotificationPreferences() {
  return useQuery({
    queryKey: [...KEY, 'preferences'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/me/notification-preferences')
      if (error || !data) throw error
      return data
    },
  })
}

export function useUpdatePreference() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (change: { category: string; channel: 'PUSH' | 'EMAIL'; enabled: boolean }) => {
      const { data, error } = await api.PUT('/api/me/notification-preferences', { body: { changes: [change] } })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => queryClient.setQueryData([...KEY, 'preferences'], data),
    onError: (error) => feedback.error(error),
  })
}

/** Both times, or neither to clear. */
export function useSetQuietHours() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (hours: { start?: string; end?: string }) => {
      const { data, error } = await api.PUT('/api/me/quiet-hours', { body: hours })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      feedback.success(data.quietHours ? t('Đã đặt giờ yên lặng. Trong khung giờ này thông báo vẫn vào hộp thư nhưng không đổ chuông.') : t('Đã bỏ giờ yên lặng. Thông báo đổ chuông ở mọi giờ.'))
      queryClient.setQueryData([...KEY, 'preferences'], data)
    },
    onError: (error) => feedback.error(error),
  })
}

export function usePushDevices() {
  return useQuery({
    queryKey: [...KEY, 'devices'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/push-devices')
      if (error || !data) throw error
      return data
    },
  })
}

export function useRemoveDevice() {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/push-devices/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: () => {
      feedback.success(t('Đã gỡ thiết bị. Thiết bị đó không còn nhận thông báo đẩy cho tới khi đăng nhập lại.'))
      void queryClient.invalidateQueries({ queryKey: [...KEY, 'devices'] })
    },
    onError: (error) => feedback.error(error),
  })
}
