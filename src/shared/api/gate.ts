import { useSyncExternalStore } from 'react'

/**
 * What the server said that blocks the whole app, not just one call: the legal documents the person has to accept again
 * (403 LEGAL_ACCEPTANCE_REQUIRED) or maintenance (503 MAINTENANCE). The API client reports it here; the app gate shows it.
 */
export type GateState = {
  /** When a call was last refused because documents are waiting; null once they have been accepted. */
  legalRequiredAt: number | null
  /** When a call was last refused because the system is in full maintenance. */
  maintenanceAt: number | null
}

let state: GateState = { legalRequiredAt: null, maintenanceAt: null }
const listeners = new Set<() => void>()

function set(next: GateState) {
  state = next
  listeners.forEach((l) => l())
}

export function reportLegalRequired() {
  set({ ...state, legalRequiredAt: Date.now() })
}

export function clearLegalRequired() {
  set({ ...state, legalRequiredAt: null })
}

export function reportMaintenance() {
  set({ ...state, maintenanceAt: Date.now() })
}

export function useGateState(): GateState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
  )
}
