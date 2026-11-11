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
import { consolePath } from '@/shared/config/sites'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { intlLocale, t } from '@/shared/i18n'

const STATUS_TABS: { id: MerchantStatus; label: string }[] = [
  { id: 'APPROVED', label: t('Đang hoạt động') },
  { id: 'SUSPENDED', label: t('Bị đình chỉ') },
  { id: 'PENDING', label: t('Chờ duyệt') },
  { id: 'REJECTED', label: t('Bị từ chối') },
  { id: 'CLOSED', label: t('Đã đóng') },
  { id: 'ALL', label: t('Tất cả') },
]
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  APPROVED: { label: t('Hoạt động'), className: 'bg-success-subtle text-success-fg' },
  PENDING: { label: t('Chờ duyệt'), className: 'bg-warning-subtle text-warning-fg' },
  REJECTED: { label: t('Bị từ chối'), className: 'bg-danger-subtle text-danger-fg' },
  SUSPENDED: { label: t('Bị đình chỉ'), className: 'bg-danger-subtle text-danger-fg' },
  CLOSING: { label: t('Đang đóng'), className: 'bg-warning-subtle text-warning-fg' },
  CLOSED: { label: t('Đã đóng'), className: 'bg-muted text-muted-foreground' },
}
const COMMISSION_STAGE: Record<string, string> = {
  OVERDUE: t('Nợ hoa hồng quá hạn'),
  RESTRICTED: t('Hạn chế vì nợ hoa hồng'),
  PAUSED: t('Tạm ngừng nhận đơn vì nợ hoa hồng'),
  REVIEW: t('Chờ xem xét vì nợ hoa hồng'),
}

type Tab = 'list' | 'coverage'

/** Every shop in any status, and the area the shops' own delivery radii add up to (view-merchant-directory.md, view-area-coverage.md). */
export function AdminMerchantsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('merchant-approval:read')
  const [tab, setTab] = useState<Tab>('list')

  if (!allowed) return <p className="text-muted-foreground">{t('Bạn không có quyền xem danh sách cửa hàng.')}</p>

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">{t('Cửa hàng')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Danh sách mọi cửa hàng đã gửi hồ sơ và vùng phủ thực tế. Muốn xử lý hồ sơ chờ duyệt, vào mục Duyệt cửa hàng.')}
        </p>
      </div>
      <PageTabs
        label={t('Cửa hàng')}
        tabs={[
          { id: 'list', label: t('Danh sách') },
          { id: 'coverage', label: t('Vùng phủ') },
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
  const paging = usePaging()
  const merchants = useMerchants(status, q, paging.page, true, paging.size)
  const data = merchants.data
  const total = data?.total ?? 0

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(search)
          paging.reset()
        }}
      >
        <Input className="max-w-xs" type="search" placeholder={t('Tìm theo tên, phường, tỉnh')} aria-label={t('Tìm cửa hàng')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline">
          {t('Tìm')}
        </Button>
      </form>
      <div className="flex flex-wrap gap-1" role="group" aria-label={t('Trạng thái')}>
        {STATUS_TABS.map((tItem) => (
          <Button
            key={tItem.id}
            size="sm"
            variant={status === tItem.id ? 'default' : 'outline'}
            aria-pressed={status === tItem.id}
            onClick={() => {
              setStatus(tItem.id)
              paging.reset()
            }}
          >
            {tItem.label}
          </Button>
        ))}
      </div>
      {merchants.isError ? <FormError message={problemMessage(merchants.error)} /> : null}
      {merchants.isPending ? <Skeleton className="h-32" /> : null}
      {data && (data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{q ? t('Không có cửa hàng nào khớp.') : t('Chưa có cửa hàng nào ở mục này.')}</Card> : null}
      <ul className="flex flex-col gap-2">
        {(data?.items ?? []).map((m) => (
          <MerchantItem key={m.vendorId} m={m} />
        ))}
      </ul>
      <Pagination paging={paging} total={total} />
    </div>
  )
}

