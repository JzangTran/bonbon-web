// Cloudflare Pages Function: one build serves five hosts, so robots.txt depends on the host. merchant.*, console.* and ops.* ask not
// to be crawled at all; bonbon.com and help.* are open. The files are written by the build (vite.config.ts).
interface Context {
  request: Request
  env: { ASSETS: { fetch: (request: Request | URL | string) => Promise<Response> } }
}

export const onRequestGet = async ({ request, env }: Context): Promise<Response> => {
  const { hostname } = new URL(request.url)
  const closed = /^(merchant|console|ops)\./.test(hostname)
  return env.ASSETS.fetch(new URL(closed ? '/robots-closed.txt' : '/robots-open.txt', request.url))
}
