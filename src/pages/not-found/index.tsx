import { ArrowLeftIcon } from 'lucide-react'
import { pictureOf } from '@/shared/assets/mascot-pictures'
import { siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { Lockup } from '@/shared/ui/brand'
import { buttonClass } from '@/shared/ui/button'
import { Illustration } from '@/shared/ui/illustrations'
import { LanguageSwitch } from '@/shared/ui/language-switch'

/**
 * An address with nothing behind it: the bonbon bear scratching its head behind a 404 road sign, a line saying what happened, and the
 * ways back (home, help). The picture sits beside the text on a wide screen and above it on a phone.
 */
export function NotFoundPage() {
  const picture = pictureOf('not-found')
  return (
    <div className="flex min-h-svh flex-col bg-white text-ink">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <a href={siteUrl('public')} aria-label={t('bonbon, trang chủ')}>
          <Lockup className="h-7" />
        </a>
        <LanguageSwitch compact />
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 pb-12 md:flex-row md:gap-16">
        {picture ? (
          <img src={picture} alt="" aria-hidden="true" className="w-52 shrink-0 mix-blend-multiply sm:w-64 md:order-2 md:w-80" />
        ) : (
          <Illustration name="no-result" />
        )}
        <div className="flex max-w-md flex-col items-center gap-4 text-center md:items-start md:text-left">
          <p className="text-ui font-semibold tracking-wide text-primary uppercase">{t('Lỗi 404')}</p>
          <h1 className="text-[2.25rem] leading-[1.1] font-medium tracking-[-0.02em] text-balance sm:text-[2.75rem]">{t('Ơ, trang này đi đâu mất rồi?')}</h1>
          <p className="text-body text-muted-foreground text-balance">
            {t('Gấu bonbon đã tìm khắp toà mà không thấy. Đường dẫn có thể bị gõ sai, hoặc trang đã được chuyển đi nơi khác.')}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3 md:justify-start">
            <a href={siteUrl('public')} className={buttonClass({ size: 'lg' })}>
              <ArrowLeftIcon aria-hidden="true" />
              {t('Về trang chủ')}
            </a>
            <a href={siteUrl('help')} className={buttonClass({ size: 'lg', variant: 'secondary' })}>
              {t('Trung tâm trợ giúp')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
