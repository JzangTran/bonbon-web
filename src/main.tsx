import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@/app'
import { SITE } from '@/shared/config/sites'

// The seller and admin hosts share the public site's robots.txt, so they ask not to be indexed on the page itself.
if (SITE !== 'public') {
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.append(robots)
  document.title = SITE === 'seller' ? 'bonbon — Kênh người bán' : 'bonbon — Quản trị'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
