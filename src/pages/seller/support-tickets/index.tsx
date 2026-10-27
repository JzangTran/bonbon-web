import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ImagePicker, TICKET_STATUS, useMyTickets, useOpenTicket } from '@/entities/support-ticket'
import { problemMessage } from '@/shared/api'
import { formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { SubPage, SubPageActions } from '@/shared/ui/sub-page'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormError } from '@/widgets/auth-shell'
import { merchantPath } from '@/shared/config/sites'

/** The shop's tickets to the Bonbon team (support-tickets.md). Problems with a delivered order go through the order's own report. */
export function SellerSupportTicketsPage() {
  const [page, setPage] = useState(0)
  const tickets = useMyTickets(page)
  const items = tickets.data?.items ?? []
  const total = tickets.data?.total ?? 0
  const size = tickets.data?.size ?? 20

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Yêu cầu hỗ trợ của tôi</h1>
          <p className="text-sm text-muted-foreground">Gửi phiếu khi trợ giúp chưa trả lời được. Bạn có thể có tối đa 3 phiếu chưa xong cùng lúc.</p>
        </div>
        <Button asChild>
          <Link to={merchantPath('/support-tickets/new')}>
            <PlusIcon /> Gửi phiếu mới
          </Link>
        </Button>
      </div>

      {tickets.isError ? <FormError message={problemMessage(tickets.error)} /> : null}
      {tickets.isPending ? <Skeleton className="h-24" /> : null}
      {tickets.data && items.length === 0 ? <EmptyState title="Bạn chưa gửi phiếu nào." /> : null}

      <ul className="flex flex-col gap-3">
        {items.map((t) => {
          const status = TICKET_STATUS[t.status ?? ''] ?? { label: t.status ?? '', className: '' }
          return (
            <li key={t.id}>
              <Link to={merchantPath(`/support-tickets/${t.id}`)} className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card className="gap-1 p-4 transition-colors hover:bg-accent">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.subject}</span>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelative(t.updatedAt)}</span>
                  </div>
                  {t.orderNumber ? <p className="text-sm text-muted-foreground">Về đơn #{t.orderNumber}</p> : null}
                </Card>
              </Link>
            </li>
          )
        })}
      </ul>

      {total > size ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {Math.ceil(total / size)}
          </span>
          <Button variant="outline" disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
            Trang sau
          </Button>
        </div>
      ) : null}

    </div>
  )
}

/** /support-tickets/new: writing a ticket on a page of its own. */
export function SellerNewTicketPage() {
  const navigate = useNavigate()
  const onClose = () => navigate(merchantPath('/support-tickets'))
  const open = useOpenTicket()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<File[]>([])

  return (
    <SubPage
      back={{ to: merchantPath('/support-tickets'), label: 'Yêu cầu hỗ trợ của tôi' }}
      title="Gửi phiếu hỗ trợ"
      description="Mô tả vấn đề thật cụ thể. Có thể đính kèm tối đa 3 ảnh chụp màn hình."
    >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-subject">Tiêu đề</Label>
            <Input id="ticket-subject" value={subject} maxLength={150} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-message">Nội dung</Label>
            <Textarea id="ticket-message" rows={8} value={message} maxLength={2000} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <ImagePicker files={images} onChange={setImages} />
          {open.isError ? <FormError message={problemMessage(open.error)} /> : null}
        </div>
        <SubPageActions>
          <Button disabled={open.isPending || !subject.trim() || !message.trim()} onClick={() => open.mutate({ subject, message, images }, { onSuccess: onClose })}>
            Gửi phiếu
          </Button>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
        </SubPageActions>
    </SubPage>
  )
}
