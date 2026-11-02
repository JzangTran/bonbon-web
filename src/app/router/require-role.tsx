import { LoaderCircleIcon } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession, type Role } from '@/entities/session'
import { t } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'

/**
 * Pages for one role. While the page is still asking the server who is signed in it waits; if the server cannot be reached it says
 * so with a retry (instead of a blank page or a trip to sign-in); with no session, or another role, it goes to sign-in.
 */
export function RequireRole({ role, loginPath }: { role: Role; loginPath: string }) {
  const { session, status, retry } = useSession()
  const location = useLocation()
  if (status === 'restoring' && !session) {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center gap-2 text-ui text-muted-foreground">
        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
        {t('Đang tải…')}
      </div>
    )
  }
  if (status === 'offline' && !session) {
    return (
      <div role="alert" className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-h3 font-semibold">{t('Không kết nối được máy chủ')}</p>
        <p className="max-w-md text-body text-muted-foreground">{t('Máy chủ bonbon đang không phản hồi. Kiểm tra kết nối mạng rồi thử lại.')}</p>
        <Button onClick={retry}>{t('Thử lại')}</Button>
      </div>
    )
  }
  if (!session || session.role !== role) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
