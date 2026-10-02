import { NavLink, Outlet } from 'react-router'
import { cn } from '@/shared/lib/utils'

export type NavItem = { to: string; label: string }

export function AreaLayout({ title, nav }: { title: string; nav: NavItem[] }) {
  return (
    <div className="grid min-h-svh grid-cols-[15rem_1fr]">
      <aside className="border-r bg-sidebar p-4">
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
      </aside>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
