import { useQuery } from '@tanstack/react-query'
import { Illustration } from '@/shared/ui/illustrations'
import { useSession } from '@/entities/session'
import { api, useGateState } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'

const STARTUP_CHECK_MS = 5 * 60_000
const RECOVERY_CHECK_MS = 15_000

/**
 * Maintenance (maintenance-mode.md). FULL stops everything but administrators, so the page is replaced by a screen with the message and
 * the expected end, which checks again every 15 seconds and lets the person back in by itself. READ_ONLY only refuses writes, so it is a
 * banner. The state is read at startup and every few minutes; a 503 MAINTENANCE from any call shows the screen at once.
 */
export function MaintenanceGate() {
  const { session } = useSession()
  const { maintenanceAt } = useGateState()
  const config = useQuery({
    queryKey: ['app-config'],
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.maintenance?.active && query.state.data.maintenance.level === 'FULL' ? RECOVERY_CHECK_MS : STARTUP_CHECK_MS),
    queryFn: async () => {
      const { data, error } = await api.GET('/api/app/config')
      if (error || !data) throw error
      return data
    },
  })
  const m = config.data?.maintenance
  const full = m?.active === true && m.level === 'FULL'
  // A refused call newer than the last answer of the config means maintenance started after we last looked.
  const refused = maintenanceAt !== null && maintenanceAt > config.dataUpdatedAt
  const isAdmin = session?.role === 'ADMIN'

  if ((full || refused) && !isAdmin) {
    return (
      <div role="alert" className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Illustration name="maintenance" className="w-44" />
        <h1 className="text-2xl font-bold">Bonbon đang bảo trì</h1>
        <p className="max-w-md text-muted-foreground">{m?.message || 'Hệ thống đang được bảo trì. Bạn vui lòng quay lại sau ít phút.'}</p>
        {m?.endsAt ? <p className="text-sm">Dự kiến xong lúc {formatDateTime(m.endsAt)}.</p> : null}
        <p className="text-xs text-muted-foreground">Trang tự kiểm tra lại và mở khi bảo trì xong.</p>
        <Button variant="outline" disabled={config.isFetching} onClick={() => void config.refetch()}>
          Thử lại ngay
        </Button>
      </div>
    )
  }
  if (m?.active) {
    return (
      <div role="status" className="sticky top-0 z-50 border-b bg-warning-subtle px-4 py-2 text-center text-sm text-warning-fg">
        {full ? 'Hệ thống đang bảo trì (quản trị viên vẫn dùng được). ' : 'Hệ thống đang bảo trì: chỉ xem được, các thao tác ghi sẽ bị từ chối. '}
        {m.message}
        {m.endsAt ? ` Dự kiến xong lúc ${formatDateTime(m.endsAt)}.` : ''}
      </div>
    )
  }
  return null
}
