import { BookOpenIcon, BracesIcon, ComponentIcon, PaletteIcon, RocketIcon, type LucideIcon } from 'lucide-react'

export const BRAND_PATH = '/bo-nhan-dien'
export const COMPONENTS_PATH = `${BRAND_PATH}/components`

export type BrandGroupKey = 'get-started' | 'design-language' | 'ux' | 'web-tokens' | 'components'

/**
 * The brand site's map, after the Fluent 2 docs. Group and page names stay in English in both languages: they are the design system's
 * own terms, the same words the code and the tokens use.
 */
export const BRAND_GROUPS: { key: BrandGroupKey; title: string; icon: LucideIcon; pages: { slug: string; title: string }[] }[] = [
  {
    key: 'get-started',
    title: 'Get started',
    icon: RocketIcon,
    pages: [
      { slug: 'whats-new', title: "What's new" },
      { slug: 'design', title: 'Design' },
      { slug: 'develop', title: 'Develop' },
    ],
  },
  {
    key: 'design-language',
    title: 'Design language',
    icon: PaletteIcon,
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
    icon: BookOpenIcon,
    pages: [
      { slug: 'content-design', title: 'Content design' },
      { slug: 'design-tokens', title: 'Design tokens' },
      { slug: 'handoffs', title: 'Handoffs' },
      { slug: 'onboarding', title: 'Onboarding' },
      { slug: 'wait-ux', title: 'Wait UX' },
    ],
  },
  { key: 'web-tokens', title: 'Web tokens', icon: BracesIcon, pages: [{ slug: 'color-tokens', title: 'Color tokens' }] },
  { key: 'components', title: 'Components', icon: ComponentIcon, pages: [] },
]

export const pagePath = (group: BrandGroupKey, slug: string) => `${BRAND_PATH}/${group}/${slug}`
export const componentPath = (slug: string) => `${COMPONENTS_PATH}/${slug}`
/** The first page of a group, where its tab leads. */
export const groupPath = (key: BrandGroupKey) => {
  const g = BRAND_GROUPS.find((x) => x.key === key)!
  return g.pages.length ? pagePath(key, g.pages[0].slug) : COMPONENTS_PATH
}
