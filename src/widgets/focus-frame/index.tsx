import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { merchantPath } from '@/shared/config/sites'
import { TextSizeControl } from '@/shared/ui/text-size-control'

type Props = {
  /** what the person is doing, shown in the bar next to the logo */
  title: string
  /** where "Thoát" goes; without it the bar offers "Đăng xuất" instead (a flow nobody can leave to the workspace yet) */
  exitTo?: string
  loginPath?: string
  width?: 'md' | 'lg'
  /** the task is one card: drop the card's own frame and title (the page already has them) */
  flat?: boolean
  children: ReactNode
}

/**
 * A page for one task that needs the person's whole attention (open the shop, close it, delete the account): a slim black bar,
 * the task on a white block, and nothing else. No navigation, no panel, no footer; the only way out is in the bar.
 */
export function FocusFrame({ title, exitTo, loginPath = merchantPath('/login'), width = 'md', flat = false, children }: Props) {
  const { signOut } = useSession()
  const navigate = useNavigate()
  const barButton = 'rounded-md px-3 py-1.5 text-[0.8125rem] font-medium text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white'
  return (
    <div className="ws-root flex min-h-svh flex-col bg-ws-ground text-[0.8125rem]">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-card px-3 py-2 text-sm font-semibold text-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Bỏ qua đến nội dung chính
      </a>
      <header className="flex h-12 shrink-0 items-center justify-between gap-4 bg-ws-header px-4 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Lockup tone="white" className="h-7" />
          <span aria-hidden="true" className="h-4 w-px bg-white/15" />
          <span className="truncate font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-1">
        <TextSizeControl tone="light" className="[&>span]:hidden sm:[&>span]:inline [&_button]:size-7" />
        {exitTo ? (
          <Link to={exitTo} className={barButton}>
            Thoát
          </Link>
        ) : (
          <button
            type="button"
            className={barButton}
            onClick={async () => {
              await signOut().catch(() => undefined)
              navigate(loginPath, { replace: true })
            }}
          >
            Đăng xuất
          </button>
        )}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 p-3 outline-none sm:p-6">
        <div
          className={cn(
            'mx-auto bg-card p-5 sm:p-8',
            width === 'lg' ? 'max-w-4xl' : 'max-w-2xl',
            flat && '[&_[data-slot=card]]:gap-5 [&_[data-slot=card]]:py-0 [&_[data-slot=card]]:ring-0 [&_[data-slot=card-content]]:px-0 [&_[data-slot=card-header]]:px-0 [&_[data-slot=card-title]]:sr-only',
          )}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
