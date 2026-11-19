import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { useSession } from '@/entities/session'
import { api, problemMessage, type components } from '@/shared/api'
import { t } from '@/shared/i18n'
import { formatDateTime, formatRelative } from '@/shared/lib/format'
import { usePaging } from '@/shared/lib/use-paging'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { FormError } from '@/widgets/auth-shell'

type Request = components['schemas']['AdminDataRequest']
type Status = 'OPEN' | 'COMPLETED' | 'REJECTED' | 'ALL'
type Action = 'START' | 'COMPLETE' | 'REJECT' | 'EXTEND'

const TYPE: Record<string, string> = { ACCESS: 'Tải dữ liệu', CORRECT: 'Sửa dữ liệu', WITHDRAW: 'Rút lại đồng ý', RESTRICT: 'Hạn chế xử lý', OBJECT: 'Phản đối xử lý', DELETE: 'Xoá dữ liệu' }
const STATUS: Record<string, string> = { RECEIVED: 'Mới', IN_PROGRESS: 'Đang xử lý', COMPLETED: 'Hoàn thành', REJECTED: 'Từ chối' }

/**
 * Requests about personal data (data-subject-requests.md), soonest deadline first, overdue ones marked. Built like the SLA queues of
 * Zendesk and Freshdesk: what is due shows first, each row says how long is left, and every action is one dialog with its reason.
 */
