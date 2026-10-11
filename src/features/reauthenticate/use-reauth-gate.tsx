import { useRef, useState, type ReactNode } from 'react'
import { ReauthDialog } from './reauth-dialog'
import { isReauthRequired } from './use-reauthenticate'

/**
 * For a page whose action may answer "sign in again": {@code handle(error, retry)} opens the password dialog when that is the
 * problem (returns true, so the caller shows no error) and runs {@code retry} once the person has signed in again.
 */
export function useReauthGate(): { handle: (error: unknown, retry: () => void) => boolean; dialog: ReactNode } {
  const [open, setOpen] = useState(false)
  const retryRef = useRef<(() => void) | null>(null)
  return {
    handle: (error, retry) => {
      if (!isReauthRequired(error)) return false
      retryRef.current = retry
      setOpen(true)
      return true
    },
    dialog: (
      <ReauthDialog
        open={open}
        onOpenChange={setOpen}
        onDone={() => {
          const retry = retryRef.current
          retryRef.current = null
          retry?.()
        }}
      />
    ),
  }
}
