const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, '')

/** The address a page is known by: the public origin when the build knows it, else the one it is served from. */
export const absoluteUrl = (path: string) => `${SITE_URL ?? window.location.origin}${path}`
