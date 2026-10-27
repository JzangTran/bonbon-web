import { HomeIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/utils'
import type { Location } from './locate'
import type { NavParent } from './types'

/** A page row on the rail: grey text, the current one in orange with an orange piece of the rail beside it. */
const rowClass = (current: boolean) =>
  cn(
    '-ml-px flex min-h-8 items-center rounded-r-2xl border-l py-1.5 pr-1.5 pl-3 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    current ? 'border-primary font-medium text-primary' : 'border-transparent text-ink/65 hover:border-grey-400 hover:text-ink',
  )

/**
 * The left navigation, after the GitBook docs sidebar: a thin rail down the left, the home page on top, then each group under a
 * small upper-case label with its pages on the rail. A single-page parent is a row of its own. Every group stays open.
 */
export function NavTree({ nav, location, homePath, onNavigate }: {
  nav: NavParent[]
  location: Location
  /** the workspace home, shown as the first row in the first space only */
  homePath?: string
  onNavigate?: () => void
}) {
  const atHome = !location.page
  const singles = nav.filter((p) => !p.children)
  const groups = nav.filter((p) => p.children)
  return (
    <div className="flex flex-col gap-6 border-l border-grey-200">
      <ul className="flex flex-col empty:hidden">
        {homePath ? (
          <li>
            <NavLink to={homePath} end onClick={onNavigate} aria-current={atHome ? 'page' : 'false'} className={rowClass(atHome)}>
              <HomeIcon className="mr-2.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              Trang chủ
            </NavLink>
          </li>
        ) : null}
        {singles.map((parent) => {
          const Icon = parent.icon
          const current = location.page?.to === parent.to
          return (
            <li key={parent.key}>
              <NavLink to={parent.to!} end onClick={onNavigate} aria-current={current ? 'page' : 'false'} className={rowClass(current)}>
                <Icon className="mr-2.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {parent.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
      {groups.map((parent) => (
        <section key={parent.key} aria-labelledby={`nav-${parent.key}`} className="flex flex-col gap-1">
          <h2 id={`nav-${parent.key}`} className="pl-3 text-caption font-medium tracking-wide text-ink uppercase">
            {parent.label}
          </h2>
          <ul className="flex flex-col">
            {parent.children!.map((child) => {
              const current = location.page?.to === child.to
              return (
                <li key={child.to}>
                  <NavLink to={child.to} onClick={onNavigate} aria-current={current ? 'page' : 'false'} className={rowClass(current)}>
                    {child.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
