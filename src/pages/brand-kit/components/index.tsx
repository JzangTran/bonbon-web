import { ArrowRightIcon } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { DocsRail } from '@/shared/ui/docs-frame'
import { Toc } from '@/widgets/article/article-view'
import { Breadcrumb } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import { NotFoundPage } from '@/pages/not-found'
import { BRAND_PATH, BrandFrame, COMPONENTS_PATH } from '../frame'
import { Example, Point, Rule, Variant } from './parts'
import { COMPONENT_GROUPS, COMPONENTS, type ComponentDoc } from './registry'
import { t } from '@/shared/i18n'

const pathOf = (slug: string) => `${COMPONENTS_PATH}/${slug}`

const GROUPS = [
  { title: 'Components', items: [{ label: t('Tổng quan'), to: COMPONENTS_PATH }] },
  ...COMPONENT_GROUPS.map((g) => ({ title: g, items: COMPONENTS.filter((c) => c.group === g).map((c) => ({ label: c.name, to: pathOf(c.slug) })) })),
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex scroll-mt-36 flex-col gap-8 border-t border-grey-200 pt-12">
      <h2 id={id} className="text-h1 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** /bo-nhan-dien/components: every component as a card, by group. */
export function ComponentsIndexPage() {
  const trail = [
    { name: t('Trang chủ'), path: '/' },
    { name: t('Thương hiệu'), path: BRAND_PATH },
    { name: 'Components', path: COMPONENTS_PATH },
  ]
  return (
    <BrandFrame tab="components" sidebar={<DocsRail groups={GROUPS} current={COMPONENTS_PATH} label="Components" />}>
      <PageSeo title="Components" description={t('Các thành phần giao diện của bonbon, mỗi thành phần có định nghĩa, cách dùng, nên và không nên.')} path={COMPONENTS_PATH} trail={trail} />
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <Breadcrumb trail={trail} />
          <h1 className="text-[3rem] leading-[3.5rem] font-semibold tracking-[-0.03em]">Components</h1>
          <p className="text-lead text-ink">
            {t('Những mảnh ghép dựng nên mọi màn hình của bonbon. Mỗi trang nói thành phần đó là gì, khi nào dùng và khi nào dùng thứ khác, các loại, cách nó phản hồi, nên và không nên, trợ năng và cách viết chữ cho nó.')}
          </p>
        </div>
        {COMPONENT_GROUPS.map((g) => (
          <section key={g} aria-labelledby={`g-${g}`} className="flex flex-col gap-4">
            <h2 id={`g-${g}`} className="text-h2 font-semibold">
              {g}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {COMPONENTS.filter((c) => c.group === g).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={pathOf(c.slug)}
                    className="group flex h-full flex-col gap-2 rounded-xl border border-grey-200 p-5 outline-none transition-colors hover:bg-grey-100 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex items-center justify-between text-body font-medium text-ink">
                      {c.name}
                      <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
                    </span>
                    <span className="text-ui text-muted-foreground">{c.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </BrandFrame>
  )
}

/** /bo-nhan-dien/components/:slug: one component, laid out like the Fluent 2 usage pages. */
export function ComponentPage() {
  const { slug } = useParams()
  const doc = COMPONENTS.find((c) => c.slug === slug)
  if (!doc) return <NotFoundPage />
  return <ComponentDocPage doc={doc} />
}

function ComponentDocPage({ doc }: { doc: ComponentDoc }) {
  const path = pathOf(doc.slug)
  const trail = [
    { name: t('Trang chủ'), path: '/' },
    { name: 'Components', path: COMPONENTS_PATH },
    { name: doc.name, path },
  ]
  const sections = [
    doc.types?.length ? { id: 'cac-loai', text: t('Các loại') } : null,
    doc.behavior?.length ? { id: 'hanh-vi', text: t('Hành vi') } : null,
    doc.layout ? { id: 'bo-cuc', text: t('Bố cục') } : null,
    doc.accessibility?.length ? { id: 'tro-nang', text: t('Trợ năng') } : null,
    doc.content?.length ? { id: 'noi-dung', text: t('Nội dung') } : null,
  ].filter((x): x is { id: string; text: string } => !!x)

  return (
    <BrandFrame tab="components" sidebar={<DocsRail groups={GROUPS} current={path} label="Components" />} aside={<Toc headings={sections.map((s) => ({ ...s, level: 2 as const }))} />}>
      <PageSeo title={doc.name} description={doc.summary} path={path} trail={trail} />
      <article className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <Breadcrumb trail={trail} />
          <h1 className="text-[3rem] leading-[3.5rem] font-semibold tracking-[-0.03em]">{doc.name}</h1>
          <p className="text-lead text-ink">{doc.summary}</p>
          <p className="text-lead text-ink">{doc.when}</p>
          <Example code={doc.example.code}>{doc.example.demo}</Example>
        </div>

        {doc.types?.length ? (
          <Section id="cac-loai" title={t('Các loại')}>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {doc.types.map((tItem) => (
                <Variant key={tItem.name} name={tItem.name} demo={tItem.demo}>
                  {tItem.text}
                </Variant>
              ))}
            </div>
          </Section>
        ) : null}

        {doc.behavior?.length ? (
          <Section id="hanh-vi" title={t('Hành vi')}>
            {doc.behavior.map((b) => (
              <div key={b.title} className="flex flex-col gap-4">
                {b.demo ? <Variant name={b.title} demo={b.demo}>{b.text}</Variant> : <Point title={b.title}>{b.text}</Point>}
              </div>
            ))}
          </Section>
        ) : null}

        {doc.layout ? (
          <Section id="bo-cuc" title={t('Bố cục')}>
            <Point>
              {doc.layout.text.map((tItem, i) => (
                <p key={i}>{tItem}</p>
              ))}
            </Point>
            {doc.layout.rules.length ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {doc.layout.rules.map((r) => (
                  <Rule key={r.caption} ok={r.ok} caption={r.caption}>
                    {r.demo}
                  </Rule>
                ))}
              </div>
            ) : null}
          </Section>
        ) : null}

        {doc.accessibility?.length ? (
          <Section id="tro-nang" title={t('Trợ năng')}>
            {doc.accessibility.map((a) => (
              <Point key={a.title} title={a.title}>
                <p>{a.text}</p>
              </Point>
            ))}
          </Section>
        ) : null}

        {doc.content?.length ? (
          <Section id="noi-dung" title={t('Nội dung')}>
            {doc.content.map((c) => (
              <Point key={c.title} title={c.title}>
                <p>{c.text}</p>
              </Point>
            ))}
          </Section>
        ) : null}
      </article>
    </BrandFrame>
  )
}
