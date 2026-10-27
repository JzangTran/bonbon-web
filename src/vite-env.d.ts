/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  /** Public support address shown in the landing footer; omitted when unset. */
  readonly VITE_SUPPORT_EMAIL?: string
  /** Public origin (e.g. https://example.vn) for canonical URLs, robots.txt and sitemap.xml. */
  readonly VITE_SITE_URL?: string
  /** "true" in the production build: the pages of merchant.*, help.*, console.* and ops.* live only on their own hosts, not under /merchant, /help, /console and /ops of the public host. */
  readonly VITE_SUBDOMAINS?: string
}

declare const __APP_VERSION__: string

interface ImportMeta {
  readonly env: ImportMetaEnv
}
