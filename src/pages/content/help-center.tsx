import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRightIcon, CheckIcon, SearchIcon } from 'lucide-react'
import { useDeferredValue, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { blocksFromText, headingsOf } from '@/entities/article'
import { AUDIENCE_LABEL, useHelpArticle, useHelpArticles, type HelpArticle } from '@/entities/help'
import { api, problemMessage } from '@/shared/api'
import { helpPath, siteUrl } from '@/shared/config/sites'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Captcha } from '@/shared/ui/captcha'
import { Label } from '@/shared/ui/label'
import { OrangeRibbon } from '@/shared/ui/orange-ribbon'
import { Textarea } from '@/shared/ui/textarea'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { ArticleBody, Toc } from '@/widgets/article/article-view'
import { Breadcrumb, TagList } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import { FormError } from '@/widgets/auth-shell'
import { HelpFrame, HelpSidebar, type HelpNavGroup } from '@/widgets/help-frame'
import { intlLocale, t } from '@/shared/i18n'

const BASE = helpPath()
const HOME = [{ name: t('Trang chủ'), path: siteUrl('public', '/') }]
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL
const articlePath = (id: string | undefined) => helpPath(`/articles/${id}`)

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
        <span className="text-caption font-medium tracking-wide text-primary uppercase">{AUDIENCE_LABEL[article.audience ?? 'ALL'] ?? t('Mọi người')}</span>
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
  const trail = [...HOME, { name: t('Trung tâm trợ giúp'), path: BASE }]
  return (
    <HelpFrame tab="help" sidebar={<HelpSidebar groups={groups} />}>
      <PageSeo title={t('Trung tâm trợ giúp')} description={t('Câu trả lời cho các thắc mắc thường gặp khi đặt món và bán hàng trên bonbon.')} path={BASE} trail={trail} site="help" />
      <div className="flex flex-col gap-8">
        <PageTitle title={t('Trung tâm trợ giúp')} lead={t('Tìm câu trả lời nhanh, hoặc đọc các bài hướng dẫn do đội ngũ bonbon viết.')} />
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label={t('Tìm trong trung tâm trợ giúp')}
            placeholder={t('Tìm theo tiêu đề, nội dung hoặc từ khoá')}
            maxLength={100}
            className="h-11 rounded-full pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {articles.isError ? <FormError message={problemMessage(articles.error)} /> : null}
        {articles.isPending ? <Skeleton className="h-48 rounded-xl" /> : null}
        {articles.data?.items?.length === 0 ? <p className="text-muted-foreground">{t('Không có bài nào phù hợp. Thử từ khoá khác.')}</p> : null}
        <ul className="grid gap-3 sm:grid-cols-2">{articles.data?.items?.map((a) => <HelpRow key={a.id} article={a} />)}</ul>
        <Link to={helpPath('/contact')} className="group flex items-center justify-between gap-4 rounded-xl bg-accent p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex flex-col gap-1">
            <span className="text-body font-medium">{t('Chưa thấy câu trả lời?')}</span>
            <span className="text-ui text-muted-foreground">{t('Gửi câu hỏi cho đội hỗ trợ bonbon.')}</span>
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
  const trail = [...HOME, { name: t('Trung tâm trợ giúp'), path: BASE }, { name: data?.title ?? '…', path: articlePath(id) }]
  const blocks = blocksFromText(data?.body ?? '')
  return (
    <HelpFrame tab="help" sidebar={<HelpSidebar groups={groups} current={articlePath(id)} />} aside={data ? <Toc headings={headingsOf(blocks)} /> : null}>
      {article.isPending ? <Skeleton className="h-96 rounded-xl" /> : null}
      {article.isError || (!article.isPending && !data) ? (
        <div className="flex flex-col gap-4">
          <FormError message={article.isError ? problemMessage(article.error) : t('Không tìm thấy bài.')} />
          <Link to={BASE} className="text-link">
            {t('Về trung tâm trợ giúp')}
          </Link>
        </div>
      ) : null}
      {data ? (
        <>
          <PageSeo
            title={data.title ?? t('Bài trợ giúp')}
            description={(data.body ?? '').replace(/[#*-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155)}
            path={articlePath(id)}
            trail={trail}
            site="help"
          />
          <article className="flex flex-col gap-6">
            <Breadcrumb trail={trail.slice(1)} />
            <PageTitle title={data.title ?? ''} />
            <p className="-mt-3 text-small text-muted-foreground">{t('Cập nhật ')}{formatDateTime(data.updatedAt)}</p>
            <ArticleBody blocks={blocks} />
            <TagList tags={[AUDIENCE_LABEL[data.audience ?? 'ALL'] ?? t('Mọi người'), ...(data.keywords ?? [])]} className="mt-6" />
          </article>
        </>
      ) : null}
    </HelpFrame>
  )
}

const ROLES = [
  { id: 'CUSTOMER', label: t('Khách đặt món') },
  { id: 'SELLER', label: t('Người bán') },
  { id: 'OTHER', label: t('Khác') },
]
const TOPICS = [
  { id: 'ORDER', label: t('Đơn hàng') },
  { id: 'ACCOUNT', label: t('Tài khoản và đăng nhập') },
  { id: 'SHOP', label: t('Mở quán, cửa hàng') },
  { id: 'PAYMENT', label: t('Thanh toán, hoàn tiền') },
  { id: 'OTHER', label: t('Khác') },
]
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const field = 'flex flex-col gap-1.5'
const selectClass =
  'h-10 w-full rounded-md bg-white px-3 text-ui text-ink shadow-[inset_0_0_0_1px_var(--grey-300)] outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--primary)] invalid:text-muted-foreground'

function Required() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  )
}

/**
 * Liên hệ hỗ trợ, after gitbook.com/enterprise: the promise on the left, the form on a panel of orange rings on the right. Anyone can
 * write, signed in or not; the answer goes to the email they give.
 */
export function ContactPage() {
  const path = helpPath('/contact')
  const trail = [...HOME, { name: t('Liên hệ hỗ trợ'), path }]
  const [form, setForm] = useState({ fullName: '', email: '', role: '', topic: '', message: '' })
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sent, setSent] = useState<string | null>(null)
  const submit = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/public/contact-requests', { body: { ...form, captchaToken: captchaToken ?? undefined } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => setSent(form.email.trim()),
  })
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!form.fullName.trim()) next.fullName = t('Hãy nhập họ tên.')
    if (!EMAIL_RE.test(form.email.trim())) next.email = t('Hãy nhập email để nhận câu trả lời.')
    if (!form.role) next.role = t('Hãy chọn bạn là ai.')
    if (!form.topic) next.topic = t('Hãy chọn chủ đề.')
    if (!form.message.trim()) next.message = t('Hãy viết điều bạn cần hỏi.')
    if (!captchaToken) next.captcha = t('Hãy xác nhận bạn không phải robot.')
    setErrors(next)
    if (Object.keys(next).length === 0) submit.mutate()
  }

  return (
    <HelpFrame tab="contact" wide>
      <PageSeo title={t('Liên hệ hỗ trợ')} description={t('Gửi câu hỏi cho đội ngũ bonbon; câu trả lời đến email của bạn.')} path={path} trail={trail} site="help" />
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:gap-16">
        <div className="flex flex-col gap-5 lg:pt-6">
          <span className="text-caption font-medium tracking-[0.08em] text-primary uppercase">{t('Liên hệ hỗ trợ')}</span>
          <h1 className="text-[2.25rem] leading-[2.75rem] font-medium tracking-[-0.025em] sm:text-[3rem] sm:leading-[3.375rem]">{t('Đội ngũ bonbon luôn sẵn sàng giúp bạn')}</h1>
          <p className="text-lead text-muted-foreground">
            {t('Khách đặt món, chủ quán hay bất kỳ ai cũng gửi được, không cần đăng nhập. Chúng tôi trả lời qua email bạn để lại, thường trong một ngày làm việc.')}
          </p>
          <p className="text-ui text-muted-foreground">
            {t('Câu hỏi thường gặp đã có trong')}{' '}
            <Link to={BASE} className="text-link text-ink">
              {t('trung tâm trợ giúp')}
            </Link>
            {t('. Vấn đề về một đơn cụ thể, mở đơn trong ứng dụng và chọn Báo vấn đề để quán và bonbon thấy ngay đơn nào.')}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-grey-100 p-4 sm:p-6">
          <OrangeRibbon className="pointer-events-none absolute -top-1/4 -right-1/3 w-[95%]" />
          <OrangeRibbon className="pointer-events-none absolute -bottom-1/3 -left-1/2 w-[90%]" />
          <div className="bb-auth relative rounded-xl bg-beige-50 p-6 sm:p-8">
            {sent ? (
              <div role="status" className="flex flex-col items-start gap-4 py-6">
                <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                  <CheckIcon className="size-6" aria-hidden="true" />
                </span>
                <h2 className="text-h2 font-medium">{t('Đã gửi yêu cầu')}</h2>
                <p className="text-body text-muted-foreground">
                  {t('Chúng tôi sẽ trả lời qua ')}<b className="font-medium text-ink">{sent}</b>{t('. Hãy xem cả hộp thư rác nếu chưa thấy.')}
                </p>
                <button
                  type="button"
                  className="text-link text-ui text-ink"
                  onClick={() => {
                    setForm({ fullName: '', email: '', role: '', topic: '', message: '' })
                    setCaptchaToken(null)
                    setSent(null)
                  }}
                >
                  {t('Gửi yêu cầu khác')}
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
                <h2 className="text-[1.875rem] leading-9 font-medium tracking-[-0.015em]">{t('Gửi yêu cầu')}</h2>
                <div className={field}>
                  <Label htmlFor="c-name">
                    {t('Họ tên ')}<Required />
                  </Label>
                  <Input id="c-name" autoComplete="name" placeholder={t('Họ tên')} maxLength={100} value={form.fullName} onChange={set('fullName')} aria-invalid={!!errors.fullName} />
                  {errors.fullName ? <p className="text-small text-destructive">{errors.fullName}</p> : null}
                </div>
                <div className={field}>
                  <Label htmlFor="c-email">
                    {t('Email nhận trả lời ')}<Required />
                  </Label>
                  <Input id="c-email" type="email" autoComplete="email" placeholder="ban@email.com" maxLength={255} value={form.email} onChange={set('email')} aria-invalid={!!errors.email} />
                  {errors.email ? <p className="text-small text-destructive">{errors.email}</p> : null}
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className={field}>
                    <Label htmlFor="c-role">
                      {t('Bạn là ')}<Required />
                    </Label>
                    <select id="c-role" required className={selectClass} value={form.role} onChange={set('role')} aria-invalid={!!errors.role}>
                      <option value="" disabled>
                        {t('Chọn...')}
                      </option>
                      {ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    {errors.role ? <p className="text-small text-destructive">{errors.role}</p> : null}
                  </div>
                  <div className={field}>
                    <Label htmlFor="c-topic">
                      {t('Chủ đề ')}<Required />
                    </Label>
                    <select id="c-topic" required className={selectClass} value={form.topic} onChange={set('topic')} aria-invalid={!!errors.topic}>
                      <option value="" disabled>
                        {t('Chọn...')}
                      </option>
                      {TOPICS.map((tItem) => (
                        <option key={tItem.id} value={tItem.id}>
                          {tItem.label}
                        </option>
                      ))}
                    </select>
                    {errors.topic ? <p className="text-small text-destructive">{errors.topic}</p> : null}
                  </div>
                </div>
                <div className={field}>
                  <Label htmlFor="c-message">
                    {t('Chúng tôi giúp gì được cho bạn? ')}<Required />
                  </Label>
                  <Textarea
                    id="c-message"
                    rows={5}
                    maxLength={2000}
                    showCount
                    placeholder={t('Tôi có câu hỏi về...')}
                    value={form.message}
                    onChange={set('message')}
                    aria-invalid={!!errors.message}
                    className="rounded-md bg-white shadow-[inset_0_0_0_1px_var(--grey-300)]"
                  />
                  {errors.message ? <p className="text-small text-destructive">{errors.message}</p> : null}
                </div>
                <div className={field}>
                  <Captcha onToken={setCaptchaToken} />
                  {errors.captcha ? <p className="text-small text-destructive">{errors.captcha}</p> : null}
                </div>
                {submit.isError ? <FormError message={problemMessage(submit.error)} /> : null}
                <Button type="submit" disabled={submit.isPending} className="w-full">
                  {submit.isPending ? t('Đang gửi...') : t('Gửi yêu cầu')}
                </Button>
                <p className="text-center text-small text-muted-foreground">
                  {t('Khi gửi, bạn đồng ý với')}{' '}
                  <Link to={helpPath('/legal/PRIVACY_POLICY')} className="text-link hover:text-ink">
                    {t('chính sách quyền riêng tư')}
                  </Link>
                  .{SUPPORT_EMAIL ? (
                    <>
                      {' '}{t('Bạn cũng có thể viết cho')}{' '}
                      <a href={`mailto:${SUPPORT_EMAIL}`} className="text-link hover:text-ink">
                        {SUPPORT_EMAIL}
                      </a>
                      .
                    </>
                  ) : null}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </HelpFrame>
  )
}

type DocumentType = 'CUSTOMER_TERMS' | 'SELLER_TERMS' | 'PRIVACY_POLICY'
const LEGAL: { type: DocumentType; label: string }[] = [
  { type: 'CUSTOMER_TERMS', label: t('Điều khoản sử dụng') },
  { type: 'SELLER_TERMS', label: t('Điều khoản người bán') },
  { type: 'PRIVACY_POLICY', label: t('Chính sách quyền riêng tư') },
]
const legalPath = (type: string) => helpPath(`/legal/${type}`)
const LEGAL_GROUPS: HelpNavGroup[] = [{ title: t('Văn bản pháp lý'), items: LEGAL.map((d) => ({ label: d.label, to: legalPath(d.type) })) }]

/** /legal opens the first document. */
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
  const trail = [...HOME, { name: t('Pháp lý'), path: helpPath('/legal') }, { name: known?.label ?? t('Văn bản'), path }]
  return (
    <HelpFrame tab="legal" sidebar={<HelpSidebar groups={LEGAL_GROUPS} current={path} />}>
      {known ? <PageSeo title={known.label} description={t('{v0} của bonbon, phiên bản đang có hiệu lực.', { v0: known.label })} path={path} trail={trail} site="help" /> : null}
      <div className="flex flex-col gap-6">
        <Breadcrumb trail={trail.slice(1)} />
        {!known ? <p>{t('Không tìm thấy văn bản.')}</p> : null}
        {doc.isPending && known ? <Skeleton className="h-96 rounded-xl" /> : null}
        {doc.isError ? <FormError message={problemMessage(doc.error)} /> : null}
        {doc.data ? (
          <>
            <PageTitle title={doc.data.title ?? known?.label ?? ''} />
            <p className="-mt-3 text-small text-muted-foreground">
              {t('Phiên bản ')}{doc.data.version}
              {doc.data.effectiveAt ? t(' · hiệu lực từ {v0}', { v0: new Date(doc.data.effectiveAt).toLocaleDateString(intlLocale) }) : ''}
            </p>
            <article className="text-body leading-7 whitespace-pre-line text-ink">{doc.data.content}</article>
          </>
        ) : null}
      </div>
    </HelpFrame>
  )
}
