import { useState } from 'react'
import { Link } from 'react-router'
import { useAreaCoverage, useMerchants, type MerchantRow, type MerchantStatus } from '@/entities/merchant-directory'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { adminPath } from '@/shared/config/sites'

const STATUS_TABS: { id: MerchantStatus; label: string }[] = [
  { id: 'APPROVED', label: 'Đang hoạt động' },
  { id: 'SUSPENDED', label: 'Bị đình chỉ' },
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'REJECTED', label: 'Bị từ chối' },
  { id: 'CLOSED', label: 'Đã đóng' },
  { id: 'ALL', label: 'Tất cả' },
]
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  APPROVED: { label: 'Hoạt động', className: 'bg-success-subtle text-success-fg' },
  PENDING: { label: 'Chờ duyệt', className: 'bg-warning-subtle text-warning-fg' },
  REJECTED: { label: 'Bị từ chối', className: 'bg-danger-subtle text-danger-fg' },
  SUSPENDED: { label: 'Bị đình chỉ', className: 'bg-danger-subtle text-danger-fg' },
  CLOSING: { label: 'Đang đóng', className: 'bg-warning-subtle text-warning-fg' },
  CLOSED: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground' },
}
const COMMISSION_STAGE: Record<string, string> = {
  OVERDUE: 'Nợ hoa hồng quá hạn',
  RESTRICTED: 'Hạn chế vì nợ hoa hồng',
  PAUSED: 'Tạm ngừng nhận đơn vì nợ hoa hồng',
  REVIEW: 'Chờ xem xét vì nợ hoa hồng',
}

type Tab = 'list' | 'coverage'

/** Every shop in any status, and the area the shops' own delivery radii add up to (view-merchant-directory.md, view-area-coverage.md). */
export function AdminMerchantsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('merchant-approval:read')
  const [tab, setTab] = useState<Tab>('list')

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem danh sách cửa hàng.</p>

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Cửa hàng</h1>
        <p className="text-sm text-muted-foreground">
          Danh sách mọi cửa hàng đã gửi hồ sơ và vùng phủ thực tế. Muốn xử lý hồ sơ chờ duyệt, vào mục Duyệt cửa hàng.
        </p>
      </div>
      <PageTabs
        label="Cửa hàng"
        tabs={[
          { id: 'list', label: 'Danh sách' },
          { id: 'coverage', label: 'Vùng phủ' },
        ]}
        value={tab}
        onValueChange={(id) => setTab(id as Tab)}
      />
      {tab === 'list' ? <Directory /> : <Coverage />}
    </div>
  )
}

