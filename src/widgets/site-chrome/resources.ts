import { articlePath, articlesOf, COLLECTION_BASE, type Article } from '@/entities/article'
import { API_REFERENCE_URL } from '@/shared/config/env'
import { legalUrl, siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

export type ResourceLink = { label: string; to?: string; href?: string; external?: boolean }
export type ResourceColumn = { label: string; links: ResourceLink[] }

/** The sources behind "Tài nguyên": the brand, the API for developers, reading, help and legal. */
export const RESOURCE_COLUMNS: ResourceColumn[] = [
  {
    label: t('Thương hiệu'),
    links: [
      { label: 'Get started', to: '/bo-nhan-dien/get-started/whats-new' },
      { label: 'Logo', to: '/bo-nhan-dien/design-language/logo' },
      { label: 'Color', to: '/bo-nhan-dien/design-language/color' },
      { label: 'Typography', to: '/bo-nhan-dien/design-language/typography' },
      { label: 'Components', to: '/bo-nhan-dien/components' },
    ],
  },
  {
    label: t('Nhà phát triển'),
    links: [
      { label: t('Tổng quan API'), to: '/nha-phat-trien' },
      { label: t('Tài liệu API'), href: API_REFERENCE_URL, external: true },
      { label: t('Xác thực'), to: '/nha-phat-trien#xac-thuc' },
      { label: t('Mã lỗi'), to: '/nha-phat-trien#loi' },
    ],
  },
  {
    label: t('Học và hỗ trợ'),
    links: [
      { label: 'Blog', to: '/blog' },
      { label: t('Trung tâm trợ giúp'), href: siteUrl('help') },
      { label: t('Liên hệ hỗ trợ'), href: siteUrl('help', '/lien-he') },
      { label: t('Pháp lý'), href: legalUrl('CUSTOMER_TERMS') },
    ],
  },
]

const short = (a: Article) => a.title.replace(/^Bước \d+: /, '')

/** The guides: every step of Bắt đầu, the first guides of Quản lý cửa hàng and the way to all of them. */
export const GUIDE_COLUMNS: ResourceColumn[] = [
  { label: t('Bắt đầu'), links: articlesOf('bat-dau').map((a, i) => ({ label: `${i + 1}. ${short(a)}`, to: articlePath('bat-dau', a.slug) })) },
  {
    label: t('Quản lý cửa hàng'),
    links: [
      ...articlesOf('quan-ly-cua-hang').slice(0, 4).map((a) => ({ label: a.title, to: articlePath('quan-ly-cua-hang', a.slug) })),
      { label: t('Xem tất cả hướng dẫn'), to: COLLECTION_BASE['quan-ly-cua-hang'] },
    ],
  },
]

/** The menus of the public bar, each opening the same large panel. */
export const MENUS = {
  guides: { columns: GUIDE_COLUMNS, here: ['/huong-dan'] },
  resources: { columns: RESOURCE_COLUMNS, here: ['/bo-nhan-dien', '/nha-phat-trien'] },
} as const
export type MenuKey = keyof typeof MENUS
