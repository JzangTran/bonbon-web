import { articlePath, articlesOf, COLLECTION_BASE, type Article } from '@/entities/article'
import { API_REFERENCE_URL } from '@/shared/config/env'
import { legalUrl, siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

export type ResourceLink = { label: string; to?: string; href?: string; external?: boolean }
export type ResourceColumn = { label: string; links: ResourceLink[] }

/** The sources behind "Tài nguyên": the brand, the API for developers, reading, help and legal. */
export const RESOURCE_COLUMNS: ResourceColumn[] = [
  {
    label: 'Design',
    links: [
      { label: 'Get started', to: '/resources/design/get-started/whats-new' },
      { label: 'Logo', to: '/resources/design/design-language/logo' },
      { label: 'Color', to: '/resources/design/design-language/color' },
      { label: 'Typography', to: '/resources/design/design-language/typography' },
      { label: 'Components', to: '/resources/design/components' },
    ],
  },
  {
    label: 'Developers',
    links: [
      { label: 'Overview', to: '/resources/developers/get-started/overview' },
      { label: 'API reference', href: API_REFERENCE_URL, external: true },
      { label: 'Authentication', to: '/resources/developers/get-started/authentication' },
      { label: 'Errors', to: '/resources/developers/api/errors' },
    ],
  },
  {
    label: t('Học và hỗ trợ'),
    links: [
      { label: 'Blog', to: '/blog' },
      { label: t('Trung tâm trợ giúp'), href: siteUrl('help') },
      { label: t('Liên hệ hỗ trợ'), href: siteUrl('help', '/contact') },
      { label: t('Pháp lý'), href: legalUrl('CUSTOMER_TERMS') },
    ],
  },
]

const short = (a: Article) => a.title.replace(/^Bước \d+: /, '')

/** The guides: every step of Bắt đầu, the first guides of Quản lý cửa hàng and the way to all of them. */
export const GUIDE_COLUMNS: ResourceColumn[] = [
  { label: t('Bắt đầu'), links: articlesOf('getting-started').map((a, i) => ({ label: `${i + 1}. ${short(a)}`, to: articlePath('getting-started', a.slug) })) },
  {
    label: t('Quản lý cửa hàng'),
    links: [
      ...articlesOf('manage-your-shop').slice(0, 4).map((a) => ({ label: a.title, to: articlePath('manage-your-shop', a.slug) })),
      { label: t('Xem tất cả hướng dẫn'), to: COLLECTION_BASE['manage-your-shop'] },
    ],
  },
]

/** The menus of the public bar, each opening the same large panel. */
export const MENUS = {
  guides: { columns: GUIDE_COLUMNS, here: ['/guides'] },
  resources: { columns: RESOURCE_COLUMNS, here: ['/resources'] },
} as const
export type MenuKey = keyof typeof MENUS
