import { Navigate, useParams } from 'react-router'
import {
  articlePath,
  articlesOf,
  COLLECTION_BASE,
  COLLECTION_TITLE,
  findArticle,
  resolveArticles,
  type Article,
  type Collection,
} from '@/entities/article'
import { formatDate } from '@/shared/lib/format'
import { ArticleView, ContentPage, DocsSidebar } from '@/widgets/article/article-view'
import { ArticleCard, Breadcrumb, CardGrid } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import { NotFoundPage } from '@/pages/not-found'

type Trail = { name: string; path: string }[]

const HOME: Trail = [{ name: 'Trang chủ', path: '/' }]

function trailFor(collection: Collection, current?: string): Trail {
  const own = { name: COLLECTION_TITLE[collection], path: COLLECTION_BASE[collection] }
  const base: Trail =
    collection === 'blog' ? [...HOME, own] : [...HOME, { name: 'Hướng dẫn', path: COLLECTION_BASE['bat-dau'] }, own]
  return current ? [...base, { name: current, path: '' }] : base
}

/** The guides menu: every step of Bắt đầu, then every guide of Quản lý cửa hàng. */
const GUIDE_GROUPS = (['bat-dau', 'quan-ly-cua-hang'] as const).map((c) => ({
  title: COLLECTION_TITLE[c],
  items: articlesOf(c).map((a) => ({ label: a.title.replace(/^Bước \d+: /, ''), to: articlePath(c, a.slug) })),
}))

/** /huong-dan goes to the first step of "Bắt đầu"; so does /huong-dan/bat-dau. */
export function GuideStartRedirect() {
  const first = articlesOf('bat-dau')[0]
  return <Navigate to={articlePath('bat-dau', first.slug)} replace />
}

/** One article of a collection, in the shared page format. */
export function ArticlePage({ collection }: { collection: Collection }) {
  const { slug } = useParams()
  const article = findArticle(collection, slug)
  if (!article) return <NotFoundPage />
  const path = articlePath(collection, article.slug)
  const trail = trailFor(collection, article.title)
  trail[trail.length - 1].path = path
  const next = resolveArticles(article.next).slice(0, 2)
  return (
    <>
      <PageSeo
        title={article.title}
        description={article.description}
        path={path}
        image={article.image}
        trail={trail}
        article={{ updated: article.updated, tags: article.tags }}
      />
      <ArticleView
        trail={trail}
        title={article.title}
        meta={`Cập nhật ngày ${formatDate(article.updated)}`}
        blocks={article.blocks}
        tags={article.tags}
        after={next.length > 0 ? <NextSteps articles={next} /> : null}
        sidebar={collection === 'blog' ? undefined : <DocsSidebar groups={GUIDE_GROUPS} current={path} />}
      />
    </>
  )
}

/** Cards to the next steps, at the end of a step page. */
function NextSteps({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="buoc-tiep-theo" className="mt-12">
      <h2 id="buoc-tiep-theo" className="mb-4 text-[1.5rem] leading-9 font-semibold">
        Bước tiếp theo
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard key={`${a.collection}/${a.slug}`} article={a} />
        ))}
      </ul>
    </section>
  )
}

/** A list of cards under a title: three to a row, "Xem thêm" for the rest. */
export function HubPage({ collection, title, intro }: { collection: Collection; title: string; intro: string }) {
  const articles = articlesOf(collection)
  const trail = trailFor(collection)
  return (
    <ContentPage>
      <PageSeo title={title} description={intro} path={COLLECTION_BASE[collection]} trail={trail} />
      <main id="main">
        <section className="border-b bg-white">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-8 pb-14 sm:px-6 lg:pt-12 lg:pb-20">
            <Breadcrumb trail={trail} />
            <h1 className="max-w-3xl text-[2rem] leading-[2.5rem] font-semibold tracking-[-0.02em] sm:text-[2.75rem] sm:leading-[3.25rem]">{title}</h1>
            <p className="max-w-2xl text-[1.0625rem] leading-7 text-muted-foreground">{intro}</p>
          </div>
        </section>
        <section className="relative bg-background pt-8 pb-16 lg:pt-12 lg:pb-24">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
            <CardGrid articles={articles} />
          </div>
        </section>
      </main>
    </ContentPage>
  )
}

export const ManageHubPage = () => (
  <HubPage
    collection="quan-ly-cua-hang"
    title="Quản lý cửa hàng"
    intro="Mỗi hướng dẫn là một việc bạn làm hằng ngày trên trang người bán, gói gọn trong vài thao tác."
  />
)

export const BlogHubPage = () => (
  <HubPage collection="blog" title="Blog" intro="Kiến thức và mẹo nhỏ cho chủ quán bán hàng trong khu: giao hàng, thực đơn, giá bán và chăm sóc khách." />
)
