import { Link } from 'react-router'
import { useShopOrders, type OrderStatus } from '@/entities/order'
import { useSellerReviews } from '@/entities/review'
import { useShop } from '@/entities/shop'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

type Todo = { label: string; statuses: OrderStatus[] }

const TODOS: Todo[] = [
  { label: 'Chờ xác nhận', statuses: ['PLACED'] },
  { label: 'Đang chuẩn bị', statuses: ['CONFIRMED', 'PREPARING'] },
  { label: 'Đang giao', statuses: ['OUT_FOR_DELIVERY'] },
  { label: 'Đã giao', statuses: ['DELIVERED'] },
  { label: 'Đã huỷ hoặc từ chối', statuses: ['CANCELLED', 'REJECTED', 'NOT_DELIVERED'] },
]

/** What needs the shop right now: counts of orders by stage and reviews still waiting for an answer. */
export function SellerDashboardPage() {
  const shop = useShop()
  const unreplied = useSellerReviews(true, 0)
  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tổng quan cửa hàng</h1>
        <p className="text-sm text-muted-foreground">{shop.data?.shop?.name}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách cần làm</CardTitle>
          <CardDescription>Những việc bạn cần xử lý ngay.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
            {TODOS.map((todo) => (
              <TodoCount key={todo.label} todo={todo} />
            ))}
            <li>
              <Link to="/seller/reviews" className="flex flex-col items-center gap-1 rounded-sm px-2 py-1 hover:bg-muted">
                <span className="text-2xl font-semibold text-primary tabular-nums">{unreplied.data?.total ?? '–'}</span>
                <span className="text-center text-sm text-muted-foreground">Đánh giá chưa phản hồi</span>
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function TodoCount({ todo }: { todo: Todo }) {
  const orders = useShopOrders({ statuses: todo.statuses, size: 1 }, false)
  return (
    <li>
      <Link to="/seller/orders" className="flex flex-col items-center gap-1 rounded-sm px-2 py-1 hover:bg-muted">
        <span className="text-2xl font-semibold text-primary tabular-nums">{orders.data?.total ?? '–'}</span>
        <span className="text-center text-sm text-muted-foreground">{todo.label}</span>
      </Link>
    </li>
  )
}
