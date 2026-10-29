import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { consolePath } from '@/shared/config/sites'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { SubPage } from '@/shared/ui/sub-page'
import { Textarea } from '@/shared/ui/textarea'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { FormError } from '@/widgets/auth-shell'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { t } from '@/shared/i18n'

type Status = 'OPEN' | 'ANSWERED' | 'CLOSED'
const KEY = ['contact-requests'] as const
const TABS: { id: Status; label: string }[] = [
  { id: 'OPEN', label: t('Chờ trả lời') },
  { id: 'ANSWERED', label: t('Đã trả lời') },
  { id: 'CLOSED', label: t('Đã đóng') },
]
const STATUS: Record<string, { label: string; className: string }> = {
  OPEN: { label: t('Chờ trả lời'), className: 'bg-warning-subtle text-warning-fg' },
  ANSWERED: { label: t('Đã trả lời'), className: 'bg-success-subtle text-success-fg' },
  CLOSED: { label: t('Đã đóng'), className: 'bg-muted text-muted-foreground' },
}
const ROLE: Record<string, string> = { CUSTOMER: t('Khách đặt món'), SELLER: t('Người bán'), OTHER: t('Khác') }
const TOPIC: Record<string, string> = { ORDER: t('Đơn hàng'), ACCOUNT: t('Tài khoản'), SHOP: t('Mở quán, cửa hàng'), PAYMENT: t('Thanh toán'), OTHER: t('Khác') }

/** What people wrote on the public contact form of the help site; the one that has waited longest is on top. */
export function AdminContactRequestsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('ticket:read')
  const [tab, setTab] = useState<Status>('OPEN')
  const paging = usePaging()
  const inbox = useQuery({
    queryKey: [...KEY, tab, paging.page, paging.size],
    enabled: allowed,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/support/contact-requests', { params: { query: { status: tab, page: paging.page, size: paging.size } } })
      if (error || !data) throw error
      return data
    },
  })
  const items = inbox.data?.items ?? []
  const total = inbox.data?.total ?? 0

  if (!allowed) return <p className="text-muted-foreground">{t('Bạn không có quyền xem yêu cầu liên hệ.')}</p>

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <PageTabs
        label={t('Yêu cầu liên hệ')}
        tabs={TABS}
        value={tab}
        onValueChange={(id) => {
          setTab(id as Status)
          paging.reset()
        }}
      />
      <div>
        <h1>{t('Yêu cầu liên hệ')}</h1>
        <p className="text-sm text-muted-foreground">{t('Gửi từ trang Liên hệ hỗ trợ, có thể từ người chưa có tài khoản. Câu trả lời đi tới email họ để lại.')}</p>
      </div>
      {inbox.isError ? <FormError message={problemMessage(inbox.error)} /> : null}
      {inbox.isPending ? <Skeleton className="h-32" /> : null}
      {inbox.data && items.length === 0 ? <EmptyState title={t('Không có yêu cầu nào ở mục này.')} /> : null}
      <ul className="flex flex-col divide-y divide-grey-200 rounded-xl border border-grey-200">
        {items.map((r) => (
          <li key={r.id}>
            <Link to={consolePath(`/contact-requests/${r.id}`)} className="flex flex-col gap-1 px-4 py-3 outline-none hover:bg-grey-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {r.fullName} <span className="font-normal text-muted-foreground">· {r.email}</span>
                </span>
                <span className="text-xs text-muted-foreground" title={formatDateTime(r.createdAt)}>
                  {formatRelative(r.createdAt)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {ROLE[r.role ?? ''] ?? r.role} · {TOPIC[r.topic ?? ''] ?? r.topic}
              </span>
              <span className="line-clamp-2 text-sm">{r.preview}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Pagination paging={paging} total={total} />
    </div>
  )
}

/** One request: what the person wrote, the answers already sent, and the answer box. */
export function AdminContactRequestPage() {
  const { id } = useParams()
  const { session } = useSession()
  const queryClient = useQueryClient()
  const canReply = !!session?.permissions.has('ticket:reply')
  const [body, setBody] = useState('')
  const request = useQuery({
    queryKey: [...KEY, 'one', id],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/support/contact-requests/{id}', { params: { path: { id: id! } } })
      if (error || !data) throw error
      return data
    },
  })
  const done = (message: string) => () => {
    void queryClient.invalidateQueries({ queryKey: KEY })
    toast.success(message)
  }
  const answer = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/admin/support/contact-requests/{id}/answer', { params: { path: { id: id! } }, body: { body } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      setBody('')
      done(t('Đã gửi câu trả lời qua email.'))()
    },
  })
  const close = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/admin/support/contact-requests/{id}/close', { params: { path: { id: id! } } })
      if (error || !data) throw error
      return data
    },
    onSuccess: done(t('Đã đóng yêu cầu.')),
  })
  const r = request.data
  const status = STATUS[r?.status ?? ''] ?? { label: r?.status ?? '', className: '' }

  return (
    <SubPage back={{ to: consolePath('/contact-requests'), label: t('Yêu cầu liên hệ') }} title={r ? `${r.fullName} · ${TOPIC[r.topic ?? ''] ?? r.topic}` : t('Yêu cầu liên hệ')}>
      {request.isPending ? <Skeleton className="h-64" /> : null}
      {request.isError ? <FormError message={problemMessage(request.error)} /> : null}
      {r ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge className={status.className}>{status.label}</Badge>
            <span>{ROLE[r.role ?? ''] ?? r.role}</span>·<a href={`mailto:${r.email}`} className="text-link text-ink">{r.email}</a>·
            <span>{formatDateTime(r.createdAt)}</span>
          </div>
          <p className="rounded-xl bg-grey-50 p-4 whitespace-pre-wrap">{r.message}</p>
          {(r.answers ?? []).length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-h3 font-medium">{t('Đã trả lời')}</h2>
              {(r.answers ?? []).map((a) => (
                <div key={a.id} className="flex flex-col gap-1 border-l border-primary pl-4">
                  <span className="text-xs text-muted-foreground">
                    {a.adminName} · {formatDateTime(a.createdAt)}
                  </span>
                  <p className="whitespace-pre-wrap">{a.body}</p>
                </div>
              ))}
            </section>
          ) : null}
          {canReply && r.status !== 'CLOSED' ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (body.trim()) answer.mutate()
              }}
            >
              <Label htmlFor="answer">{t('Trả lời qua email tới ')}{r.email}</Label>
              <Textarea id="answer" rows={6} maxLength={2000} showCount value={body} onChange={(e) => setBody(e.target.value)} />
              {answer.isError ? <FormError message={problemMessage(answer.error)} /> : null}
              {close.isError ? <FormError message={problemMessage(close.error)} /> : null}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!body.trim() || answer.isPending}>
                  {t('Gửi trả lời')}
                </Button>
                <Button type="button" variant="outline" disabled={close.isPending} onClick={() => close.mutate()}>
                  {t('Đóng yêu cầu')}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      ) : null}
    </SubPage>
  )
}
