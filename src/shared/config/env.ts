export const env = {
  /** Empty = same origin (Vite dev proxy, or Caddy in production). Set VITE_API_URL only for a separate API host. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  /** reCAPTCHA v2 site key; without it a development stand-in is shown (the dev backend accepts any token). */
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '',
} as const
