import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@/app'
import { SITE } from '@/shared/config/sites'
import { initTextScale } from '@/shared/lib/text-scale'

initTextScale()

// The merchant, console and ops hosts share the public site's robots.txt, so they ask not to be indexed on the page itself.
// (The help center is public and sets its own title and description.)
if (SITE === 'merchant' || SITE === 'console' || SITE === 'ops') {
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.append(robots)
  document.title = { merchant: 'bonbon — Kênh người bán', console: 'bonbon — Quản trị', ops: 'bonbon — Vận hành' }[SITE]
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
