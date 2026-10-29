import { t } from '@/shared/i18n'
import { Toc } from '@/widgets/article/article-view'
import { Breadcrumb } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import type { ResourceDoc } from './doc'
import { ResourceFrame } from './frame'
import { useScrollToHash } from './use-scroll-to-hash'
import { RESOURCES_PATH, pagePath, sectionOf, tabOf, tabPath, type TabKey } from './site'

/** One written page of the resources site. */
export function ResourceDocPage({ tab, section, slug, doc }: { tab: TabKey; section: string; slug: string; doc: ResourceDoc }) {
  useScrollToHash()
  const path = pagePath(tab, section, slug)
  const trail = [
    { name: t('Trang chủ'), path: '/' },
    { name: t('Tài nguyên'), path: RESOURCES_PATH },
    { name: tabOf(tab).title, path: tabPath(tab) },
    { name: sectionOf(tab, section)?.title ?? section, path },
    { name: doc.title, path },
  ]
  const headings = [...doc.sections.map((s) => ({ id: s.id, text: s.title, level: 2 as const })), ...(doc.takeaway ? [{ id: 'key-takeaway', text: 'Key takeaway', level: 2 as const }] : [])]
  return (
    <ResourceFrame tab={tab} current={path} aside={<Toc headings={headings} />}>
      <PageSeo title={doc.title} description={doc.summary} path={path} trail={trail} />
      <article className="flex flex-col gap-14">
        <header className="flex flex-col gap-4">
          <Breadcrumb trail={trail} />
          <h1 className="text-[3rem] leading-[3.5rem] font-semibold tracking-[-0.03em]">{doc.title}</h1>
          <p className="text-lead text-ink">{doc.summary}</p>
        </header>
        {doc.sections.map((s) => (
          <section key={s.id} aria-labelledby={s.id} className="flex scroll-mt-36 flex-col gap-5">
            <h2 id={s.id} className="text-h2 font-semibold">
              {s.title}
            </h2>
            {s.body}
          </section>
        ))}
        {doc.takeaway ? (
          <section aria-labelledby="key-takeaway" className="flex scroll-mt-36 flex-col gap-3 rounded-xl bg-beige-50 p-6">
            <h2 id="key-takeaway" className="text-h3 font-semibold">
              Key takeaway
            </h2>
            <p className="text-body text-ink">{doc.takeaway}</p>
          </section>
        ) : null}
      </article>
    </ResourceFrame>
  )
}
