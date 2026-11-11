import { Navigate, useParams } from 'react-router'
import { NotFoundPage } from '@/pages/not-found'
import { CONTENT } from './content'
import { ResourceDocPage } from './page'
import { TABS, pagePath, sectionOf, tabPath, type TabKey } from './site'

const isTab = (x: string | undefined): x is TabKey => TABS.some((t) => t.key === x)

/** /resources and /resources/:tab open on the tab's first page; /resources/:tab/:section on the section's first page. */
export function ResourceIndexRedirect() {
  const { tab, section } = useParams()
  const key: TabKey = isTab(tab) ? tab : 'design'
  const s = section ? sectionOf(key, section) : undefined
  if (section && !s?.pages.length) return <NotFoundPage />
  return <Navigate to={s ? pagePath(key, s.key, s.pages[0].slug) : tabPath(key)} replace />
}

/** /resources/:tab/:section/:page, one written page. */
export function ResourcePage() {
  const { tab, section, page } = useParams()
  const doc = isTab(tab) ? CONTENT[tab][section ?? '']?.[page ?? ''] : undefined
  if (!doc || !isTab(tab)) return <NotFoundPage />
  return <ResourceDocPage key={`${tab}/${section}/${page}`} tab={tab} section={section!} slug={page!} doc={doc} />
}
