/**
 * The web app is one build served on three hosts: the public site (bonbon.com), the seller site (seller.bonbon.com) and the
 * admin site (admin.bonbon.com). On the seller and admin hosts the page paths have no prefix (seller.bonbon.com/orders).
 * Anywhere else (localhost, a preview deployment) all three live on one host and the seller and admin pages keep their
 * /seller and /admin prefixes, unless the build sets VITE_SUBDOMAINS=true, which keeps them off the public host.
 */
export type Site = 'public' | 'seller' | 'admin'

const labels = window.location.hostname.split('.')
const first = labels[0]

/** Which site the page is being served as, from the host name: seller.* and admin.* (at least two labels), else public. */
export const SITE: Site = labels.length >= 2 && (first === 'seller' || first === 'admin') ? first : 'public'

/** True when the seller and admin pages must only exist on their own hosts. */
export const SUBDOMAINS = import.meta.env.VITE_SUBDOMAINS === 'true'

/** The host without the seller. or admin. label: bonbon.com for seller.bonbon.com. */
const ROOT_HOST = SITE === 'public' ? window.location.hostname : labels.slice(1).join('.')
const PORT = window.location.port ? `:${window.location.port}` : ''

const inPathMode = SITE === 'public' && !SUBDOMAINS

function prefixed(site: 'seller' | 'admin', rest: string): string {
  if (SITE === site) return rest === '' ? '/' : rest
  return `/${site}${rest}`
}

/** A route inside the seller pages: sellerPath('/orders') is /orders on seller.*, /seller/orders elsewhere. For links within the seller site. */
export const sellerPath = (rest = ''): string => prefixed('seller', rest)

/** A route inside the admin pages: adminPath('/merchants') is /merchants on admin.*, /admin/merchants elsewhere. For links within the admin site. */
export const adminPath = (rest = ''): string => prefixed('admin', rest)

/**
 * Where a page of `site` lives, from wherever the person is now: a plain path when it is the same site (or all sites share the
 * host), else the full address on the other host. Use it with an <a href>, because it can leave the app.
 */
export function siteUrl(site: Site, rest = ''): string {
  const path = rest === '' ? '/' : rest
  if (site === SITE) return path
  if (inPathMode) return site === 'public' ? path : `/${site}${rest}`
  const host = site === 'public' ? ROOT_HOST : `${site}.${ROOT_HOST}`
  return `${window.location.protocol}//${host}${PORT}${path}`
}
