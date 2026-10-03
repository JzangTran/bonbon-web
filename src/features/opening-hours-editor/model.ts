export type OpeningWindow = { weekday: number; opensAt: string; closesAt: string }

/** "06:00:00" from the API to the "06:00" an <input type="time"> uses. */
export function toEditorWindows(hours: { weekday?: number; opensAt?: string; closesAt?: string }[] | undefined): OpeningWindow[] {
  return (hours ?? []).map((h) => ({
    weekday: h.weekday ?? 1,
    opensAt: (h.opensAt ?? '00:00').slice(0, 5),
    closesAt: (h.closesAt ?? '00:00').slice(0, 5),
  }))
}
