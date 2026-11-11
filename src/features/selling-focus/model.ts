import { useSyncExternalStore } from 'react'

/**
 * "Bán hàng tập trung": a seller's mode for the busy hours. The workspace keeps only what selling needs (orders, chat, what is
 * sold out) and drops everything else. A preference of this device, not a secret: it stays in localStorage, and other tabs follow.
 */
const KEY = 'bonbon.merchant.sellingFocus'
const EVENT = 'bonbon:selling-focus'

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, onChange)
  }
}

export function setSellingFocus(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, 'on')
    else localStorage.removeItem(KEY)
  } catch {
    // storage blocked: the mode still switches for this page view
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Whether selling focus is on for this device. */
export function useSellingFocus(): boolean {
  return useSyncExternalStore(subscribe, read, () => false)
}
