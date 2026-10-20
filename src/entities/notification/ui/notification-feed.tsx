import { Link } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { useAckAllNotifications, useAckNotification, useNotifications } from '../api'

const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' })

/** The notification list for the right panel: unread ones are marked with a dot; opening one marks it read. */
export function NotificationFeed({ orderPath }: { orderPath?: (orderId: string) => string }) {
  const query = useNotifications()
  const ack = useAckNotification()
  const ackAll = useAckAllNotifications()
  const items = query.data?.items ?? []
  const unread = query.data?.unread ?? 0

  return (
    <section aria-label="Thông báo" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground">Thông báo{unread > 0 ? ` · ${unread} chưa đọc` : ''}</h2>
        {unread > 0 ? (
          <Button variant="ghost" size="xs" disabled={ackAll.isPending} onClick={() => ackAll.mutate()}>
            Đánh dấu đã đọc
          </Button>
        ) : null}
      </div>
      {query.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có thông báo nào.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((n) => {
            const isUnread = !n.acknowledgedAt
            const body = (
              <>
                <span aria-hidden="true" className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', isUnread ? 'bg-foreground' : 'bg-border')} />
                <span className="min-w-0">
                  <span className={cn('block text-xs leading-[1.125rem]', isUnread ? 'font-semibold' : 'font-medium')}>{n.title}</span>
                  {n.body ? <span className="block text-xs leading-[1.125rem] text-muted-foreground">{n.body}</span> : null}
                  <span className="block text-xs text-muted-foreground tabular-nums">{n.createdAt ? time.format(new Date(n.createdAt)) : ''}</span>
                </span>
              </>
            )
            const onOpen = () => {
              if (isUnread && n.id) ack.mutate(n.id)
            }
            return (
              <li key={n.id}>
                {orderPath && n.orderId ? (
                  <Link to={orderPath(n.orderId)} onClick={onOpen} className="flex gap-2.5 hover:underline">
                    {body}
                  </Link>
                ) : (
                  <button type="button" onClick={onOpen} className="flex w-full gap-2.5 text-left">
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
