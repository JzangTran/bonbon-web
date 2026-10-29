import { CodeIcon, PaletteIcon, type LucideIcon } from 'lucide-react'

export const RESOURCES_PATH = '/resources'

export type TabKey = 'design' | 'developers'
export type Section = { key: string; title: string; pages: { slug: string; title: string }[] }

/**
 * The resources site's map, after the GitBook docs: tabs on top (Design, Developers), and in each tab's left menu its sections, which
 * open to their pages. Names stay in English in both languages: they are the design system's and the API's own terms. The Components
 * section's pages come from the component registry (see frame.tsx), so it is listed here empty.
 */
export const TABS: { key: TabKey; title: string; icon: LucideIcon; sections: Section[] }[] = [
  {
    key: 'design',
    title: 'Design',
    icon: PaletteIcon,
    sections: [
      {
        key: 'get-started',
        title: 'Get started',
        pages: [
          { slug: 'whats-new', title: "What's new" },
          { slug: 'design', title: 'Design' },
          { slug: 'develop', title: 'Develop' },
        ],
      },
      {
        key: 'design-language',
        title: 'Design language',
        pages: [
          { slug: 'design-principles', title: 'Design principles' },
          { slug: 'logo', title: 'Logo' },
          { slug: 'color', title: 'Color' },
          { slug: 'elevation', title: 'Elevation' },
          { slug: 'iconography', title: 'Iconography' },
          { slug: 'layout', title: 'Layout' },
          { slug: 'material', title: 'Material' },
          { slug: 'motion', title: 'Motion' },
          { slug: 'shapes', title: 'Shapes' },
          { slug: 'typography', title: 'Typography' },
        ],
      },
      {
        key: 'ux',
        title: 'UX frameworks and guidelines',
        pages: [
          { slug: 'content-design', title: 'Content design' },
          { slug: 'design-tokens', title: 'Design tokens' },
          { slug: 'handoffs', title: 'Handoffs' },
          { slug: 'onboarding', title: 'Onboarding' },
          { slug: 'wait-ux', title: 'Wait UX' },
        ],
      },
      { key: 'web-tokens', title: 'Web tokens', pages: [{ slug: 'color-tokens', title: 'Color tokens' }] },
      { key: 'components', title: 'Components', pages: [] },
    ],
  },
  {
    key: 'developers',
    title: 'Developers',
    icon: CodeIcon,
    sections: [
      {
        key: 'get-started',
        title: 'Get started',
        pages: [
          { slug: 'overview', title: 'Overview' },
          { slug: 'authentication', title: 'Authentication' },
          { slug: 'making-requests', title: 'Making requests' },
        ],
      },
      {
        key: 'api',
        title: 'API',
        pages: [
          { slug: 'errors', title: 'Errors' },
          { slug: 'rate-limits', title: 'Rate limits' },
          { slug: 'realtime-orders', title: 'Realtime orders' },
        ],
      },
      { key: 'reference', title: 'Reference', pages: [{ slug: 'api-reference', title: 'API reference' }] },
    ],
  },
]

export const COMPONENTS_PATH = `${RESOURCES_PATH}/design/components`
export const pagePath = (tab: TabKey, section: string, slug: string) => `${RESOURCES_PATH}/${tab}/${section}/${slug}`
export const componentPath = (slug: string) => `${COMPONENTS_PATH}/${slug}`
export const tabOf = (key: TabKey) => TABS.find((x) => x.key === key)!
export const sectionOf = (tab: TabKey, key: string) => tabOf(tab).sections.find((s) => s.key === key)

/** The first page of a tab, where the tab leads. */
export const tabPath = (key: TabKey) => {
  const first = tabOf(key).sections[0]
  return pagePath(key, first.key, first.pages[0].slug)
}
