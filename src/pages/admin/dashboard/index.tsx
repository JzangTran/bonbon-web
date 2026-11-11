import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router'
import { usePlatformOverview, type PlatformOverviewBucket } from '@/entities/platform-stats'
import { useSession } from '@/entities/session'
import { consolePath } from '@/shared/config/sites'
import { presetRange, shortLabel, vietnamToday } from '@/shared/lib/date-range'
import { formatVnd } from '@/shared/lib/format'
import { periodLabel } from '@/shared/lib/ledger'
import { useNow } from '@/shared/lib/use-now'
import { PageStack, Section } from '@/shared/ui/section'
import { AdminHomeTabs } from '@/widgets/admin-tabs'
import { ChartPanel, type ChartMetric } from '@/widgets/chart-panel'
import { intlLocale, t } from '@/shared/i18n'

const QUEUES = [
  { to: consolePath('/shop-review'), title: t('Duyệt hồ sơ cửa hàng'), text: t('Hồ sơ người bán chờ duyệt hoặc cần xem lại.') },
  { to: consolePath('/order-cases'), title: t('Khiếu nại đơn hàng'), text: t('Vụ khách báo lỗi mà quán phản đối hoặc không trả lời kịp.') },
  { to: consolePath('/refunds'), title: t('Hoàn tiền'), text: t('Khoản hoàn tiền chờ chuyển khoản.') },
  { to: consolePath('/support-tickets'), title: t('Phiếu hỗ trợ'), text: t('Yêu cầu từ khách và người bán đang chờ phản hồi.') },
  { to: consolePath('/contact-requests'), title: t('Yêu cầu liên hệ'), text: t('Câu hỏi gửi từ trang Liên hệ hỗ trợ, trả lời qua email.') },
  { to: consolePath('/reviews'), title: t('Kiểm duyệt đánh giá'), text: t('Đánh giá và phản hồi cần ẩn hoặc khôi phục.') },
  { to: consolePath('/category-moderation'), title: t('Món sai ngành'), text: t('Món bị đánh dấu xếp sai ngành hàng, kể cả kháng nghị.') },
]

const METRICS: ChartMetric<PlatformOverviewBucket>[] = [
  { id: 'orders', label: t('Số đơn'), value: (b) => b.orders, format: (n) => t('{v0} đơn', { v0: n.toLocaleString(intlLocale) }) },
  { id: 'grossRevenue', label: t('Doanh thu gộp'), value: (b) => b.grossRevenue, format: formatVnd },
  { id: 'commission', label: t('Hoa hồng'), value: (b) => b.commission, format: formatVnd },
]

/** The administrator's starting point: where the work waits, then the last thirty days at a glance. */
export function AdminDashboardPage() {
  const { session } = useSession()
  const canSeeStats = !!session?.permissions.has('platform-stats:read')
  const month = presetRange('30d', vietnamToday(useNow(60_000)))
  const overview = usePlatformOverview(month, 'day', canSeeStats)

  return (
    <PageStack>
      <div className="flex flex-col gap-6">
        <AdminHomeTabs />
        <h1>{t('Tổng quan hệ thống')}</h1>
      </div>

      <Section title={t('Hàng đợi')} description={t('Những việc đang chờ quản trị viên xử lý.')}>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUEUES.map((q) => (
            <li key={q.to}>
              <Link to={q.to} className="group flex h-full flex-col gap-1 rounded-xl border border-grey-200 p-4 outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring">
                <span className="flex items-center justify-between gap-2 text-ui font-medium">
                  {q.title}
                  <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
                </span>
                <span className="text-small text-muted-foreground">{q.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {overview.data ? (
        <ChartPanel
          title={t('30 ngày qua')}
          description={
            <Link to={consolePath('/statistics')} className="text-link inline-flex items-center gap-1 text-ink">
              {t('Xem đầy đủ trong Thống kê hệ thống ')}<ArrowRightIcon className="size-3.5" aria-hidden="true" />
            </Link>
          }
          metrics={METRICS}
          current={overview.data.buckets ?? []}
          label={(b) => shortLabel(b.start ?? '', 'day')}
          full={(b) => periodLabel(b.start ?? '', 'day')}
        />
      ) : null}
    </PageStack>
  )
}
