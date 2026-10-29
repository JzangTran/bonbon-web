import { t } from '@/shared/i18n'
import { useSyncExternalStore } from 'react'

/**
 * Text size chosen by the person. It scales the page root, so everything written in rem follows (text, spacing, controls), on top
 * of the browser's own default size and zoom. WCAG 2.2 success criterion 1.4.4 (Resize Text, up to 200 %) and 1.4.10 (Reflow)
 * are met by the layout reflowing at these sizes; the three levels here are shortcuts for people who do not know the browser setting.
 */
export const TEXT_SCALES = [
  { id: 'normal', label: t('Chuẩn'), percent: 100 },
  { id: 'large', label: t('Lớn'), percent: 125 },
  { id: 'xlarge', label: t('Rất lớn'), percent: 150 },
] as const
export type TextScaleId = (typeof TEXT_SCALES)[number]['id']

const KEY = 'bonbon.textScale'
const listeners = new Set<() => void>()

function read(): TextScaleId {
  try {
    const id = localStorage.getItem(KEY)
    return TEXT_SCALES.some((s) => s.id === id) ? (id as TextScaleId) : 'normal'
  } catch {
    return 'normal'
  }
}

function apply(id: TextScaleId) {
  const percent = TEXT_SCALES.find((s) => s.id === id)?.percent ?? 100
  document.documentElement.style.fontSize = percent === 100 ? '' : `${percent}%`
  // The CSS breakpoints of the workspace shell (index.css: wsnav, wspanel) follow this.
  document.documentElement.dataset.textScale = id
}

let current = read()

/** Applies the saved size; called once before the first render. */
export function initTextScale() {
  apply(current)
}

export function setTextScale(id: TextScaleId) {
  current = id
  apply(id)
  try {
    localStorage.setItem(KEY, id)
  } catch {
    // The size still applies for this visit.
  }
  listeners.forEach((l) => l())
}

/** The factor of the current size (1, 1.25, 1.5): widths measured in px for layout decisions are multiplied by it. */
export function textScaleFactor(id: TextScaleId): number {
  return (TEXT_SCALES.find((s) => s.id === id)?.percent ?? 100) / 100
}

export function useTextScale(): TextScaleId {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}
