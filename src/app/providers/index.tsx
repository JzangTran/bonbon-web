import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FeedbackHost } from '@/shared/ui/feedback'
import { useState, type ReactNode } from 'react'
import { SessionProvider, useSession } from '@/entities/session'
import { Toaster } from '@/shared/ui/sonner'
import { LegalGate } from './legal-gate'
import { MaintenanceGate } from './maintenance-gate'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <FeedbackHost>
          <MaintenanceGate />
          {children}
          <SignedInGates />
        </FeedbackHost>
      </SessionProvider>
      <Toaster />
    </QueryClientProvider>
  )
}

/** Gates that only make sense for someone signed in. */
function SignedInGates() {
  const { session } = useSession()
  return session && session.role !== 'ADMIN' ? <LegalGate /> : null
}
