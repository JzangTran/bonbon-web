import { ArrowLeftIcon, MonitorIcon } from 'lucide-react'
import { pictureOf } from '@/shared/assets/mascot-pictures'
import { siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { Lockup } from '@/shared/ui/brand'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { StoreButtons } from '@/shared/ui/store-buttons'

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
            <StoreButtons />
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
