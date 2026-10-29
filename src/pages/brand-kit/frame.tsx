import type { ReactNode } from 'react'
import { DocsFrame, DocsRail, type DocsNavGroup, type DocsTab } from '@/shared/ui/docs-frame'
import { t } from '@/shared/i18n'
import { COMPONENT_GROUPS, COMPONENTS } from './components/registry'
import { BRAND_GROUPS, COMPONENTS_PATH, componentPath, groupPath, pagePath, type BrandGroupKey } from './site'

const TABS: DocsTab[] = BRAND_GROUPS.map((g) => ({ key: g.key, label: g.title, icon: g.icon, to: groupPath(g.key) }))

function railOf(group: BrandGroupKey): DocsNavGroup[] {
  if (group === 'components') {
    return [
      { title: 'Components', items: [{ label: t('Tổng quan'), to: COMPONENTS_PATH }] },
      ...COMPONENT_GROUPS.map((g) => ({ title: g, items: COMPONENTS.filter((c) => c.group === g).map((c) => ({ label: c.name, to: componentPath(c.slug) })) })),
    ]
  }
  const g = BRAND_GROUPS.find((x) => x.key === group)!
  return [{ title: g.title, items: g.pages.map((p) => ({ label: p.title, to: pagePath(group, p.slug) })) }]
}

/** The brand site, laid out like the help center: the five parts as tabs, the part's pages on the left, the page's headings on the right. */
export function BrandFrame({ group, current, aside, children }: { group: BrandGroupKey; current: string; aside?: ReactNode; children: ReactNode }) {
  const title = BRAND_GROUPS.find((x) => x.key === group)!.title
  return (
    <DocsFrame label={t('Thương hiệu')} tabs={TABS} tab={group} sidebar={<DocsRail groups={railOf(group)} current={current} label={title} />} aside={aside}>
      {children}
    </DocsFrame>
  )
}
