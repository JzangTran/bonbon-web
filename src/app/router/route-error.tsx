import { Link, useRouteError } from 'react-router'
import { Illustration } from '@/shared/ui/illustrations'
import { t } from '@/shared/i18n'

/** What a page shows when it crashes: a picture, a way to try again, a way out. */
export function RouteError() {
  const error = useRouteError()
  if (import.meta.env.DEV) console.error(error)
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-3 p-6 text-center">
      <Illustration name="error" />
      <h1 className="text-2xl font-semibold">{t('Có lỗi xảy ra')}</h1>
      <p className="text-sm text-muted-foreground">{t('Trang này gặp sự cố. Hãy tải lại; nếu vẫn lỗi, liên hệ hỗ trợ của bonbon.')}</p>
      <button type="button" className="text-link" onClick={() => window.location.reload()}>
        {t('Tải lại trang')}
      </button>
      <Link to="/" className="text-link text-sm text-muted-foreground">
        {t('Về trang chủ')}
      </Link>
    </main>
  )
}
