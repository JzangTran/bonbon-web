import { useState } from 'react'
import { Link } from 'react-router'
import { CASE_STATUS, CASE_TYPE_LABEL, useShopCases, type CaseStatus } from '@/entities/order-case'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { EmptyState } from '@/shared/ui/empty-state'
import { FilterChips } from '@/shared/ui/filter-chips'
import { FormError } from '@/widgets/auth-shell'
import { OrderCaseTabs } from '@/widgets/seller-tabs'
import { merchantPath } from '@/shared/config/sites'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { t } from '@/shared/i18n'

const TABS: { id: CaseStatus; label: string }[] = [
  { id: 'AWAITING_SHOP', label: t('Chờ quán trả lời') },
  { id: 'OPEN', label: t('Chờ quản trị') },
  { id: 'UPHELD', label: t('Đã chấp nhận') },
  { id: 'DISMISSED', label: t('Đã bác bỏ') },
]

/** What customers reported about this shop's delivered orders (respond-to-order-case.md). */
export function SellerOrderCasesPage() {
  const [tab, setTab] = useState<CaseStatus>('AWAITING_SHOP')
  const paging = usePaging()
  const cases = useShopCases(tab, paging.page, paging.size)
  const now = useNow(60_000)
  const data = cases.data
  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <OrderCaseTabs />
      <div>
        <h1 className="text-2xl font-semibold">{t('Khiếu nại của khách')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Khách báo chưa nhận được hàng, thiếu món, sai món hoặc chất lượng. Bạn có 12 giờ để chấp nhận (khách được hoàn tiền) hoặc phản đối (quản trị viên quyết định). Không trả lời kịp cũng chuyển cho quản trị viên.')}
        </p>
      </div>

      <FilterChips
        label={t('Trạng thái khiếu nại')}
        chips={TABS.map((tItem) => ({ id: tItem.id, label: tItem.id === tab && total > 0 ? `${tItem.label} (${total})` : tItem.label }))}
        value={tab}
        onChange={(id) => {
          setTab(id)
          paging.reset()
        }}
      />

      {cases.isError ? <FormError message={problemMessage(cases.error)} /> : null}
      {cases.isPending ? <Skeleton className="h-32" /> : null}
      {data && items.length === 0 ? <EmptyState title={t('Không có khiếu nại nào ở mục này.')} /> : null}

      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const status = CASE_STATUS[item.status ?? ''] ?? { label: item.status ?? '', className: '' }
          const hoursLeft = item.status === 'AWAITING_SHOP' && item.shopResponseDueAt ? Math.max(0, Math.ceil((new Date(item.shopResponseDueAt).getTime() - now) / 3_600_000)) : null
          return (
            <li key={item.id}>
              <Link to={merchantPath(`/order-cases/${item.id}`)} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card className="gap-2 p-4 transition-colors hover:bg-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t('Đơn #')}{item.orderNumber}</span>
                      <Badge variant="outline">{CASE_TYPE_LABEL[item.type ?? ''] ?? item.type}</Badge>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">{formatVnd(item.shopBears)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('Khách được hoàn ')}{formatVnd(item.refundAmount)}{t('; quán chịu ')}{formatVnd(item.shopBears)} · {formatDateTime(item.openedAt)}
                    {hoursLeft !== null ? t(' · còn khoảng {v0} giờ để trả lời', { v0: hoursLeft }) : ''}
                  </p>
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>

      <Pagination paging={paging} total={total} />
    </div>
  )
}
