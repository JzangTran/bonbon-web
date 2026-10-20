import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Public, indexable pages; the seller/admin areas and auth pages stay out of search. */
const PUBLIC_PATHS = ['/', '/legal/CUSTOMER_TERMS', '/legal/SELLER_TERMS', '/legal/PRIVACY_POLICY']

/** Emits robots.txt always, and sitemap.xml when VITE_SITE_URL (the public origin) is set for the build. */
function seoFiles(siteUrl: string | undefined): Plugin {
  return {
    name: 'bonbon-seo-files',
    apply: 'build',
    // The share image needs an absolute URL, so it is only linked when the public origin is known.
    transformIndexHtml(html) {
      const origin = siteUrl?.replace(/\/+$/, '')
      if (!origin) return html
      const tags = `    <meta property="og:image" content="${origin}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
`
      return html.replace('    <meta name="twitter:card" content="summary" />', `${tags}    <meta name="twitter:card" content="summary_large_image" />`)
    },
    generateBundle() {
      const origin = siteUrl?.replace(/\/+$/, '')
      const robots = ['User-agent: *', 'Disallow: /seller', 'Disallow: /admin', 'Allow: /']
      if (origin) {
        robots.push(`Sitemap: ${origin}/sitemap.xml`)
        const urls = PUBLIC_PATHS.map((p) => `  <url><loc>${origin}${p}</loc></url>`)
        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          '</urlset>',
        ]
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap.join('\n') + '\n' })
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
    },
  }
}

// https://vite.dev/config/
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

export default defineConfig(({ mode }) => ({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [react(), tailwindcss(), seoFiles(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // IPv4, so that seller.localhost and admin.localhost (which resolve to 127.0.0.1) reach the dev server like localhost does.
    host: '127.0.0.1',
    // Same-origin API in development (as behind Caddy in production): no CORS involved.
    proxy: {
      '/api': 'http://localhost:8080',
      // Live order updates (WebSocket) go through the same origin too.
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
}))
