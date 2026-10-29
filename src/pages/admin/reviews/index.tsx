import { useState } from 'react'
import { Stars, useAdminReviews, useModerationActions, type ModerationTarget, type Review } from '@/entities/review'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { t } from '@/shared/i18n'

const TABS = [
  { hidden: undefined, label: t('Tất cả') },
  { hidden: false, label: t('Đang hiển thị') },
  { hidden: true, label: t('Đã ẩn') },
] as const
const QUICK_REASONS = [t('Ngôn từ xúc phạm hoặc tục tĩu.'), t('Chứa thông tin cá nhân.'), t('Nội dung quảng cáo hoặc spam.'), t('Không liên quan đến đơn hàng.')]

/** Every review, hidden ones included (moderate-review.md): hide with a reason, restore, and the same for a shop's reply. */
export function AdminReviewsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('review:moderate')
  const [hidden, setHidden] = useState<boolean | undefined>(undefined)
  const [lowOnly, setLowOnly] = useState(false)
  const paging = usePaging()
  const reviews = useAdminReviews({ hidden, maxRating: lowOnly ? 2 : undefined, page: paging.page, size: paging.size }, allowed)
  const { hide, unhide } = useModerationActions()
  const [target, setTarget] = useState<ModerationTarget | null>(null)
  const [reason, setReason] = useState('')
  const data = reviews.data
  const items = data?.items ?? []
  const total = data?.total ?? 0

  if (!allowed) return <p className="text-muted-foreground">{t('Bạn không có quyền kiểm duyệt đánh giá.')}</p>

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">{t('Kiểm duyệt đánh giá')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Ẩn không xoá hẳn và luôn có lý do ghi lại. Đánh giá bị ẩn không tính vào điểm của quán và không hiện công khai; khách vẫn thấy đánh giá của mình.')}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <PageTabs
          label={t('Đánh giá')}
          tabs={TABS.map((tItem) => ({ id: String(tItem.hidden), label: tItem.label }))}
          value={String(hidden)}
          onValueChange={(id) => {
            setHidden(TABS.find((tItem) => String(tItem.hidden) === id)?.hidden)
            paging.reset()
          }}
        />
        <label className="mb-2 flex min-h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => {
              setLowOnly(e.target.checked)
              paging.reset()
            }}
          />
          {t('Chỉ 1–2 sao')}
        </label>
      </div>

      {reviews.isError ? <FormError message={problemMessage(reviews.error)} /> : null}
      {reviews.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? <Card className="p-6 text-muted-foreground">{t('Không có đánh giá nào.')}</Card> : null}

      <ul className="flex flex-col gap-3">
        {items.map((review) => (
          <li key={review.id}>
            <ReviewRow
              review={review}
              busy={unhide.isPending}
              onHide={(next) => {
                setReason('')
                setTarget(next)
              }}
              onUnhide={(next) => unhide.mutate(next)}
            />
          </li>
        ))}
      </ul>

      <Pagination paging={paging} total={total} />

      <Dialog open={target !== null} onOpenChange={(open) => (open ? undefined : setTarget(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.kind === 'reply' ? t('Ẩn phản hồi của quán?') : t('Ẩn đánh giá này?')}</DialogTitle>
            <DialogDescription>{t('Lý do được ghi vào nhật ký kiểm duyệt và hiện cho người viết.')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hide-reason">{t('Lý do')}</Label>
            <Textarea id="hide-reason" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map((quick) => (
                <Button key={quick} type="button" size="sm" variant="outline" onClick={() => setReason(quick)}>
                  {quick}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('Huỷ')}</Button>
            </DialogClose>
            <Button
              disabled={reason.trim().length === 0 || hide.isPending}
              onClick={() => {
                if (target) hide.mutate({ target, reason }, { onSuccess: () => setTarget(null) })
              }}
            >
              {t('Ẩn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ReviewRow({ review, busy, onHide, onUnhide }: {
  review: Review
  busy: boolean
  onHide: (target: ModerationTarget) => void
  onUnhide: (target: ModerationTarget) => void
}) {
  const reply = review.reply
  return (
    <Card className={cn('gap-2 p-4', review.hidden && 'border-warning')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stars value={review.rating ?? 0} />
          {review.hidden ? <Badge className="bg-warning-subtle text-warning-fg">{t('Đã ẩn')}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {t('Đơn #')}{review.orderNumber} · {review.reviewerName} · {formatDateTime(review.createdAt)}
        </p>
      </div>
      {review.comment ? <p>{review.comment}</p> : <p className="text-sm text-muted-foreground">{t('Không có nhận xét.')}</p>}
      {review.hidden && review.hiddenReason ? <p className="text-sm text-warning-fg">{t('Lý do ẩn: ')}{review.hiddenReason}</p> : null}
      <div>
        {review.hidden ? (
          <Button variant="outline" disabled={busy} onClick={() => onUnhide({ kind: 'review', id: review.id! })}>
            {t('Khôi phục đánh giá')}
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onHide({ kind: 'review', id: review.id! })}>
            {t('Ẩn đánh giá')}
          </Button>
        )}
      </div>
      {reply ? (
        <div className="flex flex-col gap-1 rounded-sm bg-muted p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">{t('Quán phản hồi · ')}{formatDateTime(reply.createdAt)}</p>
            {reply.hidden ? <Badge className="bg-warning-subtle text-warning-fg">{t('Đã ẩn')}</Badge> : null}
          </div>
          <p>{reply.text}</p>
          {reply.hidden && reply.hiddenReason ? <p className="text-xs text-warning-fg">{t('Lý do ẩn: ')}{reply.hiddenReason}</p> : null}
          <div>
            {reply.hidden ? (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onUnhide({ kind: 'reply', id: reply.id! })}>
                {t('Khôi phục phản hồi')}
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onHide({ kind: 'reply', id: reply.id! })}>
                {t('Ẩn phản hồi')}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
