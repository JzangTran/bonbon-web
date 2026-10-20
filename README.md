# bonbon-web

React 19 + Vite. Public landing site, seller site and admin site in one build.

```bash
npm install
npm run dev      # http://localhost:5173, the API is proxied from http://localhost:8080
```

## Three sites, one build

| Site | Production host | Development |
|---|---|---|
| Public (landing, legal texts) | `bonbon.com` | `http://localhost:5173/` |
| Seller | `seller.bonbon.com` (`/login`, `/orders`, …) | `http://seller.localhost:5173/` or `http://localhost:5173/seller/…` |
| Admin | `admin.bonbon.com` (`/login`, `/merchants`, …) | `http://admin.localhost:5173/` or `http://localhost:5173/admin/…` |

The host name decides which pages are served (`src/shared/config/sites.ts`). On `seller.*` and `admin.*` the paths have no prefix. On any other host
the seller and admin pages keep their `/seller` and `/admin` prefixes (development, preview deployments), unless the build sets `VITE_SUBDOMAINS=true`,
which removes them from the public host. Pages that every host needs (email links, legal texts, payment return) exist on all three.

In code, never write `/seller/...` or `/admin/...` by hand: use `sellerPath('/orders')` and `adminPath('/merchants')` for links inside a site, and
`siteUrl('seller', '/login')` (with `<a href>`) for links from one site to another.

## Deploy on Cloudflare Pages

1. Create one Pages project from the repository: build command `npm run build`, output directory `dist`.
2. Build environment variables (public values only):

   | Variable | Value |
   |---|---|
   | `VITE_SUBDOMAINS` | `true` |
   | `VITE_API_URL` | the API origin, e.g. `https://api.bonbon.com` |
   | `VITE_SITE_URL` | `https://bonbon.com` (canonical URL, sitemap) |
   | `VITE_GOOGLE_CLIENT_ID`, `VITE_RECAPTCHA_SITE_KEY`, `VITE_SUPPORT_EMAIL` | as needed |

3. Add three custom domains to the same project: `bonbon.com`, `seller.bonbon.com`, `admin.bonbon.com`. Pages answers every unknown path with
   `index.html`, so deep links such as `seller.bonbon.com/orders` work.
4. Backend: `BONBON_CORS_ORIGINS=https://bonbon.com,https://seller.bonbon.com,https://admin.bonbon.com` (the WebSocket uses the same list),
   `BONBON_WEB_URL=https://bonbon.com`, `BONBON_SELLER_URL=https://seller.bonbon.com`.
5. Google sign-in: add the seller origin (and the public one) to the OAuth client's authorized JavaScript origins. reCAPTCHA: add the three domains.
6. Each host keeps its own sign-in (browser storage is per origin), so a seller and an admin can be signed in at the same time.
