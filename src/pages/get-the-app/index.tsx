import { ArrowLeftIcon, MonitorIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { pictureOf } from '@/shared/assets/mascot-pictures'
import { env } from '@/shared/config/env'
import { siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { Lockup } from '@/shared/ui/brand'
import { LanguageSwitch } from '@/shared/ui/language-switch'

/** A store badge: a link once the app is published, a quiet "coming soon" pill before that. */
function StoreButton({ href, store, icon }: { href: string; store: string; icon: ReactNode }) {
  const body = (
    <>
      {icon}
      <span className="flex flex-col items-start leading-tight">
        <span className="text-[0.6875rem] opacity-80">{href ? t('Tải về trên') : t('Sắp có trên')}</span>
        <span className="text-body font-semibold">{store}</span>
      </span>
    </>
  )
  return href ? (
    <a href={href} className="flex h-14 min-w-44 items-center gap-3 rounded-full bg-ink px-5 text-white outline-none hover:bg-button-hover focus-visible:ring-2 focus-visible:ring-ring">
      {body}
    </a>
  ) : (
    <span aria-disabled="true" className="flex h-14 min-w-44 cursor-default items-center gap-3 rounded-full bg-grey-100 px-5 text-ink">
      {body}
    </span>
  )
}

const AppleIcon = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-current">
    <path d="M16.37 12.6c.03 2.9 2.54 3.86 2.57 3.87-.02.07-.4 1.38-1.33 2.73-.8 1.17-1.63 2.33-2.94 2.35-1.29.03-1.7-.76-3.17-.76-1.47 0-1.93.74-3.15.79-1.27.05-2.23-1.26-3.04-2.43-1.65-2.39-2.92-6.76-1.22-9.7.84-1.46 2.35-2.39 3.98-2.41 1.24-.03 2.42.84 3.17.84.76 0 2.19-1.04 3.69-.88.63.03 2.39.25 3.52 1.91-.09.06-2.1 1.23-2.08 3.66M13.95 5.47c.67-.81 1.12-1.94 1-3.07-.97.04-2.14.65-2.83 1.46-.62.72-1.17 1.87-1.02 2.97 1.08.08 2.18-.55 2.85-1.36" />
  </svg>
)
const PlayIcon = (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-current">
    <path d="M3.6 2.2c-.3.3-.5.8-.5 1.4v16.8c0 .6.2 1.1.5 1.4l.1.1 9.4-9.4v-.2L3.7 2.1zM16.2 15.6 13.1 12.5v-.2l3.1-3.1.1.1 3.7 2.1c1.1.6 1.1 1.6 0 2.2l-3.7 2.1zM16.3 15.5 13.1 12.4 3.6 21.8c.4.4.9.4 1.6.1l11.1-6.4M16.3 9.3 5.2 2.9c-.7-.4-1.2-.3-1.6.1l9.5 9.4z" />
  </svg>
)

/**
 * What a phone or a tablet sees in place of a page that is not public. Sellers and customers are invited to the bonbon app, where the
 * shop and the orders are made for a small screen; staff pages (console, ops) ask for a computer, as there is no app for them.
 * The public pages (home, guides, blog, resources, help) stay open, and so does the way back to them.
 */
export function GetTheAppPage({ audience }: { audience: 'seller' | 'staff' }) {
  const picture = pictureOf('phone')
  const staff = audience === 'staff'
  return (
    <div className="flex min-h-svh flex-col bg-background text-ink">
      <header className="flex h-16 items-center justify-between px-5">
        <a href={siteUrl('public')} aria-label={t('bonbon, trang chủ')}>
          <Lockup className="h-7" />
        </a>
        <LanguageSwitch compact />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-12 text-center">
        {staff ? (
          <span className="flex size-20 items-center justify-center rounded-full bg-accent text-primary">
            <MonitorIcon className="size-9" strokeWidth={1.75} aria-hidden="true" />
          </span>
        ) : picture ? (
          <img src={picture} alt="" aria-hidden="true" className="w-56 max-w-[70vw] [mask-image:linear-gradient(to_bottom,black_82%,transparent)]" />
        ) : null}
        <div className="flex max-w-md flex-col gap-3">
          <h1 className="text-[2rem] leading-[1.15] font-medium tracking-[-0.02em] text-balance">
            {staff ? t('Trang quản trị dùng trên máy tính') : t('Bonbon nằm gọn trong túi bạn')}
          </h1>
          <p className="text-body text-muted-foreground text-balance">
            {staff
              ? t('Bảng, biểu đồ và hồ sơ cần màn hình rộng. Hãy mở trang này trên máy tính để làm việc.')
              : t('Trên điện thoại và máy tính bảng, hãy dùng ứng dụng bonbon: đặt món, theo dõi đơn từng bước và quản lý quán chỉ với vài lần chạm.')}
          </p>
        </div>
        {staff ? null : (
          <div className="flex flex-wrap justify-center gap-3">
            <StoreButton href={env.appStoreUrl} store="App Store" icon={AppleIcon} />
            <StoreButton href={env.playStoreUrl} store="Google Play" icon={PlayIcon} />
          </div>
        )}
        <a href={siteUrl('public')} className="text-link flex items-center gap-1.5 text-ui">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          {t('Về trang chủ bonbon')}
        </a>
      </main>
    </div>
  )
}
