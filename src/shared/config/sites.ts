/**
 * The web app is one build served on five hosts:
 *   bonbon.com           public site (landing, guides, blog, brand kit, legal texts)
 *   merchant.bonbon.com  sellers: open a shop, orders, menu, money
 *   help.bonbon.com      help center
 *   console.bonbon.com   administrators: shops, areas, categories, money, cases, content
 *   ops.bonbon.com       administrators: infrastructure (system status, app configuration)
 * On the four subdomains the page paths have no prefix (merchant.bonbon.com/orders). Anywhere else (localhost, a preview deployment)
 * everything lives on one host and the pages keep a prefix (/merchant/orders, /console/shops, /ops, /help), unless the build sets
 * VITE_SUBDOMAINS=true, which keeps them off the public host.
 */
export type Site = 'public' | 'merchant' | 'help' | 'console' | 'ops'

type Subdomain = Exclude<Site, 'public'>
const SUBDOMAINS_LIST: readonly Subdomain[] = ['merchant', 'help', 'console', 'ops']

const labels = window.location.hostname.split('.')
const first = labels[0] as Subdomain

/** Which site the page is being served as, from the host name: merchant.*, help.*, console.* or ops.* (at least two labels), else public. */
export const SITE: Site = labels.length >= 2 && SUBDOMAINS_LIST.includes(first) ? first : 'public'

/** True when the pages of the subdomains must only exist on their own hosts. */
export const SUBDOMAINS = import.meta.env.VITE_SUBDOMAINS === 'true'

/** The host without the subdomain label: bonbon.com for merchant.bonbon.com. */
const ROOT_HOST = SITE === 'public' ? window.location.hostname : labels.slice(1).join('.')
const PORT = window.location.port ? `:${window.location.port}` : ''

/** True on a host where every site lives together, each under its prefix. */
export const PATH_MODE = SITE === 'public' && !SUBDOMAINS

function prefixed(site: Subdomain, rest: string): string {
  if (SITE === site) return rest === '' ? '/' : rest
  return `/${site}${rest}`
}

/** A route inside the merchant pages: merchantPath('/orders') is /orders on merchant.*, /merchant/orders elsewhere. For links within the site. */
export const merchantPath = (rest = ''): string => prefixed('merchant', rest)

/** A route inside the console pages (admin: shops, content, money). */
export const consolePath = (rest = ''): string => prefixed('console', rest)

/** A route inside the ops pages (admin: infrastructure). */
export const opsPath = (rest = ''): string => prefixed('ops', rest)

/** A route inside the help center. */
export const helpPath = (rest = ''): string => prefixed('help', rest)

/**
 * Where a page of `site` lives, from wherever the person is now: a plain path when it is the same site (or all sites share the host),
 * else the full address on the other host. Use it with an <a href>, because it can leave the app.
 */
export function siteUrl(site: Site, rest = ''): string {
  const path = rest === '' ? '/' : rest
  if (site === SITE) return path
  if (PATH_MODE) return site === 'public' ? path : `/${site}${rest}`
  const host = site === 'public' ? ROOT_HOST : `${site}.${ROOT_HOST}`
  return `${window.location.protocol}//${host}${PORT}${path}`
}

/** The origin a site is served from, for canonical addresses (the public site's comes from the build when it is known). */
export function siteOrigin(site: Site): string {
  const url = siteUrl(site, '/')
  return url.startsWith('http') ? url.replace(/\/$/, '') : window.location.origin
}
