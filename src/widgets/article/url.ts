import { siteOrigin, type Site } from '@/shared/config/sites'

const PUBLIC_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, '')

/** The address a page is known by: the public origin when the build knows it, else the origin of the site the page belongs to. */
export const absoluteUrl = (path: string, site: Site = 'public') => `${site === 'public' && PUBLIC_URL ? PUBLIC_URL : siteOrigin(site)}${path}`
