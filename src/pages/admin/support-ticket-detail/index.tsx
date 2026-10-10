import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSession } from '@/entities/session'
import { TICKET_STATUS, TicketThread, useAdminTicket, useAnswerTicket } from '@/entities/support-ticket'
import { problemMessage } from '@/shared/api'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

/** One ticket for the administrators: the whole thread, who wrote it, the order it is about, and the reply box. */
export function AdminSupportTicketDetailPage() {
  const { id = '' } = useParams()
  const { session } = useSession()
  const canRead = !!session?.permissions.has('ticket:read')
  const canReply = !!session?.permissions.has('ticket:reply')
  const ticket = useAdminTicket(id, canRead)
  const answer = useAnswerTicket(id)
  const [body, setBody] = useState('')
  const t = ticket.data
  const status = TICKET_STATUS[t?.status ?? ''] ?? { label: t?.status ?? '', className: '' }

  if (!canRead) return <p className="text-muted-foreground">Bạn không có quyền xem phiếu hỗ trợ.</p>

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to="/admin/support-tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Hộp thư phiếu
      </Link>
      {ticket.isError ? <FormError message={problemMessage(ticket.error)} /> : null}
      {ticket.isPending ? <Skeleton className="h-48" /> : null}
      {t ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{t.subject}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          <Card className="gap-1 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Người gửi:</span> {t.userName} ({t.audience === 'SHOP' ? 'cửa hàng' : 'khách'})
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="text-primary underline" to={`/admin/lookup/customers/${t.userId}`}>
                Tra cứu tài khoản
              </Link>
              {t.orderId ? (
                <Link className="text-primary underline" to={`/admin/lookup/orders/${t.orderId}`}>
                  Đơn #{t.orderNumber}
                </Link>
              ) : null}
            </div>
            {t.closedBy ? <p className="text-muted-foreground">Đóng bởi {t.closedBy === 'SYSTEM' ? 'hệ thống (quá hạn không ai nhắn thêm)' : t.closedBy === 'USER' ? 'người dùng' : 'quản trị viên'}.</p> : null}
          </Card>

          <Card className="p-4">
            <TicketThread messages={t.messages ?? []} supportOnRight />
          </Card>

          {t.status !== 'CLOSED' && canReply ? (
            <Card className="gap-3 p-4">
              <h2 className="font-semibold">Trả lời</h2>
              <p className="text-sm text-muted-foreground">Người dùng chỉ thấy &quot;Hỗ trợ Bonbon&quot;, không thấy tên bạn. Họ nhận thông báo, và email nếu để bật.</p>
              <Textarea rows={5} value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} aria-label="Nội dung trả lời" />
              <div>
                <Button disabled={answer.isPending || !body.trim()} onClick={() => answer.mutate(body, { onSuccess: () => setBody('') })}>
                  Gửi trả lời
                </Button>
              </div>
            </Card>
          ) : null}
          {t.status === 'CLOSED' ? <Card className="p-4 text-sm text-muted-foreground">Phiếu đã đóng, không trả lời thêm được.</Card> : null}
        </>
      ) : null}
    </div>
  )
}
