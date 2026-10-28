import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import {
  LEGAL_STATUS,
  LEGAL_TYPES,
  useCancelLegal,
  useCreateLegalDraft,
  useLegalVersion,
  usePublishLegal,
  useUpdateLegalDraft,
  type LegalDetail,
  type LegalDocumentType,
} from '@/entities/legal-document'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { useNow } from '@/shared/lib/use-now'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { consolePath } from '@/shared/config/sites'

const MIN_NOTICE_DAYS = 15

/** One version: write and preview a draft, publish it with an effective date, or read and withdraw a published one. */
export function AdminLegalDocumentEditPage() {
  const { id = '' } = useParams()
  const { session } = useSession()
  const allowed = !!session?.permissions.has('legal-document:write')
  const [params] = useSearchParams()
  const isNew = id === 'new'
  const detail = useLegalVersion(id, allowed && !isNew)

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền quản lý văn bản pháp lý.</p>
  if (isNew) {
    const type = params.get('type') as LegalDocumentType | null
    return LEGAL_TYPES.some((t) => t.id === type) ? <Editor type={type as LegalDocumentType} /> : <p className="text-muted-foreground">Không rõ loại văn bản cần soạn.</p>
  }
  if (detail.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (detail.isError || !detail.data.version) return <FormError message={problemMessage(detail.error)} />
  return <VersionView detail={detail.data} />
}

function Back() {
  return (
    <Link to={consolePath('/legal-documents')} className="text-link inline-flex items-center gap-1 text-sm">
      <ArrowLeftIcon className="size-4" /> Văn bản pháp lý
    </Link>
  )
}

function Preview({ title, summary, content }: { title: string; summary: string; content: string }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Xem trước</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">{title || '(chưa có tiêu đề)'}</h2>
        {summary ? (
          <div className="rounded-sm bg-muted px-3 py-2 text-sm">
            <p className="font-medium">Tóm tắt thay đổi</p>
            <p className="whitespace-pre-line">{summary}</p>
          </div>
        ) : null}
        <article className="leading-7 whitespace-pre-line">{content || '(chưa có nội dung)'}</article>
      </CardContent>
    </Card>
  )
}

function Fields({
  title,
  setTitle,
  summary,
  setSummary,
  content,
  setContent,
  reaccept,
  setReaccept,
}: {
  title: string
  setTitle: (v: string) => void
  summary: string
  setSummary: (v: string) => void
  content: string
  setContent: (v: string) => void
  reaccept: boolean
  setReaccept: (v: boolean) => void
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="legal-title">Tiêu đề</Label>
        <Input id="legal-title" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="legal-summary">Tóm tắt thay đổi (người dùng đọc trước khi đồng ý)</Label>
        <Textarea id="legal-summary" rows={3} maxLength={2000} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="legal-content">Nội dung</Label>
        <Textarea id="legal-content" rows={16} maxLength={200000} className="font-mono text-sm" value={content} onChange={(e) => setContent(e.target.value)} />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={reaccept} onChange={(e) => setReaccept(e.target.checked)} />
        <span>
          <span className="font-medium">Thay đổi quan trọng: người dùng phải đồng ý lại.</span>
          <span className="block text-muted-foreground">
            Cần báo trước ít nhất {MIN_NOTICE_DAYS} ngày. Bỏ chọn nếu chỉ sửa lỗi chính tả hoặc làm rõ câu chữ: bản mới có hiệu lực ngay và không bắt ai đồng ý lại.
          </span>
        </span>
      </label>
    </>
  )
}

function Editor({ type }: { type: LegalDocumentType }) {
  const navigate = useNavigate()
  const create = useCreateLegalDraft()
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [reaccept, setReaccept] = useState(true)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const label = LEGAL_TYPES.find((t) => t.id === type)?.label

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <Back />
      <h1 className="text-2xl font-semibold">Soạn phiên bản mới: {label}</h1>
      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <Fields title={title} setTitle={setTitle} summary={summary} setSummary={setSummary} content={content} setContent={setContent} reaccept={reaccept} setReaccept={setReaccept} />
          <FormError message={error} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              {preview ? 'Ẩn xem trước' : 'Xem trước'}
            </Button>
            <Button
              disabled={title.trim() === '' || content.trim() === '' || create.isPending}
              onClick={() =>
                create.mutate(
                  { type, title: title.trim(), summary: summary.trim(), content, requiresReacceptance: reaccept },
                  {
                    onSuccess: (data) => {
                      toast.success('Đã lưu bản nháp.')
                      navigate(consolePath(`/legal-documents/${data.version?.id}`), { replace: true })
                    },
                    onError: (e) => setError(problemMessage(e)),
                  },
                )
              }
            >
              Lưu bản nháp
            </Button>
          </div>
        </CardContent>
      </Card>
      {preview ? <Preview title={title} summary={summary} content={content} /> : null}
    </div>
  )
}