function Directory() {
  const [status, setStatus] = useState<MerchantStatus>('APPROVED')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const merchants = useMerchants(status, q, page, true)
  const data = merchants.data
  const size = data?.size ?? 20
  const total = data?.total ?? 0

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(search)
          setPage(0)
        }}
      >
        <Input className="max-w-xs" type="search" placeholder="Tìm theo tên, phường, tỉnh" aria-label="Tìm cửa hàng" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline">
          Tìm
        </Button>
      </form>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Trạng thái">
        {STATUS_TABS.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={status === t.id ? 'default' : 'outline'}
            aria-pressed={status === t.id}
            onClick={() => {
              setStatus(t.id)
              setPage(0)
            }}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {merchants.isError ? <FormError message={problemMessage(merchants.error)} /> : null}
      {merchants.isPending ? <Skeleton className="h-32" /> : null}
      {data && (data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{q ? 'Không có cửa hàng nào khớp.' : 'Chưa có cửa hàng nào ở mục này.'}</Card> : null}
      <ul className="flex flex-col gap-2">
        {(data?.items ?? []).map((m) => (
          <MerchantItem key={m.vendorId} m={m} />
        ))}
      </ul>
      {total > size ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {Math.ceil(total / size)}
          </span>
          <Button variant="outline" disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
            Trang sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function MerchantItem({ m }: { m: MerchantRow }) {
  const badge = STATUS_BADGE[m.status ?? ''] ?? { label: m.status ?? '', className: '' }
  const place = [m.ward, m.province].filter(Boolean).join(', ')
  const flags = [
    m.performanceRestricted ? 'Bị hạn chế hiển thị' : null,
    m.commissionStage && COMMISSION_STAGE[m.commissionStage] ? COMMISSION_STAGE[m.commissionStage] : null,
    m.suspension === 'SCHEDULED' ? 'Có lịch đình chỉ' : null,
  ].filter(Boolean)
  return (
    <li>
      <Link to={adminPath(`/merchants/${m.vendorId}`)} className="block rounded-sm border bg-card p-4 hover:bg-muted/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {m.name ?? '(chưa đặt tên)'} <Badge className={cn('ml-2', badge.className)}>{badge.label}</Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            {m.ratingAverage !== undefined && m.ratingAverage !== null ? `★ ${m.ratingAverage.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} (${m.ratingCount})` : 'Chưa có đánh giá'}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {place || 'Chưa có địa chỉ'} · bán kính {m.deliveryRadiusKm ?? '—'} km · {(m.deliveredOrders ?? 0).toLocaleString('vi-VN')} đơn đã giao ·{' '}
          {m.activePoints ? `${m.activePoints} điểm phạt` : 'không có điểm phạt'} · tạo {formatDateTime(m.createdAt)}
        </p>
        {flags.length > 0 ? (
          <p className="mt-2 flex flex-wrap gap-1.5">
            {flags.map((f) => (
              <Badge key={f} className="bg-warning-subtle text-warning-fg">
                {f}
              </Badge>
            ))}
          </p>
        ) : null}
      </Link>
    </li>
  )
}

function Coverage() {
  const [province, setProvince] = useState('')
  const [ward, setWard] = useState('')
  const [applied, setApplied] = useState({ province: '', ward: '' })
  const coverage = useAreaCoverage(applied.province, applied.ward, true)
  const data = coverage.data
  const items = data?.items ?? []
  const outliers = items.filter((s) => s.outlier).length

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Không có vùng do quản trị vẽ: mỗi quán tự đặt bán kính giao. Quán có bán kính lớn hơn {data?.outlierFactor ?? 2} lần trung vị của tỉnh được đánh dấu để xem kỹ; đây chỉ là quan sát, không có gì bị hạn chế tự động.
      </p>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setApplied({ province: province.trim(), ward: ward.trim() })
        }}
      >
        <Input className="w-48" placeholder="Tỉnh / thành" aria-label="Lọc theo tỉnh hoặc thành" value={province} onChange={(e) => setProvince(e.target.value)} />
        <Input className="w-48" placeholder="Phường / xã" aria-label="Lọc theo phường hoặc xã" value={ward} onChange={(e) => setWard(e.target.value)} />
        <Button type="submit" variant="outline">
          Lọc
        </Button>
      </form>
      {coverage.isError ? <FormError message={problemMessage(coverage.error)} /> : null}
      {coverage.isPending ? <Skeleton className="h-32" /> : null}
      {data ? (
        <p className="text-sm">
          {items.length} cửa hàng đang hoạt động
          {outliers > 0 ? <span className="text-warning-fg"> · {outliers} quán bán kính lớn bất thường</span> : null}
        </p>
      ) : null}
      {data && items.length === 0 ? <Card className="p-6 text-muted-foreground">Không có cửa hàng nào trong phạm vi này.</Card> : null}
      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-sm border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr>
                {['Cửa hàng', 'Khu vực', 'Bán kính', 'Trung vị tỉnh', 'Đơn đã giao'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium [&:nth-child(n+3)]:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.vendorId} className={cn('border-t', s.outlier && 'bg-warning-subtle/40')}>
                  <td className="px-3 py-2">
                    <Link to={adminPath(`/merchants/${s.vendorId}`)} className="font-medium text-primary hover:underline">
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{s.address}</p>
                  </td>
                  <td className="px-3 py-2">{[s.ward, s.province].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {s.radiusKm} km
                    {s.outlier ? <Badge className="ml-2 bg-warning-subtle text-warning-fg">Xem kỹ</Badge> : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{s.provinceMedianRadiusKm} km</td>
                  <td className="px-3 py-2 text-right tabular-nums">{(s.deliveredOrders ?? 0).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
