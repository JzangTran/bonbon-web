import type { ExtraPage, NavChild, NavParent } from './types'

export type Location = {
  parent?: NavParent
  /** the nav row, or the extra page, that the current path belongs to */
  page?: { to: string; label: string }
}

const matches = (path: string, to: string) => path === to || path.startsWith(`${to}/`)

/** Finds the nav row (or extra page) with the longest route that contains the path; `/seller/orders/cancelled` beats `/seller/orders`. */
export function locate(path: string, nav: NavParent[], extras: ExtraPage[]): Location {
  let best: { len: number; loc: Location } | undefined
  const consider = (to: string, loc: Location) => {
    if (matches(path, to) && (!best || to.length > best.len)) best = { len: to.length, loc }
  }
  for (const parent of nav) {
    if (parent.to) consider(parent.to, { parent, page: { to: parent.to, label: parent.label } })
    for (const child of parent.children ?? []) consider(child.to, { parent, page: child as NavChild })
  }
  for (const extra of extras) {
    if (extra.under) {
      const parent = nav.find((p) => p.to === extra.under || p.children?.some((c) => c.to === extra.under))
      const page = parent?.to === extra.under ? { to: parent.to, label: parent.label } : parent?.children?.find((c) => c.to === extra.under)
      if (parent && page) {
        consider(extra.to, { parent, page })
        continue
      }
    }
    const parent = nav.find((p) => p.key === extra.parentKey)
    consider(extra.to, { parent, page: extra })
  }
  return best?.loc ?? {}
}
