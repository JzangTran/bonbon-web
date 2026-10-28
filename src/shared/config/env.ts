export const env = {
  /** Empty = same origin (Vite dev proxy, or Caddy in production). Set VITE_API_URL only for a separate API host. */
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  /** reCAPTCHA v2 site key; without it a development stand-in is shown (the dev backend accepts any token). */
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '',
  /** Google OAuth web client ID (public); without it the Google button is hidden. */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
} as const

/** The interactive API reference (Scalar) and the OpenAPI document, served by the backend next to /api. */
export const API_REFERENCE_URL = `${env.apiUrl}/scalar`
export const OPENAPI_URL = `${env.apiUrl}/v3/api-docs`
