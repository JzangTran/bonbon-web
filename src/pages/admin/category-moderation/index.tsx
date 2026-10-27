import { FlagIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useCategoryCases, type CaseStatus, type CategoryCase } from '@/entities/dish-category-case'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { DecideDialog } from './decide-dialog'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { consolePath } from '@/shared/config/sites'

const TABS: { id: CaseStatus | ''; label: string }[] = [
  { id: 'APPEALED', label: 'Kháng nghị chờ quyết định' },
  { id: 'RESTRICTED', label: 'Chờ quán sửa' },
  { id: 'AUTO_CORRECTED', label: 'Hệ thống đã sửa' },
  { id: '', label: 'Tất cả' },
]
const STATUS: Record<string, { label: string; className: string }> = {
  RESTRICTED: { label: 'Chờ quán sửa', className: 'bg-warning-subtle text-warning-fg' },
  AUTO_CORRECTED: { label: 'Hệ thống đã sửa', className: 'bg-warning-subtle text-warning-fg' },
  APPEALED: { label: 'Đang kháng nghị', className: 'bg-accent text-accent-foreground' },
  RESOLVED: { label: 'Đã sửa', className: 'bg-success-subtle text-success-fg' },
  CONFIRMED: { label: 'Quán đồng ý', className: 'bg-success-subtle text-success-fg' },
  EXPIRED: { label: 'Quán không phản hồi', className: 'bg-muted text-muted-foreground' },
  APPEAL_ACCEPTED: { label: 'Chấp nhận kháng nghị', className: 'bg-success-subtle text-success-fg' },
  APPEAL_REJECTED: { label: 'Từ chối kháng nghị', className: 'bg-danger-subtle text-danger-fg' },
}

/** Dishes filed in the wrong category (moderate-dish-category.md, review-category-appeals.md): flag one, and decide the shops' appeals. */
export function AdminCategoryModerationPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('dish:moderate')
  const [params, setParams] = useSearchParams()
  const vendorId = params.get('vendorId') ?? ''
  const [tab, setTab] = useState<CaseStatus | ''>('APPEALED')
  const [page, setPage] = useState(0)
  const [deciding, setDeciding] = useState<{ kase: CategoryCase; decision: 'ACCEPT' | 'REJECT' } | null>(null)
  const cases = useCategoryCases(tab, vendorId, page, allowed)
  const data = cases.data
  const size = data?.size ?? 20
  const total = data?.total ?? 0

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền kiểm duyệt ngành hàng của món.</p>

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Món sai ngành</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Hoa hồng tính theo ngành của món mà quán tự chọn, nên món xếp sang ngành rẻ hơn cần được sửa. Món bị đánh dấu ẩn khỏi tìm kiếm cho đến khi quán sửa; quá hạn hệ thống áp dụng ngành bạn gợi ý, quán có 7 ngày để đồng ý hoặc kháng nghị.
          </p>
        </div>
        <Button asChild>
          <Link to={consolePath('/category-moderation/flag') + (vendorId ? `?vendorId=${vendorId}` : '')}>
            <FlagIcon /> Đánh dấu món
          </Link>
        </Button>
      </div>

      {vendorId ? (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          Đang lọc theo một cửa hàng.
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setParams({})
              setPage(0)
            }}
          >
            Bỏ lọc
          </Button>
        </p>
      ) : null}

      <PageTabs
        label="Món sai ngành"
        tabs={TABS.map((t) => ({ id: t.id || 'all', label: t.label }))}
        value={tab || 'all'}
        onValueChange={(id) => {
          setTab(id === 'all' ? '' : (id as CaseStatus))
          setPage(0)
        }}
      />

      {cases.isError ? <FormError message={problemMessage(cases.error)} /> : null}
      {cases.isPending ? <Skeleton className="h-32" /> : null}
      {data && (data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{tab === 'APPEALED' ? 'Không có kháng nghị nào đang chờ.' : 'Chưa có vụ nào ở mục này.'}</Card> : null}
      <ul className="flex flex-col gap-2">
        {(data?.items ?? []).map((c) => (
          <CaseItem key={c.id} c={c} onDecide={(decision) => setDeciding({ kase: c, decision })} />
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

      <DecideDialog key={deciding ? `${deciding.kase.id}-${deciding.decision}` : 'none'} kase={deciding?.kase ?? null} decision={deciding?.decision ?? 'ACCEPT'} onClose={() => setDeciding(null)} />
    </div>
  )
}

function CaseItem({ c, onDecide }: { c: CategoryCase; onDecide: (decision: 'ACCEPT' | 'REJECT') => void }) {
  const status = STATUS[c.status ?? ''] ?? { label: c.status ?? '', className: '' }
  return (
    <li className="flex flex-col gap-2 rounded-sm border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          {c.dishName} <span className="font-normal text-muted-foreground">· </span>
          <Link to={consolePath(`/merchants/${c.vendorId}`)} className="font-normal text-primary hover:underline">
            {c.shopName}
          </Link>
          <Badge className={cn('ml-2', status.className)}>{status.label}</Badge>
        </p>
        <p className="text-xs text-muted-foreground" title={formatDateTime(c.openedAt)}>
          Mở {formatRelative(c.openedAt)}
        </p>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">Ngành quán chọn:</span> {c.originalCategory?.name} <span className="text-muted-foreground">→ gợi ý:</span> {c.suggestedCategory?.name}
        {c.requestedCategory ? (
          <>
            {' '}
            <span className="text-muted-foreground">→ quán xin:</span> {c.requestedCategory.name}
          </>
        ) : null}
        {c.status !== 'RESTRICTED' && c.status !== 'APPEALED' && c.finalCategory ? (
          <>
            {' '}
            <span className="text-muted-foreground">· hiện ở:</span> {c.finalCategory.name}
          </>
        ) : null}
      </p>
      <p className="text-sm text-muted-foreground">Lý do: {c.reason}</p>
      {c.status === 'RESTRICTED' ? <p className="text-xs text-muted-foreground">Hạn quán sửa: {formatDateTime(c.deadlineAt)}</p> : null}
      {c.status === 'AUTO_CORRECTED' ? <p className="text-xs text-muted-foreground">Quán đồng ý hoặc kháng nghị đến: {formatDateTime(c.appealDeadlineAt)}</p> : null}
      {c.appealNote ? <p className="rounded-sm bg-muted px-3 py-2 text-sm">Quán giải thích: {c.appealNote}</p> : null}
      {c.decisionReason ? (
        <p className="text-xs text-muted-foreground">
          Quyết định ({formatDateTime(c.decidedAt)}): {c.decisionReason}
        </p>
      ) : null}
      {c.status === 'APPEALED' ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onDecide('ACCEPT')}>
            Chấp nhận
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDecide('REJECT')}>
            Từ chối
          </Button>
        </div>
      ) : null}
    </li>
  )
}
