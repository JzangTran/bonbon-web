import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useShopCases } from '@/entities/order-case'
import { useShopOrders, type OrderStatus } from '@/entities/order'
import { useSellerReviews } from '@/entities/review'
import { useShop } from '@/entities/shop'
import { useRevenueStats, type RevenueBucket } from '@/entities/statistics'
import { merchantPath } from '@/shared/config/sites'
import { presetRange, shortLabel, vietnamToday } from '@/shared/lib/date-range'
import { formatVnd } from '@/shared/lib/format'
import { periodLabel } from '@/shared/lib/ledger'
import { useNow } from '@/shared/lib/use-now'
import { PageStack, Section, StatsPanel } from '@/shared/ui/section'
import { ChartPanel, type ChartMetric } from '@/widgets/chart-panel'
import { intlLocale, t } from '@/shared/i18n'

type Todo = { label: string; statuses: OrderStatus[] }

const TODOS: Todo[] = [
  { label: t('Chờ xác nhận'), statuses: ['PLACED'] },
  { label: t('Đang chuẩn bị'), statuses: ['CONFIRMED', 'PREPARING'] },
  { label: t('Đang giao'), statuses: ['OUT_FOR_DELIVERY'] },
  { label: t('Đã giao'), statuses: ['DELIVERED'] },
  { label: t('Đã huỷ hoặc từ chối'), statuses: ['CANCELLED', 'REJECTED', 'NOT_DELIVERED'] },
]

const METRICS: ChartMetric<RevenueBucket>[] = [
  { id: 'revenue', label: t('Doanh thu'), value: (b) => b.revenue, format: formatVnd },
  { id: 'orders', label: t('Đơn đã giao'), value: (b) => b.orders, format: (n) => t('{v0} đơn', { v0: n.toLocaleString(intlLocale) }) },
]

/** What needs the shop right now (orders by stage, cases and reviews waiting), then how the last seven days went. */
export function SellerDashboardPage() {
  const shop = useShop()
  const unreplied = useSellerReviews(true, 0)
  const waitingCases = useShopCases('AWAITING_SHOP', 0)
  const week = presetRange('7d', vietnamToday(useNow(60_000)))
  const revenue = useRevenueStats(week, 'day')

  return (
    <PageStack>
      <div className="flex flex-col gap-2">
        <h1>{t('Tổng quan cửa hàng')}</h1>
        <p className="text-ui text-muted-foreground">{shop.data?.shop?.name}</p>
      </div>

      <Section title={t('Cần làm ngay')} description={t('Bấm vào một ô để mở danh sách tương ứng.')}>
        <StatsPanel className="p-2 sm:p-3">
          <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {TODOS.map((todo) => (
              <TodoCount key={todo.label} todo={todo} />
            ))}
            <Count to={merchantPath('/order-cases')} value={waitingCases.data?.total} label={t('Khiếu nại chờ trả lời')} />
            <Count to={merchantPath('/reviews')} value={unreplied.data?.total} label={t('Đánh giá chưa phản hồi')} />
          </ul>
        </StatsPanel>
      </Section>

      {revenue.data ? (
        <ChartPanel
          title={t('7 ngày qua')}
          description={
            <Link to={merchantPath('/statistics')} className="text-link inline-flex items-center gap-1 text-ink">
              {t('Xem đầy đủ trong Doanh thu ')}<ArrowRightIcon className="size-3.5" aria-hidden="true" />
            </Link>
          }
          metrics={METRICS}
          current={revenue.data.buckets ?? []}
          label={(b) => shortLabel(b.start ?? '', 'day')}
          full={(b) => periodLabel(b.start ?? '', 'day')}
        />
      ) : null}
    </PageStack>
  )
}

function Count({ to, value, label }: { to: string; value: number | undefined; label: string }) {
  return (
    <li>
      <Link to={to} className="flex h-full flex-col gap-1 rounded-lg px-3 py-3 outline-none hover:bg-white/70 focus-visible:ring-2 focus-visible:ring-ring">
        <span className="text-[1.75rem] leading-9 font-semibold tabular-nums">{value ?? '–'}</span>
        <span className="text-small text-muted-foreground">{label}</span>
      </Link>
    </li>
  )
}

function TodoCount({ todo }: { todo: Todo }) {
  const orders = useShopOrders({ statuses: todo.statuses, size: 1 }, false)
  return <Count to={merchantPath('/orders')} value={orders.data?.total} label={todo.label} />
}
