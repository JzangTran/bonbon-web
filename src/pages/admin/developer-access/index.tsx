import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, problemMessage, type components } from '@/shared/api'
import { t } from '@/shared/i18n'
import { formatDateTime } from '@/shared/lib/format'
import { usePaging } from '@/shared/lib/use-paging'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormRow } from '@/shared/ui/form-row'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { FormError } from '@/widgets/auth-shell'

type Request = components['schemas']['AdminDeveloperAccessRequest']
type Status = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'ALL'
const STATUS: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', REVOKED: 'Đã thu hồi' }

/**
 * Who asked for the API reference (developer portal), and the decision. Approving gives the DEVELOPER role (a new address also gets a
 * set-password email); rejecting and revoking need a reason the person reads.
 */
export function AdminDeveloperAccessPage() {
  const { session } = useSession()
  const [status, setStatus] = useState<Status>('PENDING')
  const paging = usePaging(25)
  const [acting, setActing] = useState<{ request: Request; action: 'reject' | 'revoke' } | null>(null)
  const queryClient = useQueryClient()
  const queue = useQuery({
    queryKey: ['admin', 'developer-access', status, paging.page, paging.size],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/developer-access-requests', { params: { query: { status, page: paging.page, size: paging.size } } })
      if (error || !data) throw error
      return data
    },
  })
  const approve = useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await api.POST('/api/admin/developer-access-requests/{id}/approve', { params: { path: { id } } })
      if (!response.ok) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'developer-access'] })
      toast.success(t('Đã duyệt. Người gửi nhận email hướng dẫn đăng nhập.'))
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
  if (!session?.permissions.has('developer-access:decide')) return <FormError message={t('Bạn không có quyền xem mục này.')} />

  return (
    <div className="flex flex-col gap-6">
      <PageTabs
        label={t('Truy cập API')}
        tabs={[
          { id: 'PENDING', label: t('Chờ duyệt') },
          { id: 'APPROVED', label: t('Đã duyệt') },
          { id: 'REJECTED', label: t('Từ chối') },
          { id: 'REVOKED', label: t('Đã thu hồi') },
          { id: 'ALL', label: t('Tất cả') },
        ]}
        value={status}
        onValueChange={(id) => {
          setStatus(id as Status)
          paging.setPage(0)
        }}
      />
      <div className="flex flex-col gap-1">
        <h1>{t('Yêu cầu truy cập API')}</h1>
        <p className="text-sm text-muted-foreground">{t('Chỉ người được duyệt mới đọc được tài liệu API ở trang dành cho lập trình viên.')}</p>
      </div>
      {queue.isPending ? <Skeleton className="h-40" /> : null}
      {queue.isError ? <FormError message={problemMessage(queue.error)} /> : null}
      {queue.data && !queue.data.items?.length ? <EmptyState title={status === 'PENDING' ? t('Không có yêu cầu chờ duyệt') : t('Chưa có yêu cầu')} /> : null}
      <ul className="flex flex-col gap-3">
        {(queue.data?.items ?? []).map((r) => (
          <li key={r.id} className="flex flex-col gap-3 rounded-sm border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="font-medium">
                  {r.name}
                  {r.company ? ` · ${r.company}` : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.email} · {t('Gửi {d}').replace('{d}', formatDateTime(r.createdAt))}
                  {r.website ? (
                    <>
                      {' · '}
                      <a href={r.website} target="_blank" rel="noreferrer noopener" className="text-link">
                        {r.website}
                      </a>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {r.existingAccount ? <Badge variant="outline">{t('Đã có tài khoản bonbon')}</Badge> : null}
                <Badge variant={r.status === 'APPROVED' ? 'default' : r.status === 'PENDING' ? 'secondary' : 'destructive'}>{t(STATUS[r.status ?? ''] ?? '')}</Badge>
              </div>
            </div>
            <p className="text-sm whitespace-pre-line">{r.purpose}</p>
            {r.reason ? <p className="text-sm text-muted-foreground">{t('Lý do: ')}{r.reason}</p> : null}
            <div className="flex flex-wrap justify-end gap-2">
              {r.status === 'PENDING' ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setActing({ request: r, action: 'reject' })}>
                    {t('Từ chối')}
                  </Button>
                  <Button size="sm" disabled={approve.isPending} onClick={() => r.id && approve.mutate(r.id)}>
                    {t('Duyệt')}
                  </Button>
                </>
              ) : null}
              {r.status === 'APPROVED' ? (
                <Button size="sm" variant="outline" onClick={() => setActing({ request: r, action: 'revoke' })}>
                  {t('Thu hồi quyền')}
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {queue.data ? <Pagination paging={paging} total={queue.data.total ?? 0} /> : null}
      {acting ? <ReasonDialog {...acting} onClose={() => setActing(null)} /> : null}
    </div>
  )
}

function ReasonDialog({ request, action, onClose }: { request: Request; action: 'reject' | 'revoke'; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: async () => {
      const path = action === 'reject' ? '/api/admin/developer-access-requests/{id}/reject' : '/api/admin/developer-access-requests/{id}/revoke'
      const { error: problem, response } = await api.POST(path, { params: { path: { id: request.id ?? '' } }, body: { reason: reason.trim() } })
      if (!response.ok) throw problem
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'developer-access'] })
      toast.success(action === 'reject' ? t('Đã từ chối và báo cho người gửi.') : t('Đã thu hồi; mọi phiên của tài khoản đã kết thúc.'))
      onClose()
    },
    onError: (e) => setError(problemMessage(e)),
  })
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{action === 'reject' ? t('Từ chối yêu cầu') : t('Thu hồi quyền truy cập API')}</DialogTitle>
          <DialogDescription>{request.email}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (!reason.trim()) return setError(t('Vui lòng nhập lý do.'))
            save.mutate()
          }}
        >
          <FormRow label={t('Lý do (người gửi đọc được)')} htmlFor="dev-reason" required>
            <Textarea id="dev-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormRow>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" variant="destructive" disabled={save.isPending}>
              {action === 'reject' ? t('Từ chối') : t('Thu hồi')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
