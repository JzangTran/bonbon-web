import { useState } from 'react'
import { Link } from 'react-router'
import { useSession } from '@/entities/session'
import {
  DECISION_LABEL,
  REASON_LABEL,
  TARGET_LABEL,
  useModerationTerms,
  useReports,
  useTermActions,
  type ReportStatus,
} from '@/entities/report'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Pagination } from '@/shared/ui/pagination'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { FormError } from '@/widgets/auth-shell'
import { consolePath } from '@/shared/config/sites'
import { usePaging } from '@/shared/lib/use-paging'
import { t } from '@/shared/i18n'

type Tab = ReportStatus | 'TERMS'
const TABS: { id: Tab; label: string }[] = [
  { id: 'OPEN', label: t('Cần xử lý') },
  { id: 'ACTIONED', label: t('Đã xử lý') },
  { id: 'DISMISSED', label: t('Không vi phạm') },
  { id: 'TERMS', label: t('Từ bị che') },
]
const TYPES = ['', 'MESSAGE', 'REVIEW', 'REVIEW_RESPONSE', 'SHOP']

/** Reports of messages, reviews, replies and shops waiting for a decision (review-reports.md), and the chat word list. */
export function AdminReportsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('report:read')
  const [tab, setTab] = useState<Tab>('OPEN')
  const [type, setType] = useState('')
  const paging = usePaging()
  const reports = useReports(tab === 'TERMS' ? 'OPEN' : tab, type || undefined, paging.page, allowed && tab !== 'TERMS', paging.size)
  const items = reports.data?.items ?? []
  const total = reports.data?.total ?? 0

  if (!allowed) return <p className="text-muted-foreground">{t('Bạn không có quyền xem báo cáo vi phạm.')}</p>

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-title-1">{t('Báo cáo vi phạm')}</h1>
        <p className="text-body-sm text-muted-foreground">
          {t('Khách và người bán báo cáo tin nhắn, đánh giá, phản hồi hoặc cửa hàng. Báo cáo không tự ẩn hay phạt ai; bạn quyết định kèm lý do. Mục tiêu: xử lý trong 24 giờ.')}
        </p>
      </div>

      <PageTabs
        label={t('Báo cáo vi phạm')}
        tabs={TABS.map((x) => ({ id: x.id, label: x.label, count: x.id === tab && tab !== 'TERMS' ? total : undefined }))}
        value={tab}
        onValueChange={(id) => {
          setTab(id as Tab)
          paging.reset()
        }}
      />

      {tab === 'TERMS' ? (
        <TermsPanel canEdit={!!session?.permissions.has('moderation:write')} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t('Lọc theo loại nội dung')}>
            {TYPES.map((x) => (
              <Button
                key={x || 'ALL'}
                size="sm"
                variant={type === x ? 'default' : 'outline'}
                onClick={() => {
                  setType(x)
                  paging.reset()
                }}
              >
                {x ? TARGET_LABEL[x] : t('Tất cả')}
              </Button>
            ))}
          </div>
          {reports.isError ? <FormError message={problemMessage(reports.error)} /> : null}
          {reports.isPending ? <Skeleton className="h-32" /> : null}
          {reports.data && items.length === 0 ? <EmptyState mascot="all-clear" title={t('Không có báo cáo nào ở mục này.')} /> : null}
          <ul className="flex flex-col gap-3">
            {items.map((r) => (
              <li key={r.id}>
                <Link to={consolePath(`/reports/${r.id}`)} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <Card className="gap-2 p-4 transition-colors hover:bg-accent">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{TARGET_LABEL[r.targetType ?? ''] ?? r.targetType}</Badge>
                      <Badge variant="outline">{REASON_LABEL[r.reasonCode ?? ''] ?? r.reasonCode}</Badge>
                      {r.contested ? <Badge className="bg-warning-subtle text-warning-fg">{t('Bị khiếu nại lại')}</Badge> : null}
                      {r.overdue ? <Badge className="bg-destructive/10 text-destructive">{t('Quá 24 giờ')}</Badge> : null}
                      {r.decisionCode ? <Badge variant="outline">{DECISION_LABEL[r.decisionCode] ?? r.decisionCode}</Badge> : null}
                    </div>
                    <p className="truncate">{r.targetLabel}</p>
                    <p className="text-body-sm text-muted-foreground">
                      {r.status === 'OPEN' ? t('Gửi {v0}', { v0: formatRelative(r.createdAt) }) : formatDateTime(r.createdAt)}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination paging={paging} total={total} />
        </>
      )}
    </div>
  )
}

/** The word list: matched on letters without accents too, masked only in what the reader sees. */
function TermsPanel({ canEdit }: { canEdit: boolean }) {
  const terms = useModerationTerms(canEdit)
  const { add, toggle, remove } = useTermActions()
  const [term, setTerm] = useState('')
  if (!canEdit) return <p className="text-muted-foreground">{t('Cần quyền moderation:write để quản lý danh sách từ.')}</p>
  const valid = term.trim().length >= 2 && term.trim().length <= 50
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-muted-foreground">
        {t('Từ hoặc cụm từ trong danh sách bị thay bằng *** trong tin nhắn người nhận đọc, kể cả khi gõ không dấu. Tin gốc vẫn được lưu. Đây là bộ lọc tối thiểu, không thay cho báo cáo.')}
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) add.mutate(term.trim(), { onSuccess: () => setTerm('') })
        }}
      >
        <Input value={term} maxLength={50} placeholder={t('Thêm từ, 2–50 ký tự')} aria-label={t('Từ cần che')} onChange={(e) => setTerm(e.target.value)} />
        <Button type="submit" disabled={!valid || add.isPending}>
          {t('Thêm')}
        </Button>
      </form>
      {terms.isPending ? <Skeleton className="h-20" /> : null}
      {terms.data && terms.data.length === 0 ? <p className="text-body-sm text-muted-foreground">{t('Danh sách đang trống.')}</p> : null}
      <ul className="flex flex-col divide-y rounded-md border">
        {(terms.data ?? []).map((x) => (
          <li key={x.id} className="flex items-center justify-between gap-3 px-3 py-2">
            <span className={x.active ? '' : 'text-muted-foreground line-through'}>{x.term}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={toggle.isPending} onClick={() => toggle.mutate({ id: x.id ?? '', active: !x.active })}>
                {x.active ? t('Tắt') : t('Bật')}
              </Button>
              <Button size="sm" variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(x.id ?? '')}>
                {t('Xoá')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
