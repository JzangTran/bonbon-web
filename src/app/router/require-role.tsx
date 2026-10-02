import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession, type Role } from '@/entities/session'

export function RequireRole({ role, loginPath }: { role: Role; loginPath: string }) {
  const { session } = useSession()
  const location = useLocation()
  if (!session || session.role !== role) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
