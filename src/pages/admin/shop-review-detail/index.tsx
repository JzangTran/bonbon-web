import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, EyeIcon, TriangleAlertIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, problemMessage, type components } from '@/shared/api'
import { formatDateTime, formatRelative, formatTime, formatVnd, weekdayName } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

type Detail = components['schemas']['ShopApplicationDetail']

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-warning-subtle text-warning-fg' },
  APPROVED: { label: 'Đã duyệt', className: 'bg-success-subtle text-success-fg' },
  REJECTED: { label: 'Đã từ chối', className: 'bg-danger-subtle text-danger-fg' },
  SUSPENDED: { label: 'Đang bị khoá', className: 'bg-danger-subtle text-danger-fg' },
}
const QUICK_REASONS = ['Ảnh giấy tờ bị mờ, vui lòng chụp lại.', 'Tên chủ tài khoản không khớp tên trên giấy tờ.', 'Địa chỉ cửa hàng chưa chính xác.']

/** One application: everything except identity documents, which open separately and are logged. */
export function ShopReviewDetailPage() {
  const { vendorId = '' } = useParams()
  const { session } = useSession()
  const application = useQuery({
    queryKey: ['admin', 'shop-review', 'detail', vendorId],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchant-approval/requests/{vendorId}', {
        params: { path: { vendorId } },
      })
      if (error || !data) throw error
      return data
    },
  })

  if (!session?.permissions.has('merchant-approval:read')) {
    return <p className="text-muted-foreground">Bạn không có quyền duyệt cửa hàng.</p>
  }
  if (application.isPending) {
    return <Skeleton className="h-96 max-w-5xl" />
  }
  if (application.isError || !application.data.shop) {
    return <FormError message={problemMessage(application.error)} />
  }
  const shop = application.data.shop
  const status = STATUS[shop.status ?? ''] ?? { label: shop.status ?? '', className: '' }

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <Link to="/admin/shop-review" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
        <ArrowLeftIcon className="size-4" /> Duyệt cửa hàng
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{shop.name ?? '(chưa đặt tên)'}</h1>
        <Badge className={status.className}>{status.label}</Badge>
        <span className="text-sm text-muted-foreground" title={formatDateTime(shop.submittedAt)}>
          Gửi {formatRelative(shop.submittedAt)}
        </span>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[999_1_36rem] flex-col gap-4">
          <Section title="1 · Thông tin quán">
            <Row label="Địa chỉ">
              {shop.formattedAddress ?? '—'}
              {shop.addressDetail ? ` · ${shop.addressDetail}` : ''}
            </Row>
            <Row label="Điện thoại / email">
              {shop.phone ?? '—'} · {shop.email ?? '—'}
            </Row>
            {shop.lat !== undefined && shop.lng !== undefined ? (
              <Row label="Toạ độ">
                <a
                  className="text-brand-700 hover:underline"
                  href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {shop.lat.toFixed(5)}, {shop.lng.toFixed(5)}
                </a>
              </Row>
            ) : null}
          </Section>
          <Section title="2 · Giao hàng & giờ mở cửa">
            <Row label="Bán kính / phí">
              {shop.deliveryRadiusKm ?? '—'} km · {formatVnd(shop.deliveryFee)}
            </Row>
            <Row label="Miễn phí từ / tối thiểu">
              {formatVnd(shop.freeDeliveryThreshold)} · {formatVnd(shop.minOrderValue)}
            </Row>
            <Row label="Giờ mở cửa">
              {shop.openingHours?.length
                ? shop.openingHours
                    .map((w) => `${weekdayName(w.weekday)} ${formatTime(w.opensAt)}–${formatTime(w.closesAt)}`)
                    .join(' · ')
                : '—'}
            </Row>
          </Section>
          <Section title="3 · Thuế & tài khoản nhận tiền">
            <Row label="Loại hình">
              {shop.businessType === 'HOUSEHOLD' ? `Hộ kinh doanh · ${shop.businessName ?? '—'}` : 'Cá nhân'}
            </Row>
            <Row label="Mã số thuế">{shop.taxCode ?? '—'}</Row>
            <Row label="Địa chỉ kinh doanh">{shop.businessAddress ?? '—'}</Row>
            <Row label="Email hoá đơn">{shop.invoiceEmails?.join(', ') || '—'}</Row>
            {shop.businessLicenseUrl ? (
              <Row label="Giấy phép kinh doanh">
                <a className="text-brand-700 hover:underline" href={shop.businessLicenseUrl} target="_blank" rel="noreferrer">
                  Mở tệp (liên kết hết hạn sau 5 phút)
                </a>
              </Row>
            ) : null}
            <Row label="Tài khoản nhận tiền">
              {shop.bankName ?? '—'} · ••••{shop.accountLast4 ?? '????'} · {shop.accountHolderName ?? '—'}
            </Row>
            {shop.payoutHolderMatchesIdentity === false ? (
              <p className="flex items-center gap-2 rounded-md bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
                <TriangleAlertIcon className="size-4 shrink-0" />
                Tên chủ tài khoản không khớp tên trên giấy tờ ({shop.identityFullName}). Kiểm tra trước khi duyệt.
              </p>
            ) : null}
          </Section>
          <IdentitySection shop={shop} canView={session.permissions.has('merchant-approval:read-identity')} />
          {application.data.history?.length ? (
            <Section title="Lịch sử quyết định">
              <ul className="flex flex-col gap-2 text-sm">
                {application.data.history.map((d, i) => (
                  <li key={i}>
                    <span className="font-medium">{d.decision === 'APPROVED' ? 'Duyệt' : 'Từ chối'}</span> ·{' '}
                    {formatDateTime(d.decidedAt)}
                    {d.reason ? <span className="text-muted-foreground"> — {d.reason}</span> : null}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
        {shop.status === 'PENDING' && session.permissions.has('merchant-approval:decide') ? (
          <DecisionPanel shop={shop} />
        ) : null}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

function IdentitySection({ shop, canView }: { shop: Detail; canView: boolean }) {
  const reveal = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchant-approval/requests/{vendorId}/identity', {
        params: { path: { vendorId: shop.vendorId! } },
      })
      if (error || !data) throw error
      return data
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
  const docs = reveal.data

  return (
    <Section title="4 · Định danh">
      <Row label="Giấy tờ">
        {shop.identityDocType ?? '—'} · {shop.identityFullName ?? '—'}
      </Row>
      {docs ? (
        <>
          <Row label="Số giấy tờ">{docs.docNumber ?? '—'}</Row>
          <div className="flex flex-wrap gap-3">
            {[docs.frontPhotoUrl, docs.selfiePhotoUrl].map((url, i) =>
              url ? (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={url}
                    alt={i === 0 ? 'Ảnh mặt trước giấy tờ' : 'Ảnh cầm giấy tờ'}
                    className="h-40 w-64 rounded-md border object-cover"
                  />
                </a>
              ) : null,
            )}
          </div>
          <p className="text-xs text-muted-foreground">Liên kết ảnh hết hạn sau 5 phút.</p>
        </>
      ) : canView ? (
        <div>
          <Button variant="outline" disabled={reveal.isPending} onClick={() => reveal.mutate()}>
            <EyeIcon /> Xem giấy tờ (được ghi nhật ký)
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bạn không có quyền xem giấy tờ tuỳ thân.</p>
      )}
    </Section>
  )
}

function DecisionPanel({ shop }: { shop: Detail }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [confirmApprove, setConfirmApprove] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const done = async (message: string) => {
    toast.success(message)
    await queryClient.invalidateQueries({ queryKey: ['admin', 'shop-review'] })
    navigate('/admin/shop-review')
  }
  const approve = useMutation({
    mutationFn: async () => {
      const { error: problem } = await api.POST('/api/admin/merchant-approval/requests/{vendorId}/approve', {
        params: { path: { vendorId: shop.vendorId! } },
      })
      if (problem) throw problem
    },
    onSuccess: () => done(`Đã duyệt ${shop.name}. Người bán sẽ nhận email.`),
    onError: (e) => setError(problemMessage(e)),
  })
  const reject = useMutation({
    mutationFn: async () => {
      const { error: problem } = await api.POST('/api/admin/merchant-approval/requests/{vendorId}/reject', {
        params: { path: { vendorId: shop.vendorId! } },
        body: { reason: reason.trim() },
      })
      if (problem) throw problem
    },
    onSuccess: () => done(`Đã từ chối ${shop.name}. Người bán sẽ nhận email kèm lý do.`),
    onError: (e) => setError(problemMessage(e)),
  })

  return (
    <aside className="flex w-full flex-[1_1_20rem] flex-col gap-4 lg:max-w-sm">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Quyết định</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button onClick={() => setConfirmApprove(true)}>Duyệt cửa hàng</Button>
          <p className="text-xs text-muted-foreground">Người bán nhận email ngay khi duyệt hoặc từ chối.</p>
          <FormError message={error} />
        </CardContent>
      </Card>
      <Card size="sm" className="border-destructive/40">
        <CardHeader>
          <CardTitle>Từ chối</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REASONS.map((r) => (
              <Button key={r} type="button" variant="outline" size="sm" onClick={() => setReason(r)}>
                {r.replace(/[.,].*$/, '')}
              </Button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reject-reason">Lý do (người bán sẽ thấy)</Label>
            <Textarea id="reject-reason" rows={4} maxLength={1000} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <Button
            variant="destructive"
            disabled={reason.trim().length < 5 || reject.isPending}
            onClick={() => {
              if (window.confirm(`Từ chối hồ sơ ${shop.name}?`)) reject.mutate()
            }}
          >
            Từ chối hồ sơ
          </Button>
        </CardContent>
      </Card>
      <Dialog open={confirmApprove} onOpenChange={setConfirmApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt {shop.name}?</DialogTitle>
            <DialogDescription>Cửa hàng sẽ hiện với khách trong khu khi có món đang bán.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={approve.isPending}
              onClick={() => {
                setConfirmApprove(false)
                approve.mutate()
              }}
            >
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
