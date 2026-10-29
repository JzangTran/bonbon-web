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
import { consolePath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/** One ticket for the administrators: the whole thread, who wrote it, the order it is about, and the reply box. */
export function AdminSupportTicketDetailPage() {
  const { id = '' } = useParams()
  const { session } = useSession()
  const canRead = !!session?.permissions.has('ticket:read')
  const canReply = !!session?.permissions.has('ticket:reply')
  const ticket = useAdminTicket(id, canRead)
  const answer = useAnswerTicket(id)
  const [body, setBody] = useState('')
  const tItem = ticket.data
  const status = TICKET_STATUS[tItem?.status ?? ''] ?? { label: tItem?.status ?? '', className: '' }

  if (!canRead) return <p className="text-muted-foreground">{t('Bạn không có quyền xem phiếu hỗ trợ.')}</p>

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <Link to={consolePath('/support-tickets')} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" />{t(' Hộp thư phiếu')}
      </Link>
      {ticket.isError ? <FormError message={problemMessage(ticket.error)} /> : null}
      {ticket.isPending ? <Skeleton className="h-48" /> : null}
      {tItem ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{tItem.subject}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          <Card className="gap-1 p-4 text-sm">
            <p>
              <span className="text-muted-foreground">{t('Người gửi:')}</span> {tItem.userName} ({tItem.audience === 'SHOP' ? t('cửa hàng') : t('khách')})
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="text-link" to={consolePath(`/lookup/customers/${tItem.userId}`)}>
                {t('Tra cứu tài khoản')}
              </Link>
              {tItem.orderId ? (
                <Link className="text-link" to={consolePath(`/lookup/orders/${tItem.orderId}`)}>
                  {t('Đơn #')}{tItem.orderNumber}
                </Link>
              ) : null}
            </div>
            {tItem.closedBy ? <p className="text-muted-foreground">{t('Đóng bởi ')}{tItem.closedBy === 'SYSTEM' ? t('hệ thống (quá hạn không ai nhắn thêm)') : tItem.closedBy === 'USER' ? t('người dùng') : t('quản trị viên')}.</p> : null}
          </Card>

          <Card className="p-4">
            <TicketThread messages={tItem.messages ?? []} supportOnRight />
          </Card>

          {tItem.status !== 'CLOSED' && canReply ? (
            <Card className="gap-3 p-4">
              <h2 className="font-semibold">{t('Trả lời')}</h2>
              <p className="text-sm text-muted-foreground">{t('Người dùng chỉ thấy "Hỗ trợ Bonbon", không thấy tên bạn. Họ nhận thông báo, và email nếu để bật.')}</p>
              <Textarea rows={5} value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} aria-label={t('Nội dung trả lời')} />
              <div>
                <Button disabled={answer.isPending || !body.trim()} onClick={() => answer.mutate(body, { onSuccess: () => setBody('') })}>
                  {t('Gửi trả lời')}
                </Button>
              </div>
            </Card>
          ) : null}
          {tItem.status === 'CLOSED' ? <Card className="p-4 text-sm text-muted-foreground">{t('Phiếu đã đóng, không trả lời thêm được.')}</Card> : null}
        </>
      ) : null}
    </div>
  )
}
