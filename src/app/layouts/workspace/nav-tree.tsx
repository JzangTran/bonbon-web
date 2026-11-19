import { HomeIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/utils'
import type { Location } from './locate'
import type { NavParent } from './types'
import { t } from '@/shared/i18n'

/** A page row on the grey pane (Fluent nav): the current one on a white tile, semibold, with a short blue mark at its left. */
const rowClass = (current: boolean) =>
  cn(
    'relative flex min-h-8 items-center rounded-control py-1.5 pr-2 pl-3 text-body-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    current
      ? 'bg-background font-semibold text-ink before:absolute before:top-1/2 before:left-0 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary'
      : 'text-text-secondary hover:bg-surface-strong hover:text-ink',
  )

/**
 * The left navigation on the grey pane (after Teams and the Fluent nav drawer): the home page on top, then each group under a
 * small label. A single-page parent is a row of its own. Every group stays open.
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
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-0.5 empty:hidden">
        {homePath ? (
          <li>
            <NavLink to={homePath} end onClick={onNavigate} aria-current={atHome ? 'page' : 'false'} className={rowClass(atHome)}>
              <HomeIcon className="mr-2.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              {t('Trang chủ')}
            </NavLink>
          </li>
        ) : null}
        {singles.map((parent) => {
          const Icon = parent.icon
          const current = location.page?.to === parent.to
          return (
            <li key={parent.key}>
              <NavLink to={parent.to!} end onClick={onNavigate} aria-current={current ? 'page' : 'false'} className={rowClass(current)}>
                <Icon className="mr-2.5 size-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                {parent.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
      {groups.map((parent) => (
        <section key={parent.key} aria-labelledby={`nav-${parent.key}`} className="flex flex-col gap-1">
          <h2 id={`nav-${parent.key}`} className="pl-3 text-caption font-semibold text-text-tertiary">
            {parent.label}
          </h2>
          <ul className="flex flex-col gap-0.5">
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
