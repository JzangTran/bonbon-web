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

const TABS = [
  { hidden: undefined, label: 'Tất cả' },
  { hidden: false, label: 'Đang hiển thị' },
  { hidden: true, label: 'Đã ẩn' },
] as const
const QUICK_REASONS = ['Ngôn từ xúc phạm hoặc tục tĩu.', 'Chứa thông tin cá nhân.', 'Nội dung quảng cáo hoặc spam.', 'Không liên quan đến đơn hàng.']

/** Every review, hidden ones included (moderate-review.md): hide with a reason, restore, and the same for a shop's reply. */
export function AdminReviewsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('review:moderate')
  const [hidden, setHidden] = useState<boolean | undefined>(undefined)
  const [lowOnly, setLowOnly] = useState(false)
  const [page, setPage] = useState(0)
  const reviews = useAdminReviews({ hidden, maxRating: lowOnly ? 2 : undefined, page }, allowed)
  const { hide, unhide } = useModerationActions()
  const [target, setTarget] = useState<ModerationTarget | null>(null)
  const [reason, setReason] = useState('')
  const data = reviews.data
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const size = data?.size ?? 20

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền kiểm duyệt đánh giá.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Kiểm duyệt đánh giá</h1>
        <p className="text-sm text-muted-foreground">
          Ẩn không xoá hẳn và luôn có lý do ghi lại. Đánh giá bị ẩn không tính vào điểm của quán và không hiện công khai; khách vẫn thấy đánh giá của mình.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b">
        <div role="tablist" className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={String(tab.hidden)}
              role="tab"
              aria-selected={hidden === tab.hidden}
              onClick={() => {
                setHidden(tab.hidden)
                setPage(0)
              }}
              className={cn(
                '-mb-px min-h-10 border-b-2 px-3 text-sm whitespace-nowrap',
                hidden === tab.hidden ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="mb-2 flex min-h-10 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(e) => {
              setLowOnly(e.target.checked)
              setPage(0)
            }}
          />
          Chỉ 1–2 sao
        </label>
      </div>

      {reviews.isError ? <FormError message={problemMessage(reviews.error)} /> : null}
      {reviews.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? <Card className="p-6 text-muted-foreground">Không có đánh giá nào.</Card> : null}

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

      <Dialog open={target !== null} onOpenChange={(open) => (open ? undefined : setTarget(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.kind === 'reply' ? 'Ẩn phản hồi của quán?' : 'Ẩn đánh giá này?'}</DialogTitle>
            <DialogDescription>Lý do được ghi vào nhật ký kiểm duyệt và hiện cho người viết.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="hide-reason">Lý do</Label>
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
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={reason.trim().length === 0 || hide.isPending}
              onClick={() => {
                if (target) hide.mutate({ target, reason }, { onSuccess: () => setTarget(null) })
              }}
            >
              Ẩn
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
          {review.hidden ? <Badge className="bg-warning-subtle text-warning-fg">Đã ẩn</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Đơn #{review.orderNumber} · {review.reviewerName} · {formatDateTime(review.createdAt)}
        </p>
      </div>
      {review.comment ? <p>{review.comment}</p> : <p className="text-sm text-muted-foreground">Không có nhận xét.</p>}
      {review.hidden && review.hiddenReason ? <p className="text-sm text-warning-fg">Lý do ẩn: {review.hiddenReason}</p> : null}
      <div>
        {review.hidden ? (
          <Button variant="outline" disabled={busy} onClick={() => onUnhide({ kind: 'review', id: review.id! })}>
            Khôi phục đánh giá
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onHide({ kind: 'review', id: review.id! })}>
            Ẩn đánh giá
          </Button>
        )}
      </div>
      {reply ? (
        <div className="flex flex-col gap-1 rounded-sm bg-muted p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-muted-foreground">Quán phản hồi · {formatDateTime(reply.createdAt)}</p>
            {reply.hidden ? <Badge className="bg-warning-subtle text-warning-fg">Đã ẩn</Badge> : null}
          </div>
          <p>{reply.text}</p>
          {reply.hidden && reply.hiddenReason ? <p className="text-xs text-warning-fg">Lý do ẩn: {reply.hiddenReason}</p> : null}
          <div>
            {reply.hidden ? (
              <Button size="sm" variant="outline" disabled={busy} onClick={() => onUnhide({ kind: 'reply', id: reply.id! })}>
                Khôi phục phản hồi
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onHide({ kind: 'reply', id: reply.id! })}>
                Ẩn phản hồi
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
