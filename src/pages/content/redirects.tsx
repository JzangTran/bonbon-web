import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router'
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
