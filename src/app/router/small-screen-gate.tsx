import { Outlet, useLocation } from 'react-router'
import { pageAudience } from '@/shared/config/sites'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { GetTheAppPage } from '@/pages/get-the-app'

/** Below this width (tablets and phones) only the public pages open; everything else asks for the app (or, for staff, a computer). */
const SMALL = '(max-width: 1023.98px)'

/** The root of every route: on a small screen, a page that is not public is replaced by the invitation, wherever the link came from. */
export function SmallScreenGate() {
  const small = useMediaQuery(SMALL)
  const { pathname } = useLocation()
  const audience = pageAudience(pathname)
  if (small && audience !== 'public') return <GetTheAppPage audience={audience} />
  return <Outlet />
}
