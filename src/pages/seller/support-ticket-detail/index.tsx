import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ImagePicker, TICKET_STATUS, TicketThread, useCloseTicket, useMyTicket, useReplyTicket } from '@/entities/support-ticket'
import { problemMessage } from '@/shared/api'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

/** One ticket with the whole conversation; the shop can write again or close it. */
export function SellerSupportTicketDetailPage() {
  const { id = '' } = useParams()
  const ticket = useMyTicket(id)
  const reply = useReplyTicket(id)
  const close = useCloseTicket(id)
  const [body, setBody] = useState('')
  const [images, setImages] = useState<File[]>([])
  const t = ticket.data
  const status = TICKET_STATUS[t?.status ?? ''] ?? { label: t?.status ?? '', className: '' }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to="/seller/support-tickets" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Phiếu hỗ trợ
      </Link>
      {ticket.isError ? <FormError message={problemMessage(ticket.error)} /> : null}
      {ticket.isPending ? <Skeleton className="h-48" /> : null}
      {t ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{t.subject}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          {t.orderNumber ? <p className="text-sm text-muted-foreground">Về đơn #{t.orderNumber}</p> : null}
          {t.closedBy === 'SYSTEM' ? <p className="text-sm text-muted-foreground">Phiếu tự đóng vì không có tin nhắn mới sau khi được trả lời.</p> : null}

          <Card className="p-4">
            <TicketThread messages={t.messages ?? []} supportOnRight={false} />
          </Card>

          {t.status !== 'CLOSED' ? (
            <Card className="gap-3 p-4">
              <h2 className="font-semibold">Nhắn thêm</h2>
              <Textarea rows={4} value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} aria-label="Nội dung nhắn thêm" />
              <ImagePicker files={images} onChange={setImages} />
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={reply.isPending || !body.trim()}
                  onClick={() =>
                    reply.mutate(
                      { body, images },
                      {
                        onSuccess: () => {
                          setBody('')
                          setImages([])
                        },
                      },
                    )
                  }
                >
                  Gửi
                </Button>
                <Button variant="outline" disabled={close.isPending} onClick={() => close.mutate()}>
                  Đóng phiếu
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-4 text-sm text-muted-foreground">Phiếu đã đóng. Cần hỗ trợ thêm thì gửi phiếu mới.</Card>
          )}
        </>
      ) : null}
    </div>
  )
}
