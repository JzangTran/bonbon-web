import { CodeIcon, PaletteIcon, type LucideIcon } from 'lucide-react'
import { tx } from '@/shared/i18n'

export const RESOURCES_PATH = '/resources'

export type TabKey = 'design' | 'developers'
export type Section = { key: string; title: string; pages: { slug: string; title: string }[] }

/**
 * The resources site's map, after the GitBook docs: tabs on top (Design, Developers), and in each tab's left menu its sections, which
 * open to their pages. Every name follows the chosen language; only component names stay English (they are the names in the code).
 * The Components section's pages come from the component registry (see frame.tsx), so it is listed here empty.
 */
export const TABS: { key: TabKey; title: string; icon: LucideIcon; sections: Section[] }[] = [
  {
    key: 'design',
    title: tx('Thiết kế', 'Design'),
    icon: PaletteIcon,
    sections: [
      {
        key: 'get-started',
        title: tx('Bắt đầu', 'Get started'),
        pages: [
          { slug: 'whats-new', title: tx('Có gì mới', "What's new") },
          { slug: 'design', title: tx('Thiết kế', 'Design') },
          { slug: 'develop', title: tx('Lập trình', 'Develop') },
        ],
      },
      {
        key: 'design-language',
        title: tx('Ngôn ngữ thiết kế', 'Design language'),
        pages: [
          { slug: 'design-principles', title: tx('Nguyên tắc thiết kế', 'Design principles') },
          { slug: 'logo', title: tx('Logo', 'Logo') },
          { slug: 'color', title: tx('Màu sắc', 'Color') },
          { slug: 'elevation', title: tx('Độ nổi', 'Elevation') },
          { slug: 'iconography', title: tx('Biểu tượng', 'Iconography') },
          { slug: 'layout', title: tx('Bố cục', 'Layout') },
          { slug: 'material', title: tx('Chất liệu', 'Material') },
          { slug: 'motion', title: tx('Chuyển động', 'Motion') },
          { slug: 'shapes', title: tx('Hình dạng', 'Shapes') },
          { slug: 'typography', title: tx('Kiểu chữ', 'Typography') },
        ],
      },
      {
        key: 'ux',
        title: tx('Khung và hướng dẫn UX', 'UX frameworks and guidelines'),
        pages: [
          { slug: 'content-design', title: tx('Thiết kế nội dung', 'Content design') },
          { slug: 'design-tokens', title: tx('Design token', 'Design tokens') },
          { slug: 'handoffs', title: tx('Bàn giao', 'Handoffs') },
          { slug: 'onboarding', title: tx('Làm quen', 'Onboarding') },
          { slug: 'wait-ux', title: tx('Trải nghiệm chờ', 'Wait UX') },
        ],
      },
      { key: 'web-tokens', title: tx('Token cho web', 'Web tokens'), pages: [{ slug: 'color-tokens', title: tx('Token màu', 'Color tokens') }] },
      { key: 'components', title: tx('Thành phần', 'Components'), pages: [] },
    ],
  },
  {
    key: 'developers',
    title: tx('Nhà phát triển', 'Developers'),
    icon: CodeIcon,
    sections: [
      {
        key: 'get-started',
        title: tx('Bắt đầu', 'Get started'),
        pages: [
          { slug: 'overview', title: tx('Tổng quan', 'Overview') },
          { slug: 'authentication', title: tx('Xác thực', 'Authentication') },
          { slug: 'making-requests', title: tx('Gửi yêu cầu', 'Making requests') },
        ],
      },
      {
        key: 'api',
        title: tx('API', 'API'),
        pages: [
          { slug: 'errors', title: tx('Lỗi', 'Errors') },
          { slug: 'rate-limits', title: tx('Giới hạn tần suất', 'Rate limits') },
          { slug: 'realtime-orders', title: tx('Đơn hàng thời gian thực', 'Realtime orders') },
        ],
      },
      { key: 'reference', title: tx('Tra cứu', 'Reference'), pages: [{ slug: 'api-reference', title: tx('Tài liệu API', 'API reference') }] },
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

/** A page's name, as the menu shows it. */
export const pageTitle = (tab: TabKey, section: string, slug: string) => sectionOf(tab, section)?.pages.find((p) => p.slug === slug)?.title ?? slug
