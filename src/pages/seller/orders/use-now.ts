export { useNow } from '@/shared/lib/use-now'

/** "mm:ss" until a deadline; "Quá hạn" once it has passed. */
export function countdown(deadline: string | undefined, now: number): { text: string; urgent: boolean } | null {
  if (!deadline) return null
  const seconds = Math.floor((new Date(deadline).getTime() - now) / 1000)
  if (seconds <= 0) return { text: 'Quá hạn', urgent: true }
  const minutes = Math.floor(seconds / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return { text: `${minutes}:${rest}`, urgent: seconds <= 120 }
}
