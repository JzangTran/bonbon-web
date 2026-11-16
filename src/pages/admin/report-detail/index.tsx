import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ACTION_LABEL, DECISION_LABEL, REASON_LABEL, TARGET_LABEL, useDecideReport, useReport, type ReportDetail } from '@/entities/report'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { consolePath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

type Snapshot = { id?: string; senderType?: string; text?: string | null; imageUrl?: string; createdAt?: string }

/** One report: the evidence as it was when reported, both people's track records, and the decision with a reason. */
export function AdminReportDetailPage() {
  const { id } = useParams()
  const { session } = useSession()
  const report = useReport(id)
  if (!session?.permissions.has('report:read')) return <p className="text-muted-foreground">{t('Bạn không có quyền xem báo cáo vi phạm.')}</p>
  if (report.isError) return <FormError message={problemMessage(report.error)} />
  if (!report.data) return <Skeleton className="h-64" />
  const r = report.data
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to={consolePath('/reports')} className="text-link text-sm">
        {t('← Hàng đợi báo cáo')}
      </Link>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{TARGET_LABEL[r.targetType ?? ''] ?? r.targetType}</Badge>
          <Badge variant="outline">{REASON_LABEL[r.reasonCode ?? ''] ?? r.reasonCode}</Badge>
          {r.decisionCode ? <Badge>{DECISION_LABEL[r.decisionCode] ?? r.decisionCode}</Badge> : null}
        </div>
        <h1 className="text-xl font-semibold">{r.targetLabel}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Gửi lúc {v0} bởi một {v1}.', { v0: formatDateTime(r.createdAt), v1: r.reporterSide === 'SELLER' ? t('người bán') : t('khách') })}{' '}
          {t('Người này có {v0} báo cáo trong 90 ngày, {v1} bị bác.', { v0: r.reporterReports90d ?? 0, v1: r.reporterDismissed90d ?? 0 })}{' '}
          {t('Người hoặc quán bị báo cáo có {v0} lần bị xử lý trước đây.', { v0: r.targetActionedBefore ?? 0 })}
        </p>
        {r.note ? <p className="rounded-md bg-muted p-3 text-sm">{t('Ghi chú của người báo cáo: ')}{r.note}</p> : null}
        {r.contestedAt ? (
          <p className="rounded-md bg-warning-subtle p-3 text-sm text-warning-fg">
            {t('Người bị xử lý khiếu nại lúc {v0}: ', { v0: formatDateTime(r.contestedAt) })}{r.contestNote}
          </p>
        ) : null}
      </div>

      <Card className="gap-3 p-4">
        <h2 className="font-semibold">{t('Bằng chứng lúc báo cáo')}</h2>
        <Evidence report={r} />
      </Card>

      {r.status === 'OPEN' ? <DecideCard report={r} /> : (
        <Card className="gap-1 p-4 text-sm">
          <p className="font-semibold">{DECISION_LABEL[r.decisionCode ?? ''] ?? r.decisionCode}</p>
          <p className="text-muted-foreground">{formatDateTime(r.decidedAt)} · {r.decisionReason}</p>
        </Card>
      )}
    </div>
  )
}

function Evidence({ report: r }: { report: ReportDetail }) {
  const e = (r.evidence ?? {}) as Record<string, unknown>
  if (r.targetType === 'MESSAGE') {
    const before = (e.before as Snapshot[] | undefined) ?? []
    const after = (e.after as Snapshot[] | undefined) ?? []
    const message = e.message as Snapshot | undefined
    return (
      <div className="flex flex-col gap-2">
        {r.evidence && e.conversationId ? (
          <Link to={consolePath(`/conversations/${String(e.conversationId)}`)} className="text-link self-start text-xs">
            {t('Mở cả cuộc trò chuyện (được ghi lại)')}
          </Link>
        ) : null}
        {[...before, ...(message ? [message] : []), ...after].map((m) => (
          <div key={m.id} className={cn('rounded-md p-2 text-sm', m.id === message?.id ? 'border-2 border-destructive' : 'bg-muted')}>
            <p className="text-xs text-muted-foreground">
              {m.senderType === 'SHOP' ? String(e.shopName ?? t('Cửa hàng')) : t('Khách')} · {formatDateTime(m.createdAt)}
            </p>
            {m.imageUrl ? <img src={m.imageUrl} alt={t('Ảnh trong tin nhắn')} className="my-1 max-h-48 rounded-sm" /> : null}
            {m.text ? <p className="whitespace-pre-wrap">{m.text}</p> : null}
          </div>
        ))}
      </div>
    )
  }
  if (r.targetType === 'REVIEW') {
    return (
      <div className="text-sm">
        <p className="font-medium">{String(e.reviewerName ?? '')} · {String(e.rating ?? '')}★ · {String(e.shopName ?? '')}</p>
        <p className="whitespace-pre-wrap">{String(e.comment ?? t('(không có nhận xét)'))}</p>
      </div>
    )
  }
  if (r.targetType === 'REVIEW_RESPONSE') {
    return <p className="text-sm whitespace-pre-wrap">{String(e.shopName ?? '')}: {String(e.text ?? '')}</p>
  }
  return (
    <p className="text-sm">
      {t('Cửa hàng ')}
      <Link to={consolePath(`/merchants/${String(e.shopId ?? '')}`)} className="text-link">
        {String(e.shopName ?? '')}
      </Link>
    </p>
  )
}

function DecideCard({ report: r }: { report: ReportDetail }) {
  const decide = useDecideReport(r.id ?? '')
  const [action, setAction] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [days, setDays] = useState(3)
  const ready = !!action && reason.trim().length > 0 && (action !== 'RESTRICT' || (days >= 1 && days <= 30))
  return (
    <Card className="gap-3 p-4">
      <h2 className="font-semibold">{r.contestedAt ? t('Xem lại quyết định') : t('Quyết định')}</h2>
      {r.contestedAt ? (
        <p className="text-sm text-muted-foreground">{t('Chọn Không vi phạm sẽ khôi phục nội dung và gỡ hạn chế đã áp dụng.')}</p>
      ) : null}
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{t('Hành động')}</legend>
        {(r.allowedActions ?? []).map((a) => (
          <label key={a} className="flex cursor-pointer items-start gap-2 rounded-md border p-2 text-sm has-checked:border-primary has-checked:bg-accent">
            <input type="radio" name="decision" className="mt-1" checked={action === a} onChange={() => setAction(a)} />
            <span>
              <span className="font-medium">{ACTION_LABEL[a]?.label ?? a}</span>
              <span className="block text-xs text-muted-foreground">{ACTION_LABEL[a]?.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {action === 'RESTRICT' ? (
        <label className="flex items-center gap-2 text-sm">
          {t('Số ngày hạn chế')}
          <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-9 w-20 rounded-md border px-2" />
        </label>
      ) : null}
      <label htmlFor="decision-reason" className="text-sm font-medium">
        {t('Lý do (người bị xử lý sẽ đọc)')}
      </label>
      <Textarea id="decision-reason" maxLength={500} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
      {decide.isError ? <FormError message={problemMessage(decide.error)} /> : null}
      <Button
        className="self-end"
        disabled={!ready || decide.isPending}
        onClick={() => decide.mutate({ action: action as 'DISMISS', reason: reason.trim(), restrictDays: action === 'RESTRICT' ? days : undefined })}
      >
        {t('Xác nhận quyết định')}
      </Button>
    </Card>
  )
}
