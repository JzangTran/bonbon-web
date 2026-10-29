import type { ReactNode } from 'react'
import { DocsFrame, type DocsTab } from '@/shared/ui/docs-frame'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { OrangeRibbon } from '@/shared/ui/orange-ribbon'
import { t, tx } from '@/shared/i18n'
import { COMPONENTS } from './components/registry'
import { ResourceSearch } from './search'
import { COMPONENTS_PATH, TABS, componentPath, pagePath, tabPath, type TabKey } from './site'
import { ResourceTree, type TreeSection } from './tree'

const DOCS_TABS: DocsTab[] = TABS.map((x) => ({ key: x.key, label: x.title, icon: x.icon, to: tabPath(x.key) }))

function treeOf(tab: TabKey): TreeSection[] {
  return TABS.find((x) => x.key === tab)!.sections.map((s) => ({
    key: s.key,
    title: s.title,
    items:
      s.key === 'components'
        ? [{ label: tx('Tổng quan', 'Overview'), to: COMPONENTS_PATH }, ...[...COMPONENTS].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ label: c.name, to: componentPath(c.slug) }))]
        : s.pages.map((p) => ({ label: p.title, to: pagePath(tab, s.key, p.slug) })),
  }))
}

/** The resources site (Design, Developers), after the GitBook docs: search in the header, tabs, a two-level menu, a ribbon behind the page. */
export function ResourceFrame({ tab, current, aside, children }: { tab: TabKey; current: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <DocsFrame
      label={t('Tài nguyên')}
      tabs={DOCS_TABS}
      tab={tab}
      search={<ResourceSearch tab={tab} />}
      tabsEnd={<LanguageSwitch compact />}
      decoration={<OrangeRibbon variant="knot" />}
      sidebar={<ResourceTree key={tab} sections={treeOf(tab)} current={current} label={TABS.find((x) => x.key === tab)!.title} />}
      aside={aside}
    >
      {children}
    </DocsFrame>
  )
}
