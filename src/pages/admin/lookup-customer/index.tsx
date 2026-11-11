import { ArrowLeftIcon, EyeIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { RevealDialog, useAdminCustomer, useRevealCustomer } from '@/entities/lookup'
import { OrderStatusBadge, type OrderStatus } from '@/entities/order'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { consolePath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/** One account: roles, when it was made, its latest orders. Never a password, a token or a push device. */
export function AdminLookupCustomerPage() {
  const { id = '' } = useParams()
  const customer = useAdminCustomer(id)
  const reveal = useRevealCustomer(id)
  const [asking, setAsking] = useState(false)
  const c = customer.data
  const full = reveal.data

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <Link to={consolePath('/lookup')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />{t(' Tra cứu')}
      </Link>
      {customer.isError ? <FormError message={problemMessage(customer.error)} /> : null}
      {customer.isPending ? <Skeleton className="h-48" /> : null}
      {c ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{c.name}</h1>
            {(c.roles ?? []).map((r) => (
              <Badge key={r} variant="outline">
                {r === 'SELLER' ? t('Người bán') : t('Khách')}
              </Badge>
            ))}
          </div>
          <Card className="gap-2 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{t('Tài khoản')}</h2>
              {full ? <Badge className="bg-warning-subtle text-warning-fg">{t('Đang xem đầy đủ, đã ghi nhật ký')}</Badge> : <Button size="sm" variant="outline" onClick={() => setAsking(true)}><EyeIcon />{t(' Xem đầy đủ')}</Button>}
            </div>
            <p>
              <span className="text-muted-foreground">Email:</span> {full?.email ?? c.email} {c.emailVerified ? t('(đã xác minh)') : t('(chưa xác minh)')}
            </p>
            <p>
              <span className="text-muted-foreground">{t('Số điện thoại:')}</span> {full?.phone ?? c.phone ?? t('chưa có (chưa xác minh)')}
            </p>
            <p>
              <span className="text-muted-foreground">{t('Tạo lúc:')}</span> {formatDateTime(c.createdAt)}
            </p>
          </Card>

          <Card className="gap-2 p-4 text-sm">
            <h2 className="font-semibold">{t('10 đơn gần nhất')}</h2>
            {(c.recentOrders ?? []).length === 0 ? <p className="text-muted-foreground">{t('Chưa có đơn nào.')}</p> : null}
            <ul className="flex flex-col gap-2">
              {(c.recentOrders ?? []).map((o) => (
                <li key={o.id}>
                  <Link to={consolePath(`/lookup/orders/${o.id}`)} className="flex flex-wrap items-center justify-between gap-2 hover:underline">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">#{o.number}</span>
                      <OrderStatusBadge status={(o.status ?? 'PLACED') as OrderStatus} />
                      <span className="text-muted-foreground">{o.shopName}</span>
                    </span>
                    <span className="tabular-nums">{formatVnd(o.grandTotal)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          {asking ? (
            <RevealDialog pending={reveal.isPending} error={reveal.error} onClose={() => setAsking(false)} onSubmit={(input) => reveal.mutate(input, { onSuccess: () => setAsking(false) })} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