function MerchantItem({ m }: { m: MerchantRow }) {
  const badge = STATUS_BADGE[m.status ?? ''] ?? { label: m.status ?? '', className: '' }
  const place = [m.ward, m.province].filter(Boolean).join(', ')
  const flags = [
    m.performanceRestricted ? t('Bị hạn chế hiển thị') : null,
    m.commissionStage && COMMISSION_STAGE[m.commissionStage] ? COMMISSION_STAGE[m.commissionStage] : null,
    m.suspension === 'SCHEDULED' ? t('Có lịch đình chỉ') : null,
  ].filter(Boolean)
  return (
    <li>
      <Link to={consolePath(`/merchants/${m.vendorId}`)} className="block rounded-sm border bg-card p-4 hover:bg-muted/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            {m.name ?? t('(chưa đặt tên)')} <Badge className={cn('ml-2', badge.className)}>{badge.label}</Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            {m.ratingAverage !== undefined && m.ratingAverage !== null ? `★ ${m.ratingAverage.toLocaleString(intlLocale, { maximumFractionDigits: 1 })} (${m.ratingCount})` : t('Chưa có đánh giá')}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {place || t('Chưa có địa chỉ')}{t(' · bán kính ')}{m.deliveryRadiusKm ?? '—'} km · {(m.deliveredOrders ?? 0).toLocaleString(intlLocale)}{t(' đơn đã giao ·')}{' '}
          {m.activePoints ? t('{v0} điểm phạt', { v0: m.activePoints }) : t('không có điểm phạt')}{t(' · tạo ')}{formatDateTime(m.createdAt)}
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
        {t('Không có vùng do quản trị vẽ: mỗi quán tự đặt bán kính giao. Quán có bán kính lớn hơn ')}{data?.outlierFactor ?? 2}{t(' lần trung vị của tỉnh được đánh dấu để xem kỹ; đây chỉ là quan sát, không có gì bị hạn chế tự động.')}
      </p>
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setApplied({ province: province.trim(), ward: ward.trim() })
        }}
      >
        <Input className="w-48" placeholder={t('Tỉnh / thành')} aria-label={t('Lọc theo tỉnh hoặc thành')} value={province} onChange={(e) => setProvince(e.target.value)} />
        <Input className="w-48" placeholder={t('Phường / xã')} aria-label={t('Lọc theo phường hoặc xã')} value={ward} onChange={(e) => setWard(e.target.value)} />
        <Button type="submit" variant="outline">
          {t('Lọc')}
        </Button>
      </form>
      {coverage.isError ? <FormError message={problemMessage(coverage.error)} /> : null}
      {coverage.isPending ? <Skeleton className="h-32" /> : null}
      {data ? (
        <p className="text-sm">
          {items.length}{t(' cửa hàng đang hoạt động')}
          {outliers > 0 ? <span className="text-warning-fg"> · {outliers}{t(' quán bán kính lớn bất thường')}</span> : null}
        </p>
      ) : null}
      {data && items.length === 0 ? <Card className="p-6 text-muted-foreground">{t('Không có cửa hàng nào trong phạm vi này.')}</Card> : null}
      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-grey-200">
          <table className="w-full text-ui">
            <thead className="text-small text-muted-foreground">
              <tr>
                {[t('Cửa hàng'), t('Khu vực'), t('Bán kính'), t('Trung vị tỉnh'), t('Đơn đã giao')].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-normal whitespace-nowrap [&:nth-child(n+3)]:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.vendorId} className={cn('border-t border-grey-100 hover:bg-grey-50', s.outlier && 'bg-warning-subtle/40')}>
                  <td className="px-3 py-3">
                    <Link to={consolePath(`/merchants/${s.vendorId}`)} className="text-link font-medium">
                      {s.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{s.address}</p>
                  </td>
                  <td className="px-3 py-3">{[s.ward, s.province].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {s.radiusKm} km
                    {s.outlier ? <Badge className="ml-2 bg-warning-subtle text-warning-fg">{t('Xem kỹ')}</Badge> : null}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.provinceMedianRadiusKm} km</td>
                  <td className="px-3 py-3 text-right tabular-nums">{(s.deliveredOrders ?? 0).toLocaleString(intlLocale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
