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
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), seoFiles(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Same-origin API in development (as behind Caddy in production): no CORS involved.
    proxy: {
      '/api': 'http://localhost:8080',
      // Live order updates (WebSocket) go through the same origin too.
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
}))