function VersionView({ detail }: { detail: LegalDetail }) {
  const v = detail.version!
  const status = LEGAL_STATUS[v.status ?? ''] ?? { label: v.status ?? '', className: '' }
  const typeLabel = LEGAL_TYPES.find((t) => t.id === v.type)?.label

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <Back />
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">
          {typeLabel} · phiên bản {v.version}
        </h1>
        <Badge className={status.className}>{status.label}</Badge>
      </div>
      {v.status === 'DRAFT' ? (
        <DraftEditor detail={detail} />
      ) : (
        <>
          <Card size="sm">
            <CardContent className="flex flex-col gap-1 text-sm">
              <p>
                <span className="text-muted-foreground">Đăng:</span> {formatDateTime(v.publishedAt)} · <span className="text-muted-foreground">Hiệu lực:</span> {formatDateTime(v.effectiveAt)}
              </p>
              <p>
                <span className="text-muted-foreground">Đồng ý lại:</span> {v.requiresReacceptance ? 'bắt buộc' : 'không (thay đổi nhỏ)'} ·{' '}
                <span className="text-muted-foreground">Đã đồng ý:</span> {(v.accepted ?? 0).toLocaleString('vi-VN')} · <span className="text-muted-foreground">Chưa:</span>{' '}
                {(v.pending ?? 0).toLocaleString('vi-VN')}
              </p>
              {v.cancelReason ? (
                <p>
                  <span className="text-muted-foreground">Huỷ lúc {formatDateTime(v.cancelledAt)}:</span> {v.cancelReason}
                </p>
              ) : null}
              <p className="break-all text-xs text-muted-foreground">SHA-256 lúc đăng: {v.contentSha256}</p>
            </CardContent>
          </Card>
          <Preview title={v.title ?? ''} summary={v.summary ?? ''} content={detail.content ?? ''} />
          {v.status === 'SCHEDULED' ? <CancelPanel id={v.id!} /> : null}
        </>
      )}
    </div>
  )
}

function DraftEditor({ detail }: { detail: LegalDetail }) {
  const v = detail.version!
  const navigate = useNavigate()
  const update = useUpdateLegalDraft(v.id!)
  const [title, setTitle] = useState(v.title ?? '')
  const [summary, setSummary] = useState(v.summary ?? '')
  const [content, setContent] = useState(detail.content ?? '')
  const [reaccept, setReaccept] = useState(v.requiresReacceptance ?? true)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dirty = title !== (v.title ?? '') || summary !== (v.summary ?? '') || content !== (detail.content ?? '') || reaccept !== (v.requiresReacceptance ?? true)

  return (
    <>
      <Card size="sm">
        <CardContent className="flex flex-col gap-4">
          <Fields title={title} setTitle={setTitle} summary={summary} setSummary={setSummary} content={content} setContent={setContent} reaccept={reaccept} setReaccept={setReaccept} />
          <FormError message={error} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              {preview ? 'Ẩn xem trước' : 'Xem trước'}
            </Button>
            <Button
              disabled={!dirty || title.trim() === '' || content.trim() === '' || update.isPending}
              onClick={() => {
                setError(null)
                update.mutate(
                  { title: title.trim(), summary: summary.trim(), content, requiresReacceptance: reaccept },
                  { onSuccess: () => toast.success('Đã lưu bản nháp.'), onError: (e) => setError(problemMessage(e)) },
                )
              }}
            >
              Lưu bản nháp
            </Button>
          </div>
        </CardContent>
      </Card>
      {preview ? <Preview title={title} summary={summary} content={content} /> : null}
      <PublishPanel id={v.id!} reaccept={reaccept} dirty={dirty} onDiscarded={() => navigate(consolePath('/legal-documents'))} />
    </>
  )
}

