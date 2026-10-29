import { useState } from 'react'
import { Stars, useReplyActions, useSellerReviews, type Review } from '@/entities/review'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { t } from '@/shared/i18n'

const TABS = [
  { unreplied: false, label: t('Tất cả') },
  { unreplied: true, label: t('Chưa phản hồi') },
] as const

/** Customers' reviews of the shop and the one reply each (respond-to-review.md); a reply can change for 24 hours. */
export function SellerReviewsPage() {
  const [unreplied, setUnreplied] = useState(false)
  const paging = usePaging()
  const reviews = useSellerReviews(unreplied, paging.page, paging.size)
  const { save, remove } = useReplyActions()
  const now = useNow(60_000)
  const [target, setTarget] = useState<Review | null>(null)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState<Review | null>(null)
  const data = reviews.data
  const items = data?.items ?? []
  const total = data?.total ?? 0
  const editing = !!target?.reply

  const openReply = (review: Review) => {
    setTarget(review)
    setText(review.reply?.text ?? '')
  }

  const submit = () => {
    if (!target?.id) return
    save.mutate({ reviewId: target.id, text, existing: editing }, { onSuccess: () => setTarget(null) })
  }

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">{t('Đánh giá của khách')}</h1>
        <p className="text-sm text-muted-foreground">{t('Phản hồi hiển thị công khai dưới đánh giá. Sửa hoặc xoá được trong 24 giờ kể từ lúc đăng.')}</p>
      </div>

      <div role="tablist" className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={String(tab.unreplied)}
            role="tab"
            aria-selected={unreplied === tab.unreplied}
            onClick={() => {
              setUnreplied(tab.unreplied)
              paging.reset()
            }}
            className={cn(
              '-mb-px min-h-10 border-b-2 px-3 text-sm whitespace-nowrap',
              unreplied === tab.unreplied ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {tab.label}
            {unreplied === tab.unreplied && total > 0 ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {reviews.isError ? <FormError message={problemMessage(reviews.error)} /> : null}
      {reviews.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? (
        <Card className="p-6 text-muted-foreground">{unreplied ? t('Bạn đã phản hồi hết các đánh giá.') : t('Quán chưa có đánh giá nào.')}</Card>
      ) : null}

      <ul className="flex flex-col gap-3">
        {items.map((review) => {
          const reply = review.reply
          const open = !!reply?.editableUntil && new Date(reply.editableUntil).getTime() > now
          return (
            <li key={review.id}>
              <Card className="gap-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Stars value={review.rating ?? 0} />
                  <p className="text-sm text-muted-foreground">
                    {t('Đơn #')}{review.orderNumber} · {review.reviewerName} · {formatRelative(review.createdAt)}
                  </p>
                </div>
                {review.comment ? <p>{review.comment}</p> : <p className="text-sm text-muted-foreground">{t('Không có nhận xét.')}</p>}
                {reply ? (
                  <div className="rounded-sm bg-muted p-3 text-sm">
                    <p className="text-xs text-muted-foreground">{t('Quán phản hồi · ')}{formatRelative(reply.createdAt)}</p>
                    <p>{reply.text}</p>
                    {reply.hidden ? (
                      <p className="mt-1 text-xs text-warning-fg">
                        {t('Phản hồi bị ẩn vì vi phạm quy định')}{reply.hiddenReason ? `: ${reply.hiddenReason}` : ''}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {target?.id === review.id ? (
                  <form
                    className="mt-2 flex flex-col gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      submit()
                    }}
                  >
                    <Label htmlFor={`reply-${review.id}`}>{editing ? t('Sửa phản hồi') : t('Phản hồi của quán')}</Label>
                    <Textarea
                      id={`reply-${review.id}`}
                      autoFocus
                      rows={4}
                      maxLength={1000}
                      value={text}
                      placeholder={t('Hãy lịch sự và cụ thể. Phản hồi hiển thị công khai.')}
                      onChange={(e) => setText(e.target.value)}
                    />
                    {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={text.trim().length === 0 || save.isPending}>
                        {editing ? t('Lưu thay đổi') : t('Gửi phản hồi')}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setTarget(null)}>
                        {t('Huỷ')}
                      </Button>
                    </div>
                  </form>
                ) : null}
                <div className={cn('flex flex-wrap items-center gap-2', target?.id === review.id && 'hidden')}>
                  {!reply ? <Button onClick={() => openReply(review)}>{t('Phản hồi')}</Button> : null}
                  {reply && !reply.hidden && open ? (
                    <>
                      <Button variant="outline" onClick={() => openReply(review)}>
                        {t('Sửa phản hồi')}
                      </Button>
                      <Button variant="outline" onClick={() => setDeleting(review)}>
                        {t('Xoá')}
                      </Button>
                      <span className="text-xs text-muted-foreground">{t('Sửa hoặc xoá được đến ')}{formatDateTime(reply.editableUntil)}</span>
                    </>
                  ) : null}
                  {reply && !reply.hidden && !open ? <span className="text-xs text-muted-foreground">{t('Đã quá 24 giờ, không sửa hoặc xoá được phản hồi.')}</span> : null}
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      <Pagination paging={paging} total={total} />

      <Dialog open={deleting !== null} onOpenChange={(open) => (open ? undefined : setDeleting(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Xoá phản hồi này?')}</DialogTitle>
            <DialogDescription>{t('Bạn có thể phản hồi lại sau đó.')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('Huỷ')}</Button>
            </DialogClose>
            <Button
              disabled={remove.isPending}
              onClick={() => {
                if (deleting?.id) remove.mutate(deleting.id)
                setDeleting(null)
              }}
            >
              {t('Xoá')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
