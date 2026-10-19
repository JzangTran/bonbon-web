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

export type SlotsContext = {
  panelHost: HTMLElement | null
  setPanelHost: (node: HTMLElement | null) => void
  tabsHost: HTMLElement | null
  setTabsHost: (node: HTMLElement | null) => void
  store: PanelStore
}
export const Context = createContext<SlotsContext | null>(null)

/** The slots, or null outside the workspace shell (pages then render their tabs inline). */
export function useSlots() {
  return useContext(Context)
}

/** For the shell: the elements the pages' tabs and panel content are rendered into, and whether any page supplied panel content. */
export function useSlotHosts() {
  const ctx = useContext(Context)
  if (!ctx) throw new Error('WorkspaceSlotsProvider is missing')
  const custom = useSyncExternalStore(ctx.store.subscribe, ctx.store.getSnapshot) > 0
  return { setPanelHost: ctx.setPanelHost, setTabsHost: ctx.setTabsHost, custom }
}
