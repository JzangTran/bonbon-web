import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  leaves,
  useAppealMyCase,
  useCategoryTree,
  useConfirmMyCase,
  useMyCategoryCases,
  useResolveMyCase,
  type CaseStatus,
  type CategoryCase,
} from '@/entities/dish-category-case'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { CategorySelect } from '@/shared/ui/category-select'
import { Label } from '@/shared/ui/label'
import { FilterChips } from '@/shared/ui/filter-chips'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { MenuTabs } from '@/widgets/seller-tabs'
import { t } from '@/shared/i18n'

const TABS: { id: CaseStatus | ''; label: string }[] = [
  { id: 'RESTRICTED', label: t('Cần sửa ngay') },
  { id: 'AUTO_CORRECTED', label: t('Hệ thống đã sửa') },
  { id: 'APPEALED', label: t('Đang kháng nghị') },
  { id: '', label: t('Lịch sử') },
]
const STATUS: Record<string, { label: string; className: string }> = {
  RESTRICTED: { label: t('Cần sửa'), className: 'bg-danger-subtle text-danger-fg' },
  AUTO_CORRECTED: { label: t('Hệ thống đã sửa'), className: 'bg-warning-subtle text-warning-fg' },
  APPEALED: { label: t('Đang kháng nghị'), className: 'bg-accent text-accent-foreground' },
  RESOLVED: { label: t('Đã sửa'), className: 'bg-success-subtle text-success-fg' },
  CONFIRMED: { label: t('Đã đồng ý'), className: 'bg-success-subtle text-success-fg' },
  EXPIRED: { label: t('Hết hạn'), className: 'bg-muted text-muted-foreground' },
  APPEAL_ACCEPTED: { label: t('Kháng nghị được chấp nhận'), className: 'bg-success-subtle text-success-fg' },
  APPEAL_REJECTED: { label: t('Kháng nghị bị từ chối'), className: 'bg-danger-subtle text-danger-fg' },
}

/** Dishes an administrator found in the wrong category (view-category-violations.md, appeal-category-correction.md): fix, agree or appeal. */
export function SellerCategoryCasesPage() {
  const [tab, setTab] = useState<CaseStatus | ''>('RESTRICTED')
  const paging = usePaging()
  const [acting, setActing] = useState<{ kase: CategoryCase; kind: 'resolve' | 'appeal' } | null>(null)
  const cases = useMyCategoryCases(tab, paging.page, paging.size)
  const confirm = useConfirmMyCase()
  const data = cases.data
  const total = data?.total ?? 0

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <MenuTabs />
      <div>
        <h1 className="text-2xl font-semibold">{t('Món sai ngành')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Hoa hồng tính theo ngành của món. Khi quản trị viên thấy một món xếp sai ngành, món bị ẩn khỏi tìm kiếm cho đến khi bạn sửa; món vẫn có trên thực đơn và khách vẫn đặt được. Quá hạn, hệ thống tự chuyển món sang ngành đúng và bạn có 7 ngày để đồng ý hoặc kháng nghị. Ngành mới chỉ áp dụng cho đơn đặt từ lúc đổi.')}
        </p>
      </div>

      <FilterChips
        label={t('Trạng thái')}
        chips={TABS}
        value={tab}
        onChange={(id) => {
          setTab(id)
          paging.reset()
        }}
      />

      {cases.isError ? <FormError message={problemMessage(cases.error)} /> : null}
      {cases.isPending ? <Skeleton className="h-32" /> : null}
      {data && (data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{tab === '' ? t('Chưa có món nào bị đánh dấu.') : t('Không có món nào ở mục này.')}</Card> : null}
      <ul className="flex flex-col gap-2">
        {(data?.items ?? []).map((c) => (
          <CaseItem
            key={c.id}
            c={c}
            busy={confirm.isPending}
            acting={acting && acting.kase.id === c.id ? acting.kind : null}
            onDone={() => setActing(null)}
            onResolve={() => setActing({ kase: c, kind: 'resolve' })}
            onAppeal={() => setActing({ kase: c, kind: 'appeal' })}
            onConfirm={() =>
              confirm.mutate({ id: c.id ?? '' }, { onSuccess: () => toast.success(t('Đã đồng ý với ngành mới.')), onError: (e) => toast.error(problemMessage(e)) })
            }
          />
        ))}
      </ul>
      <Pagination paging={paging} total={total} />

    </div>
  )
}

function CaseItem({ c, busy, acting, onDone, onResolve, onAppeal, onConfirm }: {
  c: CategoryCase
  busy: boolean
  /** the form open under this case, if any */
  acting: 'resolve' | 'appeal' | null
  onDone: () => void
  onResolve: () => void
  onAppeal: () => void
  onConfirm: () => void
}) {
  const status = STATUS[c.status ?? ''] ?? { label: c.status ?? '', className: '' }
  return (
    <li className="flex flex-col gap-2 rounded-sm border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">
          {c.dishName} <Badge className={cn('ml-2', status.className)}>{status.label}</Badge>
        </p>
        <p className="text-xs text-muted-foreground" title={formatDateTime(c.openedAt)}>
          {formatRelative(c.openedAt)}
        </p>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">{t('Bạn chọn:')}</span> {c.originalCategory?.name} <span className="text-muted-foreground">{t('→ nên là:')}</span> <b>{c.suggestedCategory?.name}</b>
        {c.requestedCategory ? (
          <>
            {' '}
            <span className="text-muted-foreground">{t('· bạn xin:')}</span> {c.requestedCategory.name}
          </>
        ) : null}
        {c.status !== 'RESTRICTED' && c.finalCategory ? (
          <>
            {' '}
            <span className="text-muted-foreground">{t('· hiện ở:')}</span> {c.finalCategory.name}
          </>
        ) : null}
      </p>
      <p className="text-sm text-muted-foreground">{t('Lý do: ')}{c.reason}</p>
      {c.status === 'RESTRICTED' ? <p className="text-sm text-danger-fg">{t('Sửa trước ')}{formatDateTime(c.deadlineAt)}{t(', sau đó hệ thống tự chuyển. Món đang bị ẩn khỏi tìm kiếm.')}</p> : null}
      {c.status === 'AUTO_CORRECTED' ? <p className="text-sm text-warning-fg">{t('Đồng ý hoặc kháng nghị trước ')}{formatDateTime(c.appealDeadlineAt)}.</p> : null}
      {c.status === 'APPEALED' ? <p className="text-sm text-muted-foreground">{t('Chờ quản trị viên quyết định (thường 3–5 ngày làm việc). Trong lúc chờ món giữ ngành hệ thống đã đặt.')}</p> : null}
      {c.appealNote ? <p className="rounded-sm bg-muted px-3 py-2 text-sm">{t('Bạn giải thích: ')}{c.appealNote}</p> : null}
      {c.decisionReason ? (
        <p className="text-sm text-muted-foreground">
          {t('Quyết định (')}{formatDateTime(c.decidedAt)}): {c.decisionReason}
        </p>
      ) : null}
      {acting ? <ActionForm key={acting} kase={c} kind={acting} onClose={onDone} /> : null}
      {!acting && c.status === 'RESTRICTED' ? (
        <div>
          <Button size="sm" onClick={onResolve}>
            {t('Sửa ngành')}
          </Button>
        </div>
      ) : null}
      {!acting && c.status === 'AUTO_CORRECTED' ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={onConfirm}>
            {t('Đồng ý')}
          </Button>
          <Button size="sm" variant="outline" onClick={onAppeal}>
            {t('Kháng nghị')}
          </Button>
        </div>
      ) : null}
    </li>
  )
}