export function AdminDataRequestsPage() {
  const { session } = useSession()
  const [status, setStatus] = useState<Status>('OPEN')
  const paging = usePaging(25)
  const [acting, setActing] = useState<{ request: Request; action: Action } | null>(null)
  const queue = useQuery({
    queryKey: ['admin', 'data-requests', status, paging.page, paging.size],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/data-requests', { params: { query: { status, page: paging.page, size: paging.size } } })
      if (error || !data) throw error
      return data
    },
  })
  if (!session?.permissions.has('data-request:handle')) return <FormError message={t('Bạn không có quyền xem mục này.')} />

  return (
    <div className="flex flex-col gap-6">
      <PageTabs
        label={t('Yêu cầu về dữ liệu')}
        tabs={[
          { id: 'OPEN', label: t('Cần xử lý') },
          { id: 'COMPLETED', label: t('Hoàn thành') },
          { id: 'REJECTED', label: t('Từ chối') },
          { id: 'ALL', label: t('Tất cả') },
        ]}
        value={status}
        onValueChange={(id) => {
          setStatus(id as Status)
          paging.setPage(0)
        }}
      />
      <div className="flex flex-col gap-1">
        <h1>{t('Yêu cầu về dữ liệu cá nhân')}</h1>
        <p className="text-body-sm text-muted-foreground">{t('Phản hồi trong 2 ngày làm việc, hoàn thành trong 10–15 ngày; gia hạn được một lần có lý do.')}</p>
      </div>
      {queue.isPending ? <Skeleton className="h-48" /> : null}
      {queue.isError ? <FormError message={problemMessage(queue.error)} /> : null}
      {queue.data && !queue.data.items?.length ? <EmptyState title={status === 'OPEN' ? t('Không còn yêu cầu nào cần xử lý') : t('Chưa có yêu cầu')} /> : null}
      <ul className="flex flex-col gap-3">
        {(queue.data?.items ?? []).map((r) => {
          const open = r.status === 'RECEIVED' || r.status === 'IN_PROGRESS'
          return (
            <li key={r.id} className={`flex flex-col gap-3 rounded-sm border bg-card p-4 ${r.overdue ? 'border-destructive/60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">
                    {t(TYPE[r.type ?? ''] ?? r.type ?? '')} · {r.name}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {r.email} · {r.audience === 'SELLER' ? t('Người bán') : t('Khách hàng')} · {t('Gửi {d}').replace('{d}', formatDateTime(r.receivedAt))}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {r.overdue ? <Badge variant="destructive">{t('Quá hạn')}</Badge> : null}
                  {r.extended ? <Badge variant="outline">{t('Đã gia hạn')}</Badge> : null}
                  <Badge variant={open ? 'secondary' : r.status === 'REJECTED' ? 'destructive' : 'default'}>{t(STATUS[r.status ?? ''] ?? '')}</Badge>
                </div>
              </div>
              {r.details ? <p className="text-body-sm whitespace-pre-line">{r.details}</p> : null}
              {open ? (
                <p className="text-caption text-muted-foreground">
                  {t('Hạn hoàn thành {d} ({rel})').replace('{d}', formatDateTime(r.dueAt)).replace('{rel}', formatRelative(r.dueAt))}
                  {r.status === 'RECEIVED' ? ` · ${t('hạn phản hồi {d}').replace('{d}', formatDateTime(r.ackDueAt))}` : ''}
                </p>
              ) : r.responseNote ? (
                <p className="text-body-sm text-muted-foreground">{t('Trả lời: ')}{r.responseNote}</p>
              ) : null}
              {r.extensionReason ? <p className="text-caption text-muted-foreground">{t('Lý do gia hạn: ')}{r.extensionReason}</p> : null}
              {open ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {r.status === 'RECEIVED' ? (
                    <Button size="sm" variant="outline" onClick={() => setActing({ request: r, action: 'START' })}>
                      {t('Bắt đầu xử lý')}
                    </Button>
                  ) : null}
                  {!r.extended ? (
                    <Button size="sm" variant="ghost" onClick={() => setActing({ request: r, action: 'EXTEND' })}>
                      {t('Gia hạn')}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline" onClick={() => setActing({ request: r, action: 'REJECT' })}>
                    {t('Từ chối')}
                  </Button>
                  <Button size="sm" onClick={() => setActing({ request: r, action: 'COMPLETE' })}>
                    {t('Hoàn thành')}
                  </Button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      {queue.data ? <Pagination paging={paging} total={queue.data.total ?? 0} /> : null}
      {acting ? <ActDialog {...acting} onClose={() => setActing(null)} /> : null}
    </div>
  )
}

const ACTION_TEXT: Record<Action, { title: string; note: string; needsNote: boolean }> = {
  START: { title: 'Bắt đầu xử lý', note: 'Ghi chú (không bắt buộc)', needsNote: false },
  COMPLETE: { title: 'Hoàn thành yêu cầu', note: 'Trả lời cho người yêu cầu', needsNote: false },
  REJECT: { title: 'Từ chối yêu cầu', note: 'Lý do từ chối, ví dụ dữ liệu giao dịch phải lưu theo luật', needsNote: true },
  EXTEND: { title: 'Gia hạn một lần', note: 'Lý do gia hạn', needsNote: true },
}

function ActDialog({ request, action, onClose }: { request: Request; action: Action; onClose: () => void }) {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')
  const [days, setDays] = useState('10')
  const [error, setError] = useState<string | null>(null)
  const text = ACTION_TEXT[action]
  const save = useMutation({
    mutationFn: async () => {
      const { error: problem, response } = await api.PATCH('/api/admin/data-requests/{id}', {
        params: { path: { id: request.id ?? '' } },
        body: { action, note: note.trim() || undefined, extendDays: action === 'EXTEND' ? Number(days) : undefined },
      })
      if (!response.ok) throw problem
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'data-requests'] })
      feedback.success(action === 'COMPLETE' || action === 'REJECT' ? t('Đã đóng yêu cầu. Người yêu cầu nhận email về kết quả.') : t('Đã cập nhật.'))
      onClose()
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.needsNote && !note.trim()) return setError(t('Vui lòng nhập lý do.'))
    const n = Number(days)
    if (action === 'EXTEND' && (!Number.isInteger(n) || n < 1 || n > 30)) return setError(t('Gia hạn từ 1 đến 30 ngày.'))
    save.mutate()
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t(text.title)}</DialogTitle>
          <DialogDescription>
            {t(TYPE[request.type ?? ''] ?? '')} · {request.email}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          {action === 'EXTEND' ? (
            <FormRow label={t('Số ngày gia hạn')} htmlFor="dsr-days" required>
              <Input id="dsr-days" type="number" min={1} max={30} value={days} onChange={(e) => setDays(e.target.value)} />
            </FormRow>
          ) : null}
          <FormRow label={t(text.note)} htmlFor="dsr-note" required={text.needsNote}>
            <Textarea id="dsr-note" rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
          </FormRow>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" variant={action === 'REJECT' ? 'destructive' : 'default'} disabled={save.isPending}>
              {t(text.title)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
