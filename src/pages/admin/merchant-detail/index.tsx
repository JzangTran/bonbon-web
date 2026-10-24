import { ArrowLeftIcon, TriangleAlertIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useMerchantDetail } from '@/entities/merchant-directory'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { Row, Section, ShopApplicationSections } from '@/widgets/shop-application'
import { consolePath } from '@/shared/config/sites'

const STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-warning-subtle text-warning-fg' },
  APPROVED: { label: 'Hoạt động', className: 'bg-success-subtle text-success-fg' },
  REJECTED: { label: 'Bị từ chối', className: 'bg-danger-subtle text-danger-fg' },
  SUSPENDED: { label: 'Bị đình chỉ', className: 'bg-danger-subtle text-danger-fg' },
  CLOSING: { label: 'Đang đóng', className: 'bg-warning-subtle text-warning-fg' },
  CLOSED: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground' },
}
const DUPLICATE_REASON: Record<string, string> = {
  TAX_CODE: 'cùng mã số thuế',
  POSSIBLE_SAME_PERSON: 'có thể cùng một người (cùng họ tên và 4 số cuối giấy tờ)',
}
const SUSPENSION_STATUS: Record<string, string> = {
  SCHEDULED: 'Đã báo, chưa hiệu lực',
  APPLIED: 'Đang đình chỉ',
  ENDED: 'Đã kết thúc',
  CANCELLED: 'Đã huỷ lịch',
}

/** One shop from the directory: its application as the reviewers saw it, plus what happened after (decisions, suspensions) and lookalike shops. */
export function AdminMerchantDetailPage() {
  const { vendorId = '' } = useParams()
  const { session } = useSession()
  const allowed = !!session?.permissions.has('merchant-approval:read')
  const detail = useMerchantDetail(vendorId, allowed)

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền xem cửa hàng.</p>
  if (detail.isPending) return <Skeleton className="h-96 max-w-5xl" />
  if (detail.isError || !detail.data.shop) return <FormError message={problemMessage(detail.error)} />

  const { shop, decisions = [], suspensions = [], duplicates = [] } = detail.data
  const status = STATUS[shop.status ?? ''] ?? { label: shop.status ?? '', className: '' }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <Link to={consolePath('/merchants')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <ArrowLeftIcon className="size-4" /> Cửa hàng
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{shop.name ?? '(chưa đặt tên)'}</h1>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      {duplicates.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-md bg-warning-subtle px-4 py-3 text-sm text-warning-fg">
          <p className="flex items-center gap-2 font-medium">
            <TriangleAlertIcon className="size-4 shrink-0" /> Có cửa hàng giống hồ sơ này
          </p>
          <ul className="flex flex-col gap-1">
            {duplicates.map((d) => (
              <li key={d.vendorId}>
                <Link to={consolePath(`/merchants/${d.vendorId}`)} className="font-medium underline">
                  {d.name}
                </Link>{' '}
                ({STATUS[d.status ?? '']?.label ?? d.status}) — {DUPLICATE_REASON[d.reason ?? ''] ?? d.reason}
              </li>
            ))}
          </ul>
          <p className="text-xs">Chỉ để người xem cân nhắc, không tự động từ chối hay khoá.</p>
        </div>
      ) : null}

      <ShopApplicationSections shop={shop} canViewIdentity={!!session?.permissions.has('merchant-approval:read-identity')} />

      <Section title="Hiệu suất và đối soát">
        <p className="text-sm text-muted-foreground">Điểm phạt, hạn chế hiển thị, đình chỉ và số dư của quán nằm ở các trang riêng.</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {session?.permissions.has('shop-penalty:read') ? (
            <Link className="text-primary hover:underline" to={consolePath(`/penalties/${shop.vendorId}`)}>
              Điểm phạt và đình chỉ
            </Link>
          ) : null}
          {session?.permissions.has('settlement:read') ? (
            <Link className="text-primary hover:underline" to={consolePath(`/settlement/${shop.vendorId}`)}>
              Sổ số dư và hoa hồng
            </Link>
          ) : null}
          {session?.permissions.has('dish:moderate') ? (
            <Link className="text-primary hover:underline" to={consolePath(`/category-moderation?vendorId=${shop.vendorId}`)}>
              Món sai ngành
            </Link>
          ) : null}
        </div>
      </Section>

      <Section title="Lịch sử đình chỉ">
        {suspensions.length === 0 ? <p className="text-sm text-muted-foreground">Chưa từng bị đình chỉ.</p> : null}
        {suspensions.map((s) => (
          <div key={s.id} className="flex flex-col gap-1 border-b pb-3 text-sm last:border-b-0 last:pb-0">
            <p className="font-medium">
              {SUSPENSION_STATUS[s.status ?? ''] ?? s.status}
              <span className="font-normal text-muted-foreground"> · tạo {formatDateTime(s.createdAt)}</span>
            </p>
            <Row label="Lý do">{s.reason ?? '—'}</Row>
            {s.authorityReference ? <Row label="Văn bản cơ quan">{s.authorityReference}</Row> : null}
            <Row label="Báo cho quán">{s.noticeSentAt ? formatDateTime(s.noticeSentAt) : '—'}</Row>
            <Row label="Có hiệu lực">{s.appliedAt ? formatDateTime(s.appliedAt) : s.effectiveAt ? `dự kiến ${formatDateTime(s.effectiveAt)}` : '—'}</Row>
            {s.endedAt ? (
              <Row label="Kết thúc">
                {formatDateTime(s.endedAt)}
                {s.endReason ? ` — ${s.endReason}` : ''}
              </Row>
            ) : null}
          </div>
        ))}
      </Section>

      <Section title="Quyết định duyệt">
        {decisions.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có quyết định.</p> : null}
        <ul className="flex flex-col gap-2 text-sm">
          {decisions.map((d, i) => (
            <li key={i}>
              <span className="font-medium">{d.decision === 'APPROVED' ? 'Duyệt' : 'Từ chối'}</span> · {formatDateTime(d.decidedAt)}
              {d.reason ? <span className="text-muted-foreground"> — {d.reason}</span> : null}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
