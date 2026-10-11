import { PlusIcon } from 'lucide-react'
import { Link } from 'react-router'
import { LEGAL_STATUS, LEGAL_TYPES, useLegalVersions, type LegalVersion } from '@/entities/legal-document'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

/** Every version of each legal document with how many accounts accepted it (manage-legal-documents.md). */
export function AdminLegalDocumentsPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('legal-document:write')
  const versions = useLegalVersions(allowed)

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền quản lý văn bản pháp lý.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Văn bản pháp lý</h1>
        <p className="text-sm text-muted-foreground">
          Điều khoản và chính sách mà người dùng phải đồng ý. Phiên bản đã đăng không sửa được nữa; muốn đổi thì đăng phiên bản mới. Thay đổi quan trọng cần báo trước và người dùng phải đồng ý lại.
        </p>
      </div>
      {versions.isError ? <FormError message={problemMessage(versions.error)} /> : null}
      {versions.isPending ? <Skeleton className="h-48" /> : null}
      {versions.data
        ? LEGAL_TYPES.map((t) => {
            const items = (versions.data.items ?? []).filter((v) => v.type === t.id)
            const hasDraft = items.some((v) => v.status === 'DRAFT')
            return (
              <section key={t.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{t.label}</h2>
                    <p className="text-xs text-muted-foreground">Áp dụng cho: {t.audience}</p>
                  </div>
                  {hasDraft ? (
                    <span className="text-xs text-muted-foreground">Đang có một bản nháp</span>
                  ) : (
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/legal-documents/new?type=${t.id}`}>
                        <PlusIcon /> Soạn phiên bản mới
                      </Link>
                    </Button>
                  )}
                </div>
                {items.length === 0 ? <Card className="p-4 text-sm text-muted-foreground">Chưa có phiên bản nào.</Card> : null}
                <ul className="flex flex-col gap-2">
                  {items.map((v) => (
                    <VersionItem key={v.id} v={v} />
                  ))}
                </ul>
              </section>
            )
          })
        : null}
    </div>
  )
}

function VersionItem({ v }: { v: LegalVersion }) {
  const status = LEGAL_STATUS[v.status ?? ''] ?? { label: v.status ?? '', className: '' }
  return (
    <li>
      <Link to={`/admin/legal-documents/${v.id}`} className="block rounded-sm border bg-card p-4 hover:bg-muted/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">
            Phiên bản {v.version} · {v.title} <Badge className={`ml-2 ${status.className}`}>{status.label}</Badge>
            {v.requiresReacceptance ? <Badge className="ml-1 bg-primary/10 text-primary">Phải đồng ý lại</Badge> : null}
          </p>
          {v.status !== 'DRAFT' ? (
            <p className="text-sm text-muted-foreground tabular-nums">
              {(v.accepted ?? 0).toLocaleString('vi-VN')} đã đồng ý · {(v.pending ?? 0).toLocaleString('vi-VN')} chưa
            </p>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {v.effectiveAt ? `${v.status === 'SCHEDULED' ? 'Hiệu lực từ' : 'Hiệu lực'} ${formatDateTime(v.effectiveAt)}` : 'Chưa có ngày hiệu lực'}
          {v.cancelReason ? ` · lý do huỷ: ${v.cancelReason}` : ''}
        </p>
      </Link>
    </li>
  )
}
