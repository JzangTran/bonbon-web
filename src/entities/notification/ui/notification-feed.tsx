import { Link } from 'react-router'
import { useAckAllNotifications, useAckNotification, useNotifications, type AppNotification } from '../api'
import { intlLocale, t } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

const time = new Intl.DateTimeFormat(intlLocale, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })

/**
 * The user's notifications (design v5): unread first in weight, each row leading straight to the task it is about (the order), and
 * marked read when opened. `limit` shows only the newest few (the bell's popover); `filter` narrows the list (the inbox page).
 */
export function NotificationFeed({
  orderPath,
  limit,
  filter,
  heading = true,
}: {
  orderPath?: (orderId: string) => string
  limit?: number
  filter?: (n: AppNotification) => boolean
  heading?: boolean
}) {
  const query = useNotifications()
  const ack = useAckNotification()
  const ackAll = useAckAllNotifications()
  const all = query.data?.items ?? []
  const filtered = filter ? all.filter(filter) : all
  const items = limit ? filtered.slice(0, limit) : filtered
  const unread = query.data?.unread ?? 0

  return (
    <section aria-label={t('Thông báo')} className="flex flex-col gap-3">
      {heading ? (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-label text-text">
            {t('Thông báo')}
            {unread > 0 ? <span className="ml-1 text-text-secondary">{t('· {v0} chưa đọc', { v0: unread })}</span> : null}
          </h2>
          {unread > 0 ? (
            <Button variant="ghost" size="xs" disabled={ackAll.isPending} onClick={() => ackAll.mutate()}>
              {t('Đánh dấu đã đọc')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {query.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-body-sm text-text-secondary">{filter ? t('Không có thông báo nào ở mục này.') : t('Chưa có thông báo nào. Đơn mới, thanh toán và đánh giá sẽ báo ở đây.')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-divider">
          {items.map((n) => {
            const isUnread = !n.acknowledgedAt
            const body = (
              <>
                <span aria-hidden="true" className={cn('mt-2 size-2 shrink-0 rounded-full', isUnread ? 'bg-primary' : 'bg-transparent')} />
                <span className="min-w-0">
                  <span className={cn('block text-body-sm text-text', isUnread && 'font-semibold')}>
                    {isUnread ? <span className="sr-only">{t('Chưa đọc: ')}</span> : null}
                    {n.title}
                  </span>
                  {n.body ? <span className="block text-body-sm text-text-secondary">{n.body}</span> : null}
                  <span className="block text-caption text-text-tertiary tabular-nums">{n.createdAt ? time.format(new Date(n.createdAt)) : ''}</span>
                </span>
              </>
            )
            const onOpen = () => {
              if (isUnread && n.id) ack.mutate(n.id)
            }
            const row = 'flex w-full gap-3 rounded-control px-2 py-3 text-left transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-ring'
            return (
              <li key={n.id}>
                {orderPath && n.orderId ? (
                  <Link to={orderPath(n.orderId)} onClick={onOpen} className={row}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" onClick={onOpen} className={row}>
                    {body}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
