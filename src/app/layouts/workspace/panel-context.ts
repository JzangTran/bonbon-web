import { createContext, useContext, useSyncExternalStore } from 'react'

/** Counts how many pages currently supply their own right-panel content; the shell shows the default feed when it is zero. */
export class PanelStore {
  private count = 0
  private listeners = new Set<() => void>()
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  getSnapshot = () => this.count
  add = () => {
    this.count++
    this.listeners.forEach((l) => l())
    return () => {
      this.count--
      this.listeners.forEach((l) => l())
    }
  }
}

export type PanelContext = { host: HTMLElement | null; setHost: (node: HTMLElement | null) => void; store: PanelStore }
export const Context = createContext<PanelContext | null>(null)

export function usePanel() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('RightPanelProvider is missing')
  return ctx
}

/** For the shell: the element the pages' panel content is rendered into, and whether any page has supplied content. */
export function usePanelHost() {
  const { setHost, store } = usePanel()
  const custom = useSyncExternalStore(store.subscribe, store.getSnapshot) > 0
  return { setHost, custom }
}