/** Fixing the category or appealing, right under the case instead of in a dialog. */
function ActionForm({ kase, kind, onClose }: { kase: CategoryCase; kind: 'resolve' | 'appeal'; onClose: () => void }) {
  const tree = useCategoryTree()
  const options = useMemo(() => leaves(tree.data ?? []), [tree.data])
  const resolve = useResolveMyCase()
  const appeal = useAppealMyCase()
  const isResolve = kind === 'resolve'
  const [category, setCategory] = useState(isResolve ? (kase.suggestedCategory?.id ?? '') : '')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const busy = resolve.isPending || appeal.isPending

  const submit = () => {
    setError(null)
    const id = kase.id ?? ''
    const done = (message: string) => ({
      onSuccess: () => {
        toast.success(message)
        onClose()
      },
      onError: (e: unknown) => setError(problemMessage(e)),
    })
    if (isResolve) resolve.mutate({ id, categoryId: category }, done(t('Đã sửa ngành. Món hiện lại khi tìm kiếm.')))
    else appeal.mutate({ id, categoryId: category, note: note.trim() }, done(t('Đã gửi kháng nghị.')))
  }

  return (
    <div className="mt-2 flex flex-col gap-4 rounded-xl bg-grey-50 p-4">
        <div className="flex flex-col gap-1">
          <p className="font-medium">{isResolve ? t('Sửa ngành của món') : t('Kháng nghị')}</p>
          <p className="text-sm text-muted-foreground">
            {isResolve
              ? t('Nên chuyển sang "{v0}". Chọn ngành khác cũng đóng vụ này, nhưng nếu quản trị viên vẫn thấy sai họ có thể đánh dấu lại.', { v0: kase.suggestedCategory?.name })
              : t('Hệ thống đã chuyển món sang "{v0}". Chọn ngành bạn cho là đúng và giải thích; mỗi vụ kháng nghị một lần.', { v0: kase.finalCategory?.name })}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="case-category">{t('Ngành của món')}</Label>
          <CategorySelect id="case-category" options={options} value={category} onChange={setCategory} loading={tree.isPending} />
        </div>
        {!isResolve ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="case-note">{t('Giải thích')}</Label>
            <Textarea id="case-note" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        ) : null}
        <FormError message={error} />
        <div className="flex flex-wrap gap-2">
          <Button disabled={category === '' || (!isResolve && note.trim() === '') || busy} onClick={submit}>
            {isResolve ? t('Lưu ngành') : t('Gửi kháng nghị')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t('Huỷ')}
          </Button>
        </div>
    </div>
  )
}
