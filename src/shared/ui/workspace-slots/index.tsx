import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { Context, PanelStore, useSlots } from './context'

export function WorkspaceSlotsProvider({ children }: { children: ReactNode }) {
  const [panelHost, setPanelHost] = useState<HTMLElement | null>(null)
  const [tabsHost, setTabsHost] = useState<HTMLElement | null>(null)
  const [store] = useState(() => new PanelStore())
  return <Context.Provider value={{ panelHost, setPanelHost, tabsHost, setTabsHost, store }}>{children}</Context.Provider>
}

/**
 * A page puts its supporting information in the right panel of the workspace: `<RightPanel>…</RightPanel>`.
 * Without it the panel shows the notification feed.
 */
export function RightPanel({ children }: { children: ReactNode }) {
  const slots = useSlots()
  const store = slots?.store
  useEffect(() => store?.add(), [store])
  return slots?.panelHost ? createPortal(children, slots.panelHost) : null
}

export type PageTab = {
  id: string
  label: string
  /** a route: the tab is a link and is selected by the URL (tabs that are separate pages) */
  to?: string
  /** for `to` tabs: overrides the URL match (a tab that also owns sub-routes) */
  active?: boolean
  /** a count shown next to the label, hidden when 0 */
  count?: number
  /** highlights the count (something waits for the person) */
  alert?: boolean
}

type Props = {
  label: string
  tabs: PageTab[]
  /** the selected tab for tabs without `to` */
  value?: string
  onValueChange?: (id: string) => void
}

const tabClass =
  'relative flex h-11 shrink-0 items-center gap-2 rounded-t-md px-4 text-ui text-muted-foreground outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
const selectedClass = 'font-medium text-primary shadow-[inset_0_-2px_0_0_var(--color-primary)]'

/**
 * The tab bar of a workspace page: a white block of its own above the content block. One tab per business concern; the thin
 * line under every tab, a 2 px green line under the selected one, same text color, bold only when selected.
 * Tabs with `to` are separate pages (links); tabs without are switched in place (`value` and `onValueChange`).
 */
export function PageTabs({ label, tabs, value, onValueChange }: Props) {
  const slots = useSlots()
  const content = tabs.some((t) => t.to) ? (
    <nav aria-label={label} className="flex overflow-x-auto bg-card">
      {tabs.map((t) => (
        <NavLink
          key={t.id}
          to={t.to!}
          end
          aria-current={t.active === undefined ? undefined : t.active ? 'page' : undefined}
          className={({ isActive }) => cn(tabClass, (t.active ?? isActive) && selectedClass)}
        >
          <TabLabel tab={t} />
        </NavLink>
      ))}
      <span aria-hidden="true" className="min-w-0 flex-1" />
    </nav>
  ) : (
    <div role="tablist" aria-label={label} className="flex overflow-x-auto bg-card">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          onClick={() => onValueChange?.(t.id)}
          className={cn(tabClass, value === t.id && selectedClass)}
        >
          <TabLabel tab={t} />
        </button>
      ))}
      <span aria-hidden="true" className="min-w-0 flex-1" />
    </div>
  )
  if (!slots) return content
  return slots.tabsHost ? createPortal(content, slots.tabsHost) : null
}

/** The label reserves the width of its bold form so the row does not shift when a tab gets selected. */
function TabLabel({ tab }: { tab: PageTab }) {
  return (
    <>
      <span data-label={tab.label} className="before:invisible before:block before:h-0 before:overflow-hidden before:font-semibold before:content-[attr(data-label)]">
        {tab.label}
      </span>
      {tab.count ? (
        <span className={cn('rounded-full px-1.5 text-[0.6875rem] font-semibold tabular-nums', tab.alert ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>{tab.count}</span>
      ) : null}
    </>
  )
}
