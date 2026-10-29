import { ArrowRightIcon } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { t, tx } from '@/shared/i18n'
import { Toc } from '@/widgets/article/article-view'
import { Breadcrumb } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import { NotFoundPage } from '@/pages/not-found'
import { Code, List, P } from '../doc'
import { ResourceFrame } from '../frame'
import { useScrollToHash } from '../use-scroll-to-hash'
import { COMPONENTS_PATH, RESOURCES_PATH, componentPath, sectionOf, tabOf, tabPath } from '../site'
import { Example, Point, Rule, Variant } from './parts'
import { PLATFORMS } from './platforms'
import { ComponentPreview } from './preview'
import { COMPONENTS, type ComponentDoc } from './registry'

const PLATFORM_TABS = [
  { id: 'web', label: 'Web' },
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
] as const
type Platform = (typeof PLATFORM_TABS)[number]['id']

const SECTION = sectionOf('design', 'components')!.title
const onPhone = (slug: string) => !!PLATFORMS[slug]?.mobile

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

/** /resources/design/components: every component as a picture of itself, by name, with the platforms it exists on. */
export function ComponentsIndexPage() {
  const trail = [
    { name: t('Trang chủ'), path: '/' },
    { name: t('Tài nguyên'), path: RESOURCES_PATH },
    { name: tabOf('design').title, path: tabPath('design') },
    { name: SECTION, path: COMPONENTS_PATH },
  ]
  const sorted = [...COMPONENTS].sort((x, y) => x.name.localeCompare(y.name))
  return (
    <ResourceFrame tab="design" current={COMPONENTS_PATH}>
      <PageSeo title={SECTION} description={t('Các thành phần giao diện của bonbon, mỗi thành phần có định nghĩa, cách dùng, nên và không nên.')} path={COMPONENTS_PATH} trail={trail} />
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Breadcrumb trail={trail} />
          <h1 className="text-[3rem] leading-[3.5rem] font-semibold tracking-[-0.03em]">{SECTION}</h1>
          <p className="text-lead text-ink">{t('Những mảnh ghép dựng nên mọi màn hình của bonbon. Mỗi trang nói thành phần đó là gì, khi nào dùng và khi nào dùng thứ khác, các loại, cách nó phản hồi, nên và không nên, trợ năng và cách viết chữ cho nó.')}</p>
          <p className="text-body text-ink">
            {tx(
              'Tên component luôn là tiếng Anh và trùng tên trong mã nguồn. Android và iOS dùng chung một component React Native.',
              'Component names are always English and match the source code. Android and iOS share one React Native component.',
            )}
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((c) => (
            <li key={c.slug}>
              <Link
                to={componentPath(c.slug)}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-grey-200 outline-none transition-colors hover:border-grey-300 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-40 items-center justify-center bg-grey-100 p-4 transition-colors group-hover:bg-grey-200/70">
                  <ComponentPreview slug={c.slug} />
                </span>
                <span className="flex flex-col gap-1 p-4">
                  <span className="flex items-center justify-between font-mono text-body font-medium text-ink">
                    {c.name}
                    <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
                  </span>
                  <span className="text-caption text-muted-foreground">{onPhone(c.slug) ? 'Web · Android · iOS' : 'Web'}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ResourceFrame>
  )
}

/** /resources/design/components/:slug: one component, laid out like the Fluent 2 usage pages, per platform. */
export function ComponentPage() {
  const { slug } = useParams()
  const doc = COMPONENTS.find((c) => c.slug === slug)
  if (!doc) return <NotFoundPage />
  return <ComponentDocPage key={doc.slug} doc={doc} />
}

function PlatformTabs({ value, onChange }: { value: Platform; onChange: (p: Platform) => void }) {
  return (
    <div role="tablist" aria-label={tx('Nền tảng', 'Platform')} className="flex gap-1 border-b border-grey-200">
      {PLATFORM_TABS.map((p) => {
        const on = p.id === value
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(p.id)}
            className={cn(
              '-mb-px min-h-10 border-b-2 px-3 text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring',
              on ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground',
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

function ComponentDocPage({ doc }: { doc: ComponentDoc }) {
  useScrollToHash()
  const path = componentPath(doc.slug)
  const [params, setParams] = useSearchParams()
  const platform: Platform = params.get('platform') === 'android' ? 'android' : params.get('platform') === 'ios' ? 'ios' : 'web'
  const setPlatform = (p: Platform) => setParams(p === 'web' ? {} : { platform: p }, { replace: true })
  const info = PLATFORMS[doc.slug]
  const trail = [
    { name: t('Trang chủ'), path: '/' },
    { name: t('Tài nguyên'), path: RESOURCES_PATH },
    { name: tabOf('design').title, path: tabPath('design') },
    { name: SECTION, path: COMPONENTS_PATH },
    { name: doc.name, path },
  ]
  const sections =
    platform === 'web'
      ? [
          { id: 'source', text: tx('Mã nguồn', 'Source') },
          doc.types?.length ? { id: 'types', text: t('Các loại') } : null,
          doc.behavior?.length ? { id: 'behavior', text: t('Hành vi') } : null,
          doc.layout ? { id: 'layout', text: t('Bố cục') } : null,
          doc.accessibility?.length ? { id: 'accessibility', text: t('Trợ năng') } : null,
          doc.content?.length ? { id: 'content', text: t('Nội dung') } : null,
        ].filter((x): x is { id: string; text: string } => !!x)
      : info?.mobile
        ? [
            { id: 'source', text: tx('Mã nguồn', 'Source') },
            { id: 'notes', text: tx('Khác với web', 'Differences from the web') },
          ]
        : []

  return (
    <ResourceFrame tab="design" current={path} aside={sections.length ? <Toc headings={sections.map((s) => ({ ...s, level: 2 as const }))} /> : undefined}>
      <PageSeo title={doc.name} description={doc.summary} path={path} trail={trail} />
      <article className="flex flex-col gap-12">
        <div className="flex flex-col gap-6">
          <Breadcrumb trail={trail} />
          <h1 className="font-mono text-[3rem] leading-[3.5rem] font-semibold tracking-[-0.03em]">{doc.name}</h1>
          <p className="text-lead text-ink">{doc.summary}</p>
          <p className="text-lead text-ink">{doc.when}</p>
          <PlatformTabs value={platform} onChange={setPlatform} />
          {platform === 'web' ? <Example code={doc.example.code}>{doc.example.demo}</Example> : null}
        </div>

        {platform !== 'web' ? (
          info?.mobile ? (
            <>
              <Section id="source" title={tx('Mã nguồn', 'Source')}>
                <P>
                  {tx(
                    'Android và iOS dùng chung component này trong bonbon-mobile (React Native), cùng tên với web.',
                    'Android and iOS share this component in bonbon-mobile (React Native), with the same name as on the web.',
                  )}
                </P>
                <Code>{`${info.mobile.source}\n\n${info.mobile.code}`}</Code>
              </Section>
              <Section id="notes" title={tx('Khác với web', 'Differences from the web')}>
                <List items={info.mobile.notes} />
                <Point title={platform === 'android' ? 'Android' : 'iOS'}>
                  <p>{platform === 'android' ? info.mobile.android : info.mobile.ios}</p>
                </Point>
              </Section>
            </>
          ) : (
            <div className="rounded-xl bg-beige-50 p-6 text-body text-ink">{info?.mobileInstead ?? tx('Chưa có trên Android/iOS.', 'Not on Android/iOS yet.')}</div>
          )
        ) : (
          <>
            {info ? (
              <Section id="source" title={tx('Mã nguồn', 'Source')}>
                <Code>{info.web}</Code>
              </Section>
            ) : null}

            {doc.types?.length ? (
              <Section id="types" title={t('Các loại')}>
                <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
                  {doc.types.map((v) => (
                    <Variant key={v.name} name={v.name} demo={v.demo}>
                      {v.text}
                    </Variant>
                  ))}
                </div>
              </Section>
            ) : null}

            {doc.behavior?.length ? (
              <Section id="behavior" title={t('Hành vi')}>
                {doc.behavior.map((b) => (
                  <div key={b.title} className="flex flex-col gap-4">
                    {b.demo ? <Variant name={b.title} demo={b.demo}>{b.text}</Variant> : <Point title={b.title}>{b.text}</Point>}
                  </div>
                ))}
              </Section>
            ) : null}

            {doc.layout ? (
              <Section id="layout" title={t('Bố cục')}>
                <Point>
                  {doc.layout.text.map((x, i) => (
                    <p key={i}>{x}</p>
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
              <Section id="accessibility" title={t('Trợ năng')}>
                {doc.accessibility.map((a) => (
                  <Point key={a.title} title={a.title}>
                    <p>{a.text}</p>
                  </Point>
                ))}
              </Section>
            ) : null}

            {doc.content?.length ? (
              <Section id="content" title={t('Nội dung')}>
                {doc.content.map((c) => (
                  <Point key={c.title} title={c.title}>
                    <p>{c.text}</p>
                  </Point>
                ))}
              </Section>
            ) : null}
          </>
        )}
      </article>
    </ResourceFrame>
  )
}
