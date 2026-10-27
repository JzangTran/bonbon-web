// Cloudflare Pages Function: the sitemap of the host asked, since a sitemap may only list addresses of its own host.
interface Context {
  request: Request
  env: { ASSETS: { fetch: (request: Request | URL | string) => Promise<Response> } }
}

export const onRequestGet = async ({ request, env }: Context): Promise<Response> => {
  const { hostname } = new URL(request.url)
  if (/^(merchant|console|ops)\./.test(hostname)) return new Response('Not found', { status: 404 })
  return env.ASSETS.fetch(new URL(hostname.startsWith('help.') ? '/sitemap-help.xml' : '/sitemap.xml', request.url))
}
