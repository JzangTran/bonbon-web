import { Link, useRouteError } from 'react-router'
import { Illustration } from '@/shared/ui/illustrations'

/** What a page shows when it crashes: a picture, a way to try again, a way out. */
export function RouteError() {
  const error = useRouteError()
  if (import.meta.env.DEV) console.error(error)
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-3 p-6 text-center">
      <Illustration name="error" />
      <h1 className="text-2xl font-bold">Có lỗi xảy ra</h1>
      <p className="text-sm text-muted-foreground">Trang này gặp sự cố. Hãy tải lại; nếu vẫn lỗi, liên hệ hỗ trợ của bonbon.</p>
      <button type="button" className="text-primary underline underline-offset-4" onClick={() => window.location.reload()}>
        Tải lại trang
      </button>
      <Link to="/" className="text-sm text-muted-foreground underline underline-offset-4">
        Về trang chủ
      </Link>
    </main>
  )
}
