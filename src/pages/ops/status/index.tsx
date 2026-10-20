import { CheckCircle2Icon, XCircleIcon } from 'lucide-react'
import { useOpsStatus, type OpsCheck } from '@/entities/ops'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

function uptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return [d ? `${d} ngày` : '', h ? `${h} giờ` : '', `${m} phút`].filter(Boolean).join(' ')
}

function CheckRow({ check }: { check: OpsCheck }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2.5">
        {check.ok ? (
          <CheckCircle2Icon className="size-5 text-success" aria-hidden="true" />
        ) : (
          <XCircleIcon className="size-5 text-destructive" aria-hidden="true" />
        )}
        <span className="font-medium">{check.name}</span>
      </span>
      <span className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
        <span>{check.detail}</span>
        <span>{check.latencyMs} ms</span>
        <span className="sr-only">{check.ok ? 'Đạt' : 'Không đạt'}</span>
      </span>
    </li>
  )
}

/** How the running instance and the parts it stands on are doing (ops:read). Asks again every 15 seconds. */
export function OpsStatusPage() {
  const { session } = useSession()
  const status = useOpsStatus()

  if (!session?.permissions.has('ops:read')) {
    return <p className="text-muted-foreground">Bạn không có quyền xem tình trạng hệ thống.</p>
  }
  const data = status.data

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tình trạng hệ thống</h1>
          <p className="text-sm text-muted-foreground">Kiểm tra các thành phần hệ thống dựa vào, cập nhật mỗi 15 giây.</p>
        </div>
        {data ? (
          <Badge className={data.status === 'UP' ? 'bg-success-subtle text-success-fg' : 'bg-danger-subtle text-danger-fg'}>
            {data.status === 'UP' ? 'Mọi thành phần hoạt động' : 'Có thành phần không đạt'}
          </Badge>
        ) : null}
      </div>

      {status.isError ? <FormError message={problemMessage(status.error)} /> : null}
      {status.isPending ? <Skeleton className="h-48" /> : null}

      {data ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Thành phần</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {data.checks?.map((c) => <CheckRow key={c.name} check={c} />)}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Phiên bản đang chạy</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">Chạy được</dt>
                  <dd className="tabular-nums">{uptime(data.uptimeSeconds ?? 0)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">Khởi động lúc</dt>
                  <dd className="tabular-nums">{formatDateTime(data.startedAt)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">Bộ nhớ heap</dt>
                  <dd className="tabular-nums">
                    {data.heapUsedMb} / {data.heapMaxMb} MB
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">Số lõi CPU</dt>
                  <dd className="tabular-nums">{data.processors}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">Java</dt>
                  <dd>{data.javaVersion}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b pb-2">
                  <dt className="text-muted-foreground">Hồ sơ cấu hình</dt>
                  <dd>{data.profiles?.length ? data.profiles.join(', ') : 'mặc định'}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">Kiểm tra lúc {formatDateTime(data.checkedAt)}.</p>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
