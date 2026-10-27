import { useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, MailIcon, SearchIcon, SmartphoneIcon, StoreIcon } from 'lucide-react'
import { useDeferredValue, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { blocksFromText, headingsOf } from '@/entities/article'
import { AUDIENCE_LABEL, useHelpArticle, useHelpArticles, type HelpArticle } from '@/entities/help'
import { api, problemMessage } from '@/shared/api'
import { helpPath, siteUrl } from '@/shared/config/sites'
import { formatDateTime } from '@/shared/lib/format'
import { buttonClass } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { ArticleBody, Toc } from '@/widgets/article/article-view'
import { Breadcrumb, TagList } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import { FormError } from '@/widgets/auth-shell'
import { HelpFrame, HelpSidebar, type HelpNavGroup } from '@/widgets/help-frame'

const BASE = helpPath()
const HOME = [{ name: 'Trang chủ', path: siteUrl('public', '/') }]
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL
const articlePath = (id: string | undefined) => helpPath(`/bai-viet/${id}`)

/** The help articles grouped by who they are for, as the left menu. */
function useHelpGroups(): HelpNavGroup[] {
  const all = useHelpArticles('')
  const items = all.data?.items ?? []
  return (['ALL', 'CUSTOMER', 'SELLER'] as const)
    .map((aud) => ({
      title: AUDIENCE_LABEL[aud],
      items: items.filter((a) => (a.audience ?? 'ALL') === aud).map((a) => ({ label: a.title ?? '', to: articlePath(a.id) })),
    }))
    .filter((g) => g.items.length > 0)
}

function PageTitle({ title, lead }: { title: string; lead?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-h1 font-semibold">{title}</h1>
      {lead ? <p className="text-lead text-muted-foreground">{lead}</p> : null}
    </div>
  )
}

function HelpRow({ article }: { article: HelpArticle }) {
  return (
    <li>
      <Link to={articlePath(article.id)} className="group flex flex-col gap-2 rounded-xl border border-grey-200 p-5 outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring">
        <span className="text-caption font-medium tracking-wide text-primary uppercase">{AUDIENCE_LABEL[article.audience ?? 'ALL'] ?? 'Mọi người'}</span>
        <span className="text-body font-medium text-ink">{article.title}</span>
        {article.keywords?.length ? <TagList tags={article.keywords} oneLine /> : null}
      </Link>
    </li>
  )
}

/** The help center: one place for customers, sellers and administrators; a search that ignores case and accents. */
export function HelpCenterPage() {
  const [q, setQ] = useState('')
  const deferred = useDeferredValue(q)
  const articles = useHelpArticles(deferred)
  const groups = useHelpGroups()
  const trail = [...HOME, { name: 'Trung tâm trợ giúp', path: BASE }]
  return (
    <HelpFrame tab="help" sidebar={<HelpSidebar groups={groups} />}>
      <PageSeo title="Trung tâm trợ giúp" description="Câu trả lời cho các thắc mắc thường gặp khi đặt món và bán hàng trên bonbon." path={BASE} trail={trail} site="help" />
      <div className="flex flex-col gap-8">
        <PageTitle title="Trung tâm trợ giúp" lead="Tìm câu trả lời nhanh, hoặc đọc các bài hướng dẫn do đội ngũ bonbon viết." />
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Tìm trong trung tâm trợ giúp"
            placeholder="Tìm theo tiêu đề, nội dung hoặc từ khoá"
            maxLength={100}
            className="h-11 rounded-full pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {articles.isError ? <FormError message={problemMessage(articles.error)} /> : null}
        {articles.isPending ? <Skeleton className="h-48 rounded-xl" /> : null}
        {articles.data?.items?.length === 0 ? <p className="text-muted-foreground">Không có bài nào phù hợp. Thử từ khoá khác.</p> : null}
        <ul className="grid gap-3 sm:grid-cols-2">{articles.data?.items?.map((a) => <HelpRow key={a.id} article={a} />)}</ul>
        <Link to={helpPath('/lien-he')} className="group flex items-center justify-between gap-4 rounded-xl bg-accent p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex flex-col gap-1">
            <span className="text-body font-medium">Chưa thấy câu trả lời?</span>
            <span className="text-ui text-muted-foreground">Gửi câu hỏi cho đội hỗ trợ bonbon.</span>
          </span>
          <ArrowRightIcon className="size-5 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </HelpFrame>
  )
}

/** One help article: the menu on the left, the text in the middle, its headings on the right. */
export function HelpArticlePage() {
  const { id } = useParams()
  const article = useHelpArticle(id)
  const groups = useHelpGroups()
  const data = article.data
  const trail = [...HOME, { name: 'Trung tâm trợ giúp', path: BASE }, { name: data?.title ?? '…', path: articlePath(id) }]
  const blocks = blocksFromText(data?.body ?? '')
  return (
    <HelpFrame tab="help" sidebar={<HelpSidebar groups={groups} current={articlePath(id)} />} aside={data ? <Toc headings={headingsOf(blocks)} /> : null}>
      {article.isPending ? <Skeleton className="h-96 rounded-xl" /> : null}
      {article.isError || (!article.isPending && !data) ? (
        <div className="flex flex-col gap-4">
          <FormError message={article.isError ? problemMessage(article.error) : 'Không tìm thấy bài.'} />
          <Link to={BASE} className="text-primary underline underline-offset-4">
            Về trung tâm trợ giúp
          </Link>
        </div>
      ) : null}
      {data ? (
        <>
          <PageSeo
            title={data.title ?? 'Bài trợ giúp'}
            description={(data.body ?? '').replace(/[#*-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155)}
            path={articlePath(id)}
            trail={trail}
            site="help"
          />
          <article className="flex flex-col gap-6">
            <Breadcrumb trail={trail.slice(1)} />
            <PageTitle title={data.title ?? ''} />
            <p className="-mt-3 text-small text-muted-foreground">Cập nhật {formatDateTime(data.updatedAt)}</p>
            <ArticleBody blocks={blocks} />
            <TagList tags={[AUDIENCE_LABEL[data.audience ?? 'ALL'] ?? 'Mọi người', ...(data.keywords ?? [])]} className="mt-6" />
          </article>
        </>
      ) : null}
    </HelpFrame>
  )
}

const CONTACT_GROUPS: HelpNavGroup[] = [
  {
    title: 'Liên hệ hỗ trợ',
    items: [
      { label: 'Khách đặt món', to: helpPath('/lien-he') + '#khach' },
      { label: 'Người bán', to: helpPath('/lien-he') + '#nguoi-ban' },
      { label: 'Email', to: helpPath('/lien-he') + '#email' },
    ],
  },
]

function Channel({ id, icon, title, children, action }: { id: string; icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="flex scroll-mt-36 flex-col gap-3 rounded-xl border border-grey-200 p-6">
      <span className="text-primary [&_svg]:size-6">{icon}</span>
      <h2 id={`${id}-t`} className="text-h3 font-medium">
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-body text-muted-foreground">{children}</div>
      {action ? <div className="mt-2">{action}</div> : null}
    </section>
  )
}

/** How each kind of user reaches the bonbon team. Requests are sent from where the person is signed in, so the team knows who asks. */
export function ContactPage() {
  const path = helpPath('/lien-he')
  const trail = [...HOME, { name: 'Liên hệ hỗ trợ', path }]
  return (
    <HelpFrame tab="contact" sidebar={<HelpSidebar groups={CONTACT_GROUPS} />}>
      <PageSeo title="Liên hệ hỗ trợ" description="Cách gửi câu hỏi và yêu cầu hỗ trợ cho đội ngũ bonbon." path={path} trail={trail} site="help" />
      <div className="flex flex-col gap-8">
        <PageTitle
          title="Liên hệ hỗ trợ"
          lead={
            <>
              Trước khi gửi, thử tìm trong{' '}
              <Link to={BASE} className="text-ink underline decoration-primary underline-offset-4">
                trung tâm trợ giúp
              </Link>
              : phần lớn câu hỏi đã có câu trả lời.
            </>
          }
        />
        <Channel id="khach" icon={<SmartphoneIcon strokeWidth={1.5} />} title="Bạn đặt món trên bonbon">
          <p>Mở ứng dụng bonbon, vào Tài khoản rồi chọn Hỗ trợ để gửi yêu cầu. Nếu câu hỏi về một đơn cụ thể, mở đơn đó và chọn Báo vấn đề để bonbon thấy ngay đơn nào.</p>
        </Channel>
        <Channel
          id="nguoi-ban"
          icon={<StoreIcon strokeWidth={1.5} />}
          title="Bạn bán hàng trên bonbon"
          action={
            <a href={siteUrl('merchant', '/support-tickets')} className={buttonClass()}>
              Gửi yêu cầu trong kênh người bán
            </a>
          }
        >
          <p>Đăng nhập kênh người bán để gửi yêu cầu và theo dõi trả lời. Trên điện thoại, dùng mục Hỗ trợ trong ứng dụng bonbon dành cho người bán.</p>
        </Channel>
        {SUPPORT_EMAIL ? (
          <Channel id="email" icon={<MailIcon strokeWidth={1.5} />} title="Email">
            <p>
              Khi không đăng nhập được, viết cho{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-ink underline decoration-primary underline-offset-4">
                {SUPPORT_EMAIL}
              </a>{' '}
              và ghi email tài khoản của bạn.
            </p>
          </Channel>
        ) : null}
      </div>
    </HelpFrame>
  )
}

type DocumentType = 'CUSTOMER_TERMS' | 'SELLER_TERMS' | 'PRIVACY_POLICY'
const LEGAL: { type: DocumentType; label: string }[] = [
  { type: 'CUSTOMER_TERMS', label: 'Điều khoản sử dụng' },
  { type: 'SELLER_TERMS', label: 'Điều khoản người bán' },
  { type: 'PRIVACY_POLICY', label: 'Chính sách quyền riêng tư' },
]
const legalPath = (type: string) => helpPath(`/phap-ly/${type}`)
const LEGAL_GROUPS: HelpNavGroup[] = [{ title: 'Văn bản pháp lý', items: LEGAL.map((d) => ({ label: d.label, to: legalPath(d.type) })) }]

/** /phap-ly opens the first document. */
export function LegalIndexRedirect() {
  return <Navigate to={legalPath(LEGAL[0].type)} replace />
}

/** The version of a legal document in force (linked from the consent checkboxes everywhere). */
export function LegalPage() {
  const { type } = useParams()
  const known = LEGAL.find((d) => d.type === type)
  const doc = useQuery({
    queryKey: ['legal-document', type],
    enabled: !!known,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/legal/documents/{type}', { params: { path: { type: type as DocumentType } } })
      if (error || !data) throw error
      return data
    },
  })
  const path = legalPath(type ?? '')
  const trail = [...HOME, { name: 'Pháp lý', path: helpPath('/phap-ly') }, { name: known?.label ?? 'Văn bản', path }]
  return (
    <HelpFrame tab="legal" sidebar={<HelpSidebar groups={LEGAL_GROUPS} current={path} />}>
      {known ? <PageSeo title={known.label} description={`${known.label} của bonbon, phiên bản đang có hiệu lực.`} path={path} trail={trail} site="help" /> : null}
      <div className="flex flex-col gap-6">
        <Breadcrumb trail={trail.slice(1)} />
        {!known ? <p>Không tìm thấy văn bản.</p> : null}
        {doc.isPending && known ? <Skeleton className="h-96 rounded-xl" /> : null}
        {doc.isError ? <FormError message={problemMessage(doc.error)} /> : null}
        {doc.data ? (
          <>
            <PageTitle title={doc.data.title ?? known?.label ?? ''} />
            <p className="-mt-3 text-small text-muted-foreground">
              Phiên bản {doc.data.version}
              {doc.data.effectiveAt ? ` · hiệu lực từ ${new Date(doc.data.effectiveAt).toLocaleDateString('vi-VN')}` : ''}
            </p>
            <article className="text-body leading-7 whitespace-pre-line text-ink">{doc.data.content}</article>
          </>
        ) : null}
      </div>
    </HelpFrame>
  )
}
