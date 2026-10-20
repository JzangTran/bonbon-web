import { ArrowRightIcon } from 'lucide-react'
import { Link } from 'react-router'
import { AdminHomeTabs } from '@/widgets/admin-tabs'
import { adminPath } from '@/shared/config/sites'

const QUEUES = [
  { to: adminPath('/shop-review'), title: 'Duyệt hồ sơ cửa hàng', text: 'Hồ sơ người bán chờ duyệt hoặc cần xem lại.' },
  { to: adminPath('/order-cases'), title: 'Khiếu nại đơn hàng', text: 'Vụ khách báo lỗi mà quán phản đối hoặc không trả lời kịp.' },
  { to: adminPath('/refunds'), title: 'Hoàn tiền', text: 'Khoản hoàn tiền chờ chuyển khoản.' },
  { to: adminPath('/support-tickets'), title: 'Phiếu hỗ trợ', text: 'Yêu cầu từ khách và người bán đang chờ phản hồi.' },
  { to: adminPath('/reviews'), title: 'Kiểm duyệt đánh giá', text: 'Đánh giá và phản hồi cần ẩn hoặc khôi phục.' },
  { to: adminPath('/category-moderation'), title: 'Món sai ngành', text: 'Món bị đánh dấu xếp sai ngành hàng, kể cả kháng nghị.' },
]

/** The administrator's starting point: where the work waits. The numbers are in the second tab. */
export function AdminDashboardPage() {
  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <AdminHomeTabs />
      <div>
        <h1>Tổng quan hệ thống</h1>
        <p className="text-sm text-muted-foreground">Các hàng đợi cần quản trị viên xử lý. Số liệu hoạt động của nền tảng nằm ở tab Thống kê hệ thống.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUEUES.map((q) => (
          <li key={q.to}>
            <Link to={q.to} className="group flex h-full flex-col gap-1 rounded-md bg-ws-fill p-4 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex items-center justify-between gap-2 text-[0.8125rem] font-semibold">
                {q.title}
                <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span className="text-xs text-muted-foreground">{q.text}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
