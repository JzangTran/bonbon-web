import { PlusIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AUDIENCE_LABEL, useAdminHelpArticles, useDeleteHelpArticle, useSaveHelpArticle, type AdminHelpArticle, type HelpAudience, type HelpDraft, type HelpStatus, HELP_KEY } from '@/entities/help'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { consolePath } from '@/shared/config/sites'
import { SubPage, SubPageActions } from '@/shared/ui/sub-page'
import { formatRelative } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'

const FILTERS: { id: HelpStatus | 'ALL_STATUSES'; label: string }[] = [
  { id: 'ALL_STATUSES', label: 'Tất cả' },
  { id: 'PUBLISHED', label: 'Đã đăng' },
  { id: 'DRAFT', label: 'Nháp' },
]

const EMPTY: HelpDraft = { title: '', body: '', audience: 'ALL', keywords: [], status: 'DRAFT' }

/** The help centre's articles (manage-help-center-content.md): write, publish, unpublish, delete. */
export function AdminHelpArticlesPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('help-center:write')
  const [filter, setFilter] = useState<HelpStatus | 'ALL_STATUSES'>('ALL_STATUSES')
  const [q, setQ] = useState('')
  const paging = usePaging()
  const [deleting, setDeleting] = useState<AdminHelpArticle | null>(null)
  const articles = useAdminHelpArticles(filter, q, paging.page, paging.size)
  const remove = useDeleteHelpArticle()
  const total = articles.data?.total ?? 0

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền soạn bài trợ giúp.</p>

  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Bài trợ giúp</h1>
          <p className="text-sm text-muted-foreground">Khách và người bán đọc các bài này không cần đăng nhập. Bài nháp chỉ quản trị viên thấy.</p>
        </div>
        <Button asChild>
          <Link to={consolePath('/help-articles/new')}>
            <PlusIcon /> Bài mới
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PageTabs
          label="Bài trợ giúp"
          tabs={FILTERS}
          value={filter}
          onValueChange={(id) => {
            setFilter(id as HelpStatus | 'ALL_STATUSES')
            paging.reset()
          }}
        />
        <Input
          type="search"
          className="max-w-xs"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            paging.reset()
          }}
          placeholder="Tìm bài"
          aria-label="Tìm bài"
        />
      </div>

      {articles.isError ? <FormError message={problemMessage(articles.error)} /> : null}
      {articles.isPending ? <Skeleton className="h-32" /> : null}
      {articles.data && articles.data.items?.length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có bài nào.</Card> : null}

      <ul className="flex flex-col gap-3">
        {(articles.data?.items ?? []).map((a) => (
          <li key={a.id}>
            <Card className="gap-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{a.title}</span>
                  <Badge variant="outline">{AUDIENCE_LABEL[a.audience ?? ''] ?? a.audience}</Badge>
                  <Badge className={a.status === 'PUBLISHED' ? 'bg-success-subtle text-success-fg' : 'bg-warning-subtle text-warning-fg'}>{a.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">Sửa {formatRelative(a.updatedAt)}</span>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
              {(a.keywords ?? []).length > 0 ? <p className="text-xs text-muted-foreground">Từ khoá: {a.keywords?.join(', ')}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to={consolePath(`/help-articles/${a.id}`)}>Sửa</Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDeleting(a)}>
                  Xoá
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <Pagination paging={paging} total={total} />

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá bài này?</DialogTitle>
            <DialogDescription>&quot;{deleting?.title}&quot; sẽ bị xoá hẳn, không hoàn tác được. Muốn tạm ẩn thì chuyển bài về nháp.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Giữ lại</Button>
            </DialogClose>
            <Button
              disabled={remove.isPending}
              onClick={() => deleting?.id && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
            >
              Xoá bài
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const draftOf = (a: AdminHelpArticle): HelpDraft => ({
  title: a.title ?? '',
  body: a.body ?? '',
  audience: (a.audience as HelpAudience) ?? 'ALL',
  keywords: a.keywords ?? [],
  status: (a.status as HelpStatus) ?? 'DRAFT',
})

/** /help-articles/new and /help-articles/:id: writing one article on a page of its own. */
export function AdminHelpArticleEditPage() {
  const { id } = useParams()
  const { session } = useSession()
  const article = useQuery({
    queryKey: [...HELP_KEY, 'admin', 'one', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/help-articles/{id}', { params: { path: { id: id! } } })
      if (error || !data) throw error
      return data
    },
  })
  if (!session?.permissions.has('help-center:write')) return <p className="text-muted-foreground">Bạn không có quyền soạn bài trợ giúp.</p>
  if (id && article.isPending) return <Skeleton className="h-96 max-w-3xl" />
  if (id && !article.data) return <FormError message={article.isError ? problemMessage(article.error) : 'Không tìm thấy bài.'} />
  return <ArticleEditor key={id ?? 'new'} initial={{ id: id ?? null, draft: id && article.data ? draftOf(article.data) : EMPTY }} />
}

function ArticleEditor({ initial }: { initial: { id: string | null; draft: HelpDraft } }) {
  const navigate = useNavigate()
  const onClose = () => navigate(consolePath('/help-articles'))
  const save = useSaveHelpArticle()
  const [draft, setDraft] = useState(initial.draft)
  const [keywords, setKeywords] = useState(initial.draft.keywords.join(', '))
  const valid = draft.title.trim().length > 0 && draft.body.trim().length > 0

  const submit = (status: HelpStatus) => {
    const list = keywords.split(',').map((k) => k.trim()).filter(Boolean)
    save.mutate({ id: initial.id, draft: { ...draft, keywords: list, status } }, { onSuccess: onClose })
  }

  return (
    <SubPage
      back={{ to: consolePath('/help-articles'), label: 'Bài trợ giúp' }}
      title={initial.id ? 'Sửa bài' : 'Bài mới'}
      description="Viết như đang trả lời một người đang cần giúp. Từ khoá giúp tìm bài; không cần dấu hay chữ hoa."
    >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="help-title">Tiêu đề hoặc câu hỏi</Label>
            <Input id="help-title" value={draft.title} maxLength={200} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="help-body">Nội dung trả lời</Label>
            <Textarea id="help-body" rows={14} value={draft.body} maxLength={10000} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Dành cho</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Dành cho">
              {(['ALL', 'CUSTOMER', 'SELLER'] as const).map((a) => (
                <Button key={a} type="button" role="radio" aria-checked={draft.audience === a} size="sm" variant={draft.audience === a ? 'default' : 'outline'} onClick={() => setDraft({ ...draft, audience: a })}>
                  {AUDIENCE_LABEL[a]}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="help-keywords">Từ khoá (cách nhau bằng dấu phẩy, tối đa 20)</Label>
            <Input id="help-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="hoàn tiền, khiếu nại" />
          </div>
          {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
        </div>
        <SubPageActions>
          <Button disabled={!valid || save.isPending} onClick={() => submit('PUBLISHED')}>
            Đăng bài
          </Button>
          <Button variant="outline" disabled={!valid || save.isPending} onClick={() => submit('DRAFT')}>
            Lưu nháp
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
        </SubPageActions>
    </SubPage>
  )
}
