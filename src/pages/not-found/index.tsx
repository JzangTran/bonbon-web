import { Link } from 'react-router'
import { Illustration } from '@/shared/ui/illustrations'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-3 p-6 text-center">
      <Illustration name="no-result" />
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="text-sm text-muted-foreground">Đường dẫn này không có gì, hoặc đã được chuyển đi nơi khác.</p>
      <Link to="/" className="text-primary underline underline-offset-4">
        Về trang chủ
      </Link>
    </main>
  )
}
