import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-3 p-6">
      <h1 className="text-2xl font-bold">Không tìm thấy trang</h1>
      <Link to="/" className="text-primary underline underline-offset-4">
        Về trang chủ
      </Link>
    </main>
  )
}
