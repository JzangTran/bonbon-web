import { useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type QuickReply = components['schemas']['QuickReply']
export const QUICK_REPLIES_KEY = ['merchant', 'quick-replies'] as const

export function useQuickReplies(enabled = true) {
  return useQuery({
    queryKey: QUICK_REPLIES_KEY,
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/quick-replies')
      if (error || !data) throw error
      return data
    },
  })
}

/** The replies whose shortcut starts with what follows "/" at the start of the draft; null when the draft is not a "/" command. */
export function matchQuickReplies(draft: string, replies: QuickReply[] | undefined): QuickReply[] | null {
  const m = /^\/([a-z0-9-]*)$/.exec(draft)
  if (!m || !replies) return null
  return replies.filter((r) => (r.shortcut ?? '').startsWith(m[1])).slice(0, 6)
}

