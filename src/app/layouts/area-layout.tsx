import { LogOutIcon } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

export type NavItem = { to: string; label: string }

export function AreaLayout({ title, nav, loginPath }: { title: string; nav: NavItem[]; loginPath: string }) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut()
    navigate(loginPath, { replace: true })
  }

  return (
    <div className="grid min-h-svh grid-cols-[15rem_1fr]">
      <aside className="flex flex-col border-r bg-sidebar p-4">
        <p className="mb-6 text-xl font-bold text-brand-600">bonbon</p>
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{title}</p>
        <nav className="flex flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-2 text-sm',
                  isActive ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground' : 'hover:bg-muted',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t pt-4">
          <div className="text-sm">
            <p className="font-medium">{session?.name || session?.email}</p>
            <p className="truncate text-muted-foreground">{session?.email}</p>
          </div>
          <Button variant="ghost" onClick={logout} className="justify-start">
            <LogOutIcon /> Đăng xuất
          </Button>
        </div>
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
