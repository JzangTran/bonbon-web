import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SearchIcon } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { FormError } from '@/widgets/auth-shell'

const TABS = [
  { status: 'PENDING', label: 'Chờ duyệt' },
  { status: 'REJECTED', label: 'Đã từ chối' },
  { status: 'APPROVED', label: 'Đã duyệt' },
  { status: 'ALL', label: 'Tất cả' },
] as const
type Status = (typeof TABS)[number]['status']

const BUSINESS_TYPE: Record<string, string> = { INDIVIDUAL: 'Cá nhân', HOUSEHOLD: 'Hộ kinh doanh' }
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Đã từ chối',
  SUSPENDED: 'Đang bị khoá',
}

/** Submitted shop applications, oldest first (view-registration-requests.md); drafts never appear. */
export function ShopReviewQueuePage() {
  const { session } = useSession()
  const [status, setStatus] = useState<Status>('PENDING')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim())
  const queue = useQuery({
    queryKey: ['admin', 'shop-review', status, deferredQuery],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchant-approval/requests', {
        params: { query: { status, q: deferredQuery || undefined } },
      })
      if (error || !data) throw error
      return data
    },
  })

  if (!session?.permissions.has('merchant-approval:read')) {
    return <p className="text-muted-foreground">Bạn không có quyền duyệt cửa hàng.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Duyệt cửa hàng</h1>
          <p className="text-sm text-muted-foreground">Hồ sơ gửi sớm nhất ở trên cùng để không hồ sơ nào bị bỏ quên.</p>
        </div>
        {session.permissions.has('merchant-approval:write-settings') ? <RadiusCapCard /> : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b">
        <div role="tablist" className="flex max-w-full gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.status}
              role="tab"
              aria-selected={status === tab.status}
              onClick={() => setStatus(tab.status)}
              className={cn(
                '-mb-px min-h-10 shrink-0 border-b-2 px-3 text-sm whitespace-nowrap',
                status === tab.status ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground',
              )}
            >
              {tab.label}
              {tab.status === 'PENDING' && status === 'PENDING' && queue.data ? ` (${queue.data.length})` : ''}
            </button>
          ))}
        </div>
        <div className="relative mb-2 w-full max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Tìm cửa hàng"
            placeholder="Tìm theo tên quán, phường, tỉnh…"
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {queue.isError ? <FormError message={problemMessage(queue.error)} /> : null}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cửa hàng</TableHead>
              <TableHead>Phường / Tỉnh</TableHead>
              <TableHead>Loại hình</TableHead>
              <TableHead>Gửi lúc</TableHead>
              <TableHead>Lưu ý</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Thao tác</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queue.isPending
              ? Array.from({ length: 4 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {queue.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  {status === 'PENDING' ? 'Không có hồ sơ nào đang chờ duyệt.' : 'Không có hồ sơ phù hợp.'}
                </TableCell>
              </TableRow>
            ) : null}
            {queue.data?.map(({ shop, resubmitted }) => (
              <TableRow key={shop?.vendorId}>
                <TableCell className="font-medium">{shop?.name ?? '(chưa đặt tên)'}</TableCell>
                <TableCell>{[shop?.ward, shop?.province].filter(Boolean).join(', ') || '—'}</TableCell>
                <TableCell>{shop?.businessType ? BUSINESS_TYPE[shop.businessType] : '—'}</TableCell>
                <TableCell title={shop?.submittedAt}>{formatRelative(shop?.submittedAt)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {resubmitted && shop?.status === 'PENDING' ? <Badge variant="secondary">Gửi lại sau từ chối</Badge> : null}
                    {shop?.payoutHolderMatchesIdentity === false ? (
                      <Badge className="bg-warning-subtle text-warning-fg">Tên chủ TK ≠ CCCD</Badge>
                    ) : null}
                    {status === 'ALL' && shop?.status ? (
                      <Badge variant="outline">{STATUS_LABEL[shop.status] ?? shop.status}</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="link" size="sm">
                    <Link to={`/admin/shop-review/${shop?.vendorId}`}>Xem hồ sơ</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/** The platform-wide delivery radius cap (set-delivery-radius-cap.md); applies to saves from now on. */
function RadiusCapCard() {
  const queryClient = useQueryClient()
  const cap = useQuery({
    queryKey: ['admin', 'radius-cap'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/settings/delivery-radius-cap')
      if (error || !data) throw error
      return data
    },
  })
  const [value, setValue] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: async (maxRadiusKm: number) => {
      const { data, error } = await api.PUT('/api/admin/settings/delivery-radius-cap', { body: { maxRadiusKm } })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'radius-cap'], data)
      setValue(null)
      toast.success('Đã cập nhật bán kính tối đa.')
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
  const shown = value ?? (cap.data ? String(cap.data.maxRadiusKm) : '')

  return (
    <Card className="w-full max-w-sm" size="sm">
      <CardHeader>
        <CardTitle>Bán kính giao tối đa</CardTitle>
        <CardDescription>Áp dụng cho lần lưu sau của các quán; quán đã duyệt giữ bán kính hiện tại.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate(Number(shown.replace(',', '.')))
          }}
        >
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="radius-cap">Km</Label>
            <Input id="radius-cap" inputMode="decimal" value={shown} onChange={(e) => setValue(e.target.value)} />
          </div>
          <Button type="submit" disabled={save.isPending || value === null}>
            Lưu
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
