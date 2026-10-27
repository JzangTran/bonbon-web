# bonbon-web

React 19 + Vite. The public site, the merchant, help, console and ops sites in one build.

```bash
npm install
npm run dev      # http://localhost:5173, the API is proxied from http://localhost:8080
```

## Five sites, one build

| Site | Production host | For | Development |
|---|---|---|---|
| Public | `bonbon.com` | landing, guides, blog, brand kit, legal texts | `http://localhost:5173/` |
| Merchant | `merchant.bonbon.com` | sellers: open a shop, orders, menu, money | `http://merchant.localhost:5173/` or `/merchant/…` |
| Help | `help.bonbon.com` | help center | `http://help.localhost:5173/` or `/help` |
| Console | `console.bonbon.com` | administrators: shops, areas, categories, money, cases, content | `http://console.localhost:5173/` or `/console/…` |
| Ops | `ops.bonbon.com` | administrators: infrastructure (system status, app configuration) | `http://ops.localhost:5173/` or `/ops/…` |

The host name decides which pages are served (`src/shared/config/sites.ts`). On the four subdomains the paths have no prefix. On any other host the
pages keep their prefixes (development, preview deployments), unless the build sets `VITE_SUBDOMAINS=true`, which removes them from the public
host. Pages that every host needs (email links, legal texts, payment return) exist on all of them.

In code, never write `/merchant/...`, `/console/...`, `/ops/...` or `/help/...` by hand: use `merchantPath('/orders')`, `consolePath('/shops')`,
`opsPath('/app-config')` and `helpPath('/bai-viet/…')` for links inside a site, and `siteUrl('merchant', '/login')` (with `<a href>`) for links from one site
to another. The ops site needs the `ops:read` permission (the main administrators have it); console and ops each keep their own sign-in.

## Deploy on Cloudflare Pages

1. Create one Pages project from the repository: build command `npm run build`, output directory `dist`.
2. Build environment variables (public values only):

   | Variable | Value |
   |---|---|
   | `VITE_SUBDOMAINS` | `true` |
   | `VITE_API_URL` | the API origin, e.g. `https://api.bonbon.com` |
   | `VITE_SITE_URL` | `https://bonbon.com` (canonical URL, sitemap) |
   | `VITE_GOOGLE_CLIENT_ID`, `VITE_RECAPTCHA_SITE_KEY`, `VITE_SUPPORT_EMAIL` | as needed |

3. Add five custom domains to the same project: `bonbon.com`, `merchant.bonbon.com`, `help.bonbon.com`, `console.bonbon.com`, `ops.bonbon.com`. Pages answers every
   unknown path with `index.html`, so deep links such as `merchant.bonbon.com/orders` work. The Functions in `functions/` give each host its own robots.txt and sitemap.xml.
4. Backend: `BONBON_CORS_ORIGINS` lists all five origins (https://bonbon.com, https://merchant.bonbon.com, https://help.bonbon.com, https://console.bonbon.com,
   https://ops.bonbon.com; the WebSocket uses the same list), `BONBON_WEB_URL=https://bonbon.com`, `BONBON_MERCHANT_URL=https://merchant.bonbon.com`.
5. Google sign-in: add the merchant origin (and the public one) to the OAuth client's authorized JavaScript origins. reCAPTCHA: add the domains.
6. Each host keeps its own sign-in (browser storage is per origin), so a seller and an administrator can be signed in at the same time, and console and ops need separate sign-ins.
