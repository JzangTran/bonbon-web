import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router'
import { LEGACY_SLUGS } from '@/entities/article'
import { legalUrl, siteUrl } from '@/shared/config/sites'

/** Sends the browser to an address that may be on another bonbon site (another host in production). */
function Away({ to }: { to: string }) {
  const external = /^https?:/.test(to)
  useEffect(() => {
    if (external) window.location.replace(to)
  }, [external, to])
  return external ? null : <Navigate to={to} replace />
}

/** /legal/:type, the old address of a legal document, now on the help site. */
export function LegacyLegalRedirect() {
  const { type } = useParams()
  return <Away to={legalUrl(type ?? '')} />
}

/** The seller's old in-workspace help page: the help center is shared on the help site. */
export function HelpSiteRedirect() {
  return <Away to={siteUrl('help')} />
}

// Old Vietnamese addresses, kept so links in emails, bookmarks and search results still land on the right page.
const OLD_COLLECTIONS: Record<string, string> = { 'bat-dau': 'getting-started', 'quan-ly-cua-hang': 'manage-your-shop' }
const OLD_COMPONENTS: Record<string, string> = {
  nut: 'button',
  'lien-ket': 'text-link',
  'o-nhap': 'input',
  'lua-chon-nhanh': 'segmented',
  tab: 'page-tabs',
  'phan-trang': 'pagination',
  'nhan-trang-thai': 'badge',
  bang: 'table',
  'so-lieu': 'stat-tile',
  'bieu-do': 'chart-panel',
}

/** The new English address of an old Vietnamese one (without the help site's /help prefix), or null when there is none. */
function modernPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean)
  const [head, a, b] = parts
  if (head === 'huong-dan') {
    if (!a) return '/guides'
    const collection = OLD_COLLECTIONS[a]
    if (!collection) return '/guides'
    // a guide that no longer exists goes to its collection
    return b && LEGACY_SLUGS[b] ? `/guides/${collection}/${LEGACY_SLUGS[b]}` : `/guides/${collection}`
  }
  if (head === 'blog' && a && LEGACY_SLUGS[a]) return `/blog/${LEGACY_SLUGS[a]}`
  if (head === 'nha-phat-trien') return '/resources/developers'
  if (head === 'bo-nhan-dien') {
    if (a === 'components') return b ? `/resources/design/components/${OLD_COMPONENTS[b] ?? b}` : '/resources/design/components'
    return a && b ? `/resources/design/${a}/${b}` : '/resources/design'
  }
  if (head === 'bai-viet' && a) return `/articles/${a}`
  if (head === 'lien-he') return '/contact'
  if (head === 'phap-ly') return a ? `/legal/${a}` : '/legal'
  return null
}

/** Sends an old Vietnamese address to its English one, keeping the #heading; `prefix` is the help site's path prefix in development. */
export function LegacyRedirect({ prefix = '' }: { prefix?: string }) {
  const { pathname, hash } = useLocation()
  const base = prefix.replace(/\/$/, '')
  const next = modernPath(pathname.slice(base.length))
  return <Navigate to={next ? `${base}${next}${hash}` : '/'} replace />
}
