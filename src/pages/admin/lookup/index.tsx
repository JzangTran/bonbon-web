import { SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useCustomerSearch, useOrderSearch, type CustomerQuery, type OrderQuery } from '@/entities/lookup'
import { OrderStatusBadge, type OrderStatus } from '@/entities/order'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type OrderKind = OrderQuery['kind']
type CustomerKind = CustomerQuery['kind']

/**
 * Finding a case, not browsing people (admin-order-lookup.md): an exact order code, email or phone, at most 20 results,
 * contact details masked. Each search and each record opened is written to the audit log.
 */
export function AdminLookupPage() {
  const { session } = useSession()
  const canOrders = !!session?.permissions.has('admin-order:read')
  const canCustomers = !!session?.permissions.has('admin-customer:read')

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Tra cứu đơn và tài khoản</h1>
        <p className="text-sm text-muted-foreground">
          Nhập đúng một mã: không có danh sách người dùng để duyệt. Số điện thoại, email và địa chỉ được che; muốn xem đầy đủ phải chọn lý do và việc đó được ghi nhật ký.
        </p>
      </div>
      {canOrders ? <OrderSearch /> : null}
      {canCustomers ? <CustomerSearch /> : null}
      {!canOrders && !canCustomers ? <p className="text-muted-foreground">Bạn không có quyền tra cứu.</p> : null}
    </div>
  )
}

function OrderSearch() {
  const [kind, setKind] = useState<OrderKind>('code')
  const [value, setValue] = useState('')
  const [query, setQuery] = useState<OrderQuery | null>(null)
  const result = useOrderSearch(query)
  const items = result.data?.items ?? []
  const placeholder = kind === 'code' ? 'Mã đơn, ví dụ 1042' : kind === 'customerEmail' ? 'Email tài khoản, nhập đầy đủ' : 'Số điện thoại tài khoản, nhập đầy đủ'

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Tìm đơn</h2>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery({ kind, value })
        }}
      >
        <div className="flex gap-1" role="radiogroup" aria-label="Tìm đơn theo">
          {([['code', 'Mã đơn'], ['customerEmail', 'Email khách'], ['customerPhone', 'SĐT khách']] as const).map(([k, label]) => (
            <Button key={k} type="button" role="radio" aria-checked={kind === k} size="sm" variant={kind === k ? 'default' : 'outline'} onClick={() => setKind(k)}>
              {label}
            </Button>
          ))}
        </div>
        <div className="flex min-w-60 flex-1 flex-col gap-1.5">
          <Label htmlFor="order-search" className="sr-only">
            Giá trị tìm đơn
          </Label>
          <Input id="order-search" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} />
        </div>
        <Button type="submit" disabled={!value.trim()}>
          <SearchIcon /> Tìm
        </Button>
      </form>
      {result.isError ? <FormError message={problemMessage(result.error)} /> : null}
      {result.isFetching ? <Skeleton className="h-16" /> : null}
      {query && result.data && items.length === 0 ? <Card className="p-4 text-sm text-muted-foreground">Không tìm thấy đơn nào khớp chính xác.</Card> : null}
      <ul className="flex flex-col gap-2">
        {items.map((o) => (
          <li key={o.id}>
            <Link to={`/admin/lookup/orders/${o.id}`} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Card className="gap-1 p-3 transition-colors hover:bg-accent">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">Đơn #{o.number}</span>
                    <OrderStatusBadge status={(o.status ?? 'PLACED') as OrderStatus} />
                  </div>
                  <span className="font-semibold tabular-nums">{formatVnd(o.grandTotal)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {o.shopName} · {formatDateTime(o.placedAt)}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CustomerSearch() {
  const [kind, setKind] = useState<CustomerKind>('email')
  const [value, setValue] = useState('')
  const [query, setQuery] = useState<CustomerQuery | null>(null)
  const result = useCustomerSearch(query)
  const items = result.data?.items ?? []

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Tìm tài khoản</h2>
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery({ kind, value })
        }}
      >
        <div className="flex gap-1" role="radiogroup" aria-label="Tìm tài khoản theo">
          {([['email', 'Email'], ['phone', 'Số điện thoại']] as const).map(([k, label]) => (
            <Button key={k} type="button" role="radio" aria-checked={kind === k} size="sm" variant={kind === k ? 'default' : 'outline'} onClick={() => setKind(k)}>
              {label}
            </Button>
          ))}
        </div>
        <div className="flex min-w-60 flex-1 flex-col gap-1.5">
          <Label htmlFor="customer-search" className="sr-only">
            Giá trị tìm tài khoản
          </Label>
          <Input id="customer-search" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nhập đầy đủ, khớp chính xác" />
        </div>
        <Button type="submit" disabled={!value.trim()}>
          <SearchIcon /> Tìm
        </Button>
      </form>
      {result.isError ? <FormError message={problemMessage(result.error)} /> : null}
      {result.isFetching ? <Skeleton className="h-16" /> : null}
      {query && result.data && items.length === 0 ? <Card className="p-4 text-sm text-muted-foreground">Không tìm thấy tài khoản nào khớp chính xác.</Card> : null}
      <ul className="flex flex-col gap-2">
        {items.map((c) => (
          <li key={c.id}>
            <Link to={`/admin/lookup/customers/${c.id}`} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <Card className="gap-1 p-3 transition-colors hover:bg-accent">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {(c.roles ?? []).map((r) => (
                    <Badge key={r} variant="outline">
                      {r === 'SELLER' ? 'Người bán' : 'Khách'}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {c.email} · {c.phone ?? 'chưa có số điện thoại'}
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