function PublishPanel({ id, reaccept, dirty, onDiscarded }: { id: string; reaccept: boolean; dirty: boolean; onDiscarded: () => void }) {
  const publish = usePublishLegal(id)
  const cancel = useCancelLegal(id)
  const [effectiveAt, setEffectiveAt] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const now = useNow(60_000)
  const min = new Date(now + MIN_NOTICE_DAYS * 86_400_000)
  const tooSoon = reaccept && effectiveAt !== '' && new Date(effectiveAt) < min

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Đăng phiên bản</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {reaccept
            ? `Thay đổi quan trọng: ngày hiệu lực phải cách bây giờ ít nhất ${MIN_NOTICE_DAYS} ngày (bỏ trống là đúng ${MIN_NOTICE_DAYS} ngày). Mọi người thuộc đối tượng được báo trong ứng dụng và qua email, và phải đồng ý lại khi có hiệu lực.`
            : 'Thay đổi nhỏ: bỏ trống là có hiệu lực ngay. Mọi người thuộc đối tượng vẫn được báo, nhưng không phải đồng ý lại.'}{' '}
          Đã đăng thì nội dung không sửa được nữa.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="legal-effective">Ngày hiệu lực</Label>
          <Input id="legal-effective" type="datetime-local" className="max-w-xs" value={effectiveAt} onChange={(e) => setEffectiveAt(e.target.value)} />
          {tooSoon ? <p className="text-sm text-danger-fg">Chưa đủ {MIN_NOTICE_DAYS} ngày báo trước. Sớm nhất: {formatDateTime(min.toISOString())}.</p> : null}
        </div>
        {dirty ? <p className="text-sm text-warning-fg">Có thay đổi chưa lưu. Hãy lưu bản nháp trước khi đăng.</p> : null}
        <FormError message={error} />
        <div className="flex flex-wrap justify-between gap-2">
          <Button
            variant="outline"
            disabled={cancel.isPending}
            onClick={() => {
              if (window.confirm('Bỏ bản nháp này?')) {
                cancel.mutate('', { onSuccess: onDiscarded, onError: (e) => setError(problemMessage(e)) })
              }
            }}
          >
            Bỏ bản nháp
          </Button>
          <Button disabled={dirty || tooSoon || publish.isPending} onClick={() => setConfirm(true)}>
            Đăng phiên bản
          </Button>
        </div>
      </CardContent>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng phiên bản này?</DialogTitle>
            <DialogDescription>
              {effectiveAt ? `Có hiệu lực từ ${formatDateTime(new Date(effectiveAt).toISOString())}.` : reaccept ? `Có hiệu lực sau ${MIN_NOTICE_DAYS} ngày.` : 'Có hiệu lực ngay.'} Người dùng được báo ngay và nội dung không sửa được nữa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={publish.isPending}
              onClick={() => {
                setConfirm(false)
                setError(null)
                publish.mutate(effectiveAt ? new Date(effectiveAt).toISOString() : undefined, {
                  onSuccess: () => toast.success('Đã đăng phiên bản.'),
                  onError: (e) => setError(problemMessage(e)),
                })
              }}
            >
              Đăng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function CancelPanel({ id }: { id: string }) {
  const cancel = useCancelLegal(id)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <Card size="sm" className="border-destructive/40">
      <CardHeader>
        <CardTitle>Rút lại phiên bản</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Phiên bản chưa đến ngày hiệu lực có thể rút lại. Mọi người được báo là thay đổi sẽ không áp dụng, kèm lý do.</p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cancel-reason">Lý do (người dùng sẽ thấy)</Label>
          <Textarea id="cancel-reason" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <FormError message={error} />
        <div className="flex justify-end">
          <Button
            variant="destructive"
            disabled={reason.trim() === '' || cancel.isPending}
            onClick={() => {
              if (window.confirm('Rút lại phiên bản này?')) {
                cancel.mutate(reason.trim(), { onSuccess: () => toast.success('Đã rút lại phiên bản.'), onError: (e) => setError(problemMessage(e)) })
              }
            }}
          >
            Rút lại
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
