import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Context, PanelStore, usePanel } from './panel-context'

export function RightPanelProvider({ children }: { children: ReactNode }) {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [store] = useState(() => new PanelStore())
  return <Context.Provider value={{ host, setHost, store }}>{children}</Context.Provider>
}

/**
 * A page puts its supporting information in the right panel of the workspace: `<RightPanel>…</RightPanel>`.
 * Without it the panel shows the notification feed.
 */
export function RightPanel({ children }: { children: ReactNode }) {
  const { host, store } = usePanel()
  useEffect(() => store.add(), [store])
  return host ? createPortal(children, host) : null
}
