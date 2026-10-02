import { useNavigate } from 'react-router'
import { useSession, type Role } from '@/entities/session'

/** Placeholder until the real login screens (Sprint 1). The shortcut button exists only in dev builds. */
export function DevLoginPage({ title, role, home }: { title: string; role: Role; home: string }) {
  const { setSession } = useSession()
  const navigate = useNavigate()
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">Màn hình đăng nhập thật làm ở Sprint 1.</p>
      {import.meta.env.DEV && (
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
          onClick={() => {
            setSession({ userId: 'dev', role, permissions: new Set() })
            navigate(home)
          }}
        >
          Vào thử (chỉ ở môi trường dev)
        </button>
      )}
    </main>
  )
}
