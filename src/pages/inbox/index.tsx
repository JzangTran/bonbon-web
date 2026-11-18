import { useState } from 'react'
import { NotificationFeed, type AppNotification } from '@/entities/notification'
import { t } from '@/shared/i18n'
import { Chip } from '@/shared/ui/chip'

type Filter = 'all' | 'unread' | 'orders' | 'other'

const FILTERS: { key: Filter; label: string; test?: (n: AppNotification) => boolean }[] = [
  { key: 'all', label: t('Tất cả') },
  { key: 'unread', label: t('Chưa đọc'), test: (n) => !n.acknowledgedAt },
  { key: 'orders', label: t('Đơn hàng'), test: (n) => !!n.orderId },
  { key: 'other', label: t('Khác'), test: (n) => !n.orderId },
]

/**
 * Hộp thư (design v5): every notification, filterable, each row leading to its task. The bell in the header shows the newest five in
 * a popover and links here; there is no side panel any more.
 */
export function InboxPage({ orderPath }: { orderPath?: (orderId: string) => string }) {
  const [filter, setFilter] = useState<Filter>('all')
  const active = FILTERS.find((f) => f.key === filter)
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-title-1 text-text">{t('Hộp thư')}</h1>
        <p className="text-body-sm text-text-secondary">{t('Thông báo về đơn hàng, thanh toán, đánh giá và tài khoản. Mở một thông báo để đi thẳng tới việc cần làm.')}</p>
      </div>
      <div role="group" aria-label={t('Lọc thông báo')} className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.key} selected={filter === f.key} onSelectedChange={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <NotificationFeed orderPath={orderPath} filter={active?.test} />
    </div>
  )
}
