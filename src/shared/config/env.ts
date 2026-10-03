export const env = {
  /** Empty = same origin (Vite dev proxy, or Caddy in production). Set VITE_API_URL only for a separate API host. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  /** reCAPTCHA v2 site key; without it a development stand-in is shown (the dev backend accepts any token). */
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '',
  /** Google OAuth web client ID (public); without it the Google button is hidden. */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
} as const
