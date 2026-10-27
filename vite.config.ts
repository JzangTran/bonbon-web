import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/** Public, indexable pages of bonbon.com; the merchant, console and ops sites and the auth pages stay out of search. */
const PUBLIC_PATHS = [
  '/',
  '/legal/CUSTOMER_TERMS',
  '/legal/SELLER_TERMS',
  '/legal/PRIVACY_POLICY',
  '/huong-dan/quan-ly-cua-hang',
  '/blog',
  '/bo-nhan-dien',
  ...articlePaths(),
]

/** The address of every guide and blog post, read from the slugs written in src/entities/article/content. */
function articlePaths(): string[] {
  const bases: Record<string, string> = { start: '/huong-dan/bat-dau', manage: '/huong-dan/quan-ly-cua-hang', blog: '/blog' }
  return Object.entries(bases).flatMap(([file, base]) => {
    const text = readFileSync(new URL('./src/entities/article/content/' + file + '.ts', import.meta.url), 'utf8')
    return [...text.matchAll(/^\s*slug: '([a-z0-9-]+)'/gm)].map((m) => base + '/' + m[1])
  })
}

const sitemapOf = (origin: string, paths: string[]) =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((p) => '  <url><loc>' + origin + p + '</loc></url>'),
    '</urlset>',
  ].join('\n') + '\n'

/**
 * robots and sitemap files. One build serves five hosts, so the files exist per kind of host and the Pages Functions in functions/
 * (robots.txt, sitemap.xml) hand out the right one by host name: the open one for bonbon.com and help.*, the closed one for
 * merchant.*, console.* and ops.*. Sitemaps need VITE_SITE_URL (the public origin) at build time; the help site's is derived from it.
 * robots.txt and sitemap.xml themselves are the public site's, for hosting without Functions.
 */
function seoFiles(siteUrl: string | undefined): Plugin {
  return {
    name: 'bonbon-seo-files',
    apply: 'build',
    // The share image needs an absolute URL, so it is only linked when the public origin is known.
    transformIndexHtml(html) {
      const origin = siteUrl?.replace(/\/+$/, '')
      if (!origin) return html
      const tags = '    <meta property="og:image" content="' + origin + '/og-image.png" />\n' +
        '    <meta property="og:image:width" content="1200" />\n' +
        '    <meta property="og:image:height" content="630" />\n'
      return html.replace('    <meta name="twitter:card" content="summary" />', tags + '    <meta name="twitter:card" content="summary_large_image" />')
    },
    generateBundle() {
      const origin = siteUrl?.replace(/\/+$/, '')
      const open = ['User-agent: *', 'Disallow: /merchant', 'Disallow: /console', 'Disallow: /ops', 'Allow: /']
      const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source })
      if (origin) {
        open.push('Sitemap: ' + origin + '/sitemap.xml')
        emit('sitemap.xml', sitemapOf(origin, PUBLIC_PATHS))
        const help = new URL(origin)
        emit('sitemap-help.xml', sitemapOf(help.protocol + '//help.' + help.host, ['/']))
      }
      emit('robots.txt', open.join('\n') + '\n')
      emit('robots-open.txt', open.join('\n') + '\n')
      emit('robots-closed.txt', 'User-agent: *\nDisallow: /\n')
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
    // IPv4, so that merchant.localhost, help.localhost, console.localhost and ops.localhost (which resolve to 127.0.0.1) reach the dev server like localhost does.
    host: '127.0.0.1',
    // Same-origin API in development (as behind Caddy in production): no CORS involved.
    proxy: {
      '/api': 'http://localhost:8080',
      // Live order updates (WebSocket) go through the same origin too.
      '/ws': { target: 'ws://localhost:8080', ws: true },
    },
  },
}))
