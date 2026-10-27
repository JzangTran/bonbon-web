import { LifeBuoyIcon, SearchIcon } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Link, useParams } from 'react-router'
import { blocksFromText } from '@/entities/article'
import { AUDIENCE_LABEL, useHelpArticle, useHelpArticles, type HelpArticle } from '@/entities/help'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { ArticleView, ContentPage } from '@/widgets/article/article-view'
import { helpPath, siteUrl } from '@/shared/config/sites'
import { Breadcrumb, TagList } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'

const BASE = helpPath()
const HOME = [{ name: 'Trang chủ', path: siteUrl('public', '/') }]
const articlePath = (id: string | undefined) => helpPath(`/bai-viet/${id}`)

function HelpCard({ article }: { article: HelpArticle }) {
  const tags = [AUDIENCE_LABEL[article.audience ?? 'ALL'] ?? 'Mọi người', ...(article.keywords ?? [])]
  return (
    <li className="min-w-0">
      <Link
        to={articlePath(article.id)}
        className="group flex h-full flex-col gap-3 rounded-xl bg-card p-2.5 outline-none transition-colors hover:bg-grey-50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-100">
          <LifeBuoyIcon className="size-12" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <TagList tags={tags} oneLine />
        <h3 className="px-0.5 pb-1 text-[1.0625rem] leading-6 font-semibold text-ink">{article.title}</h3>
      </Link>
    </li>
  )
}

/** The public help center: the articles the bonbon team wrote, with a search that ignores case and accents. */
export function HelpCenterPage() {
  const [q, setQ] = useState('')
  const deferred = useDeferredValue(q)
  const articles = useHelpArticles(deferred)
  const trail = [...HOME, { name: 'Trung tâm trợ giúp', path: BASE }]
  return (
    <ContentPage>
      <PageSeo title="Trung tâm trợ giúp" description="Câu trả lời cho các thắc mắc thường gặp khi đặt món và bán hàng trên bonbon." path={BASE} trail={trail} site="help" />
      <main id="main">
        <section className="border-b bg-white">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-8 pb-14 sm:px-6 lg:pt-12 lg:pb-20">
            <Breadcrumb trail={trail} />
            <h1 className="max-w-3xl text-[2rem] leading-[2.5rem] font-semibold tracking-[-0.02em] sm:text-[2.75rem] sm:leading-[3.25rem]">Trung tâm trợ giúp</h1>
            <p className="max-w-2xl text-[1.0625rem] leading-7 text-muted-foreground">Tìm câu trả lời nhanh, hoặc đọc các bài hướng dẫn do đội ngũ bonbon viết.</p>
            <div className="relative mt-2 w-full max-w-xl">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                aria-label="Tìm trong trung tâm trợ giúp"
                placeholder="Tìm theo tiêu đề, nội dung hoặc từ khoá"
                maxLength={100}
                className="h-12 rounded-full bg-muted pl-11 border-transparent focus-visible:bg-card"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </section>
        <section className="relative bg-background pt-8 pb-16 lg:pt-12 lg:pb-24">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
            {articles.isError ? <FormError message={problemMessage(articles.error)} /> : null}
            {articles.isPending ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-64 rounded-lg" />
                ))}
              </div>
            ) : null}
            {articles.data?.items?.length === 0 ? <p className="text-muted-foreground">Không có bài nào phù hợp. Thử từ khoá khác.</p> : null}
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.data?.items?.map((a) => <HelpCard key={a.id} article={a} />)}
            </ul>
          </div>
        </section>
      </main>
    </ContentPage>
  )
}

/** One help article, in the shared page format (its body is plain text; "## " lines are headings and "- " lines a list). */
export function HelpArticlePage() {
  const { id } = useParams()
  const article = useHelpArticle(id)
  const trail = [...HOME, { name: 'Trung tâm trợ giúp', path: BASE }, { name: article.data?.title ?? '…', path: articlePath(id) }]
  if (article.isPending) {
    return (
      <ContentPage>
        <main id="main" className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
          <Skeleton className="h-96 rounded-lg" />
        </main>
      </ContentPage>
    )
  }
  if (article.isError || !article.data) {
    return (
      <ContentPage>
        <main id="main" className="mx-auto w-full max-w-[1200px] px-4 py-12 sm:px-6">
          <FormError message={article.isError ? problemMessage(article.error) : 'Không tìm thấy bài.'} />
          <Link to={BASE} className="mt-4 inline-block text-primary underline underline-offset-4">
            Về trung tâm trợ giúp
          </Link>
        </main>
      </ContentPage>
    )
  }
  const data = article.data
  const tags = [AUDIENCE_LABEL[data.audience ?? 'ALL'] ?? 'Mọi người', ...(data.keywords ?? [])]
  return (
    <>
      <PageSeo
        title={data.title ?? 'Bài trợ giúp'}
        description={(data.body ?? '').replace(/[#*-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155)}
        path={articlePath(id)}
        trail={trail}
        site="help"
      />
      <ArticleView trail={trail} title={data.title ?? ''} meta={`Cập nhật ${formatDateTime(data.updatedAt)}`} blocks={blocksFromText(data.body ?? '')} tags={tags} />
    </>
  )
}
