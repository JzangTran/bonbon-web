/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_RECAPTCHA_SITE_KEY?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  /** Public support address shown in the landing footer; omitted when unset. */
  readonly VITE_SUPPORT_EMAIL?: string
  /** Public origin (e.g. https://example.vn) for canonical URLs, robots.txt and sitemap.xml. */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
