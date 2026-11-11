import { t } from '@/shared/i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@/app'
import { SITE } from '@/shared/config/sites'


// The merchant, console and ops hosts share the public site's robots.txt, so they ask not to be indexed on the page itself.
// (The help center is public and sets its own title and description.)
if (SITE === 'merchant' || SITE === 'console' || SITE === 'ops') {
  const robots = document.createElement('meta')
  robots.name = 'robots'
  robots.content = 'noindex, nofollow'
  document.head.append(robots)
  document.title = { merchant: t('bonbon — Kênh người bán'), console: t('bonbon — Quản trị'), ops: t('bonbon — Vận hành') }[SITE]
} else {
  // index.html carries the Vietnamese title; pages without their own title show it in the chosen language
  document.title = t('bonbon — Đặt món từ quán ăn ngay trong khu của bạn')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
