import { LogOutIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export type NavItem = { to: string; label: string }

/**
 * Shell for the seller and admin areas: a sidebar from md up, a scrollable top bar below.
 * `tone="dark"` scopes the dark token set to the sidebar so the admin area reads differently.
 */
export function AreaLayout({ title, nav, loginPath, tone = 'light' }: {
  title: string
  nav: NavItem[]
  loginPath: string
  tone?: 'light' | 'dark'
}) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut()
    navigate(loginPath, { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside
        className={cn(
          'flex flex-col gap-3 border-b bg-sidebar p-3 text-sidebar-foreground md:sticky md:top-0 md:h-svh md:gap-0 md:border-r md:border-b-0 md:p-4',
          tone === 'dark' && 'dark',
        )}
      >
        <div className="flex items-baseline gap-2 md:mb-6 md:flex-col md:gap-0">
          <p className="text-2xl font-extrabold tracking-tight text-primary">bonbon</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        <nav aria-label={title} className="-mx-1 flex gap-1 overflow-x-auto px-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-sm px-3 py-2 text-sm font-medium whitespace-nowrap',
                  isActive
                    ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground md:shadow-[inset_3px_0_0_var(--sidebar-primary)]'
                    : 'hover:bg-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t pt-3 md:mt-auto md:flex-col md:items-stretch md:pt-4">
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{session?.name || session?.email}</p>
            <p className="hidden truncate text-muted-foreground md:block">{session?.email}</p>
          </div>
          <Button variant="ghost" onClick={logout} className="md:justify-start">
            <LogOutIcon /> Đăng xuất
          </Button>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}
