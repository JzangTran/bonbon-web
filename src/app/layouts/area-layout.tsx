import { ChevronDownIcon, LogOutIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export type NavItem = { to: string; label: string }
/** A section of the sidebar: a heading with its own icon, and the pages under it. A group without a title is just links. */
export type NavGroup = { title?: string; icon?: ReactNode; items: NavItem[] }

/**
 * Shell for the seller and admin areas: a white top bar (logo, area name, account), a sidebar of grouped sections
 * from md up and a scrollable strip of the same links below that, on a light grey canvas for white cards.
 * `tone="dark"` scopes the dark token set to the sidebar so the admin area reads differently.
 */
export function AreaLayout({ title, nav, loginPath, tone = 'light' }: {
  title: string
  nav: NavGroup[]
  loginPath: string
  tone?: 'light' | 'dark'
}) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut()
    navigate(loginPath, { replace: true })
  }
  const initial = (session?.name || session?.email || '?').trim().charAt(0).toUpperCase()
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'shrink-0 rounded-sm px-3 py-2 text-sm whitespace-nowrap',
      isActive
        ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground md:shadow-[inset_3px_0_0_var(--sidebar-primary)]'
        : 'hover:bg-muted',
    )

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-card">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold tracking-tight text-primary">bonbon</span>
            <span className="text-base">{title}</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                {initial}
              </span>
              <span className="hidden max-w-48 truncate text-sm sm:block">{session?.name || session?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOutIcon /> <span className="hidden sm:inline">Đăng xuất</span>
              <span className="sr-only sm:hidden">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:grid md:grid-cols-[14.5rem_minmax(0,1fr)]">
        <aside
          className={cn(
            'border-b bg-sidebar p-2 text-sidebar-foreground md:sticky md:top-14 md:h-[calc(100svh-3.5rem)] md:overflow-y-auto md:border-r md:border-b-0 md:p-3',
            tone === 'dark' && 'dark',
          )}
        >
          <nav aria-label={title} className="-mx-1 flex gap-1 overflow-x-auto px-1 md:hidden">
            {nav
              .flatMap((group) => group.items)
              .map((item) => (
                <NavLink key={item.to} to={item.to} end className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
          </nav>
          <nav aria-label={title} className="hidden flex-col gap-1 md:flex">
            {nav.map((group, index) =>
              group.title ? (
                <details key={group.title} open className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted [&::-webkit-details-marker]:hidden">
                    <span className="text-primary [&_svg]:size-4">{group.icon}</span>
                    <span className="flex-1">{group.title}</span>
                    <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-not-open:-rotate-90" />
                  </summary>
                  <div className="mt-0.5 flex flex-col gap-0.5 pl-6">
                    {group.items.map((item) => (
                      <NavLink key={item.to} to={item.to} end className={linkClass}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </details>
              ) : (
                <div key={index} className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <NavLink key={item.to} to={item.to} end className={(state) => cn(linkClass(state), 'font-semibold')}>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              ),
            )}
          </nav>
        </aside>
        <main className="min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
