import { API_REFERENCE_URL } from '@/shared/config/env'
import { legalUrl, siteUrl } from '@/shared/config/sites'

export type ResourceLink = { label: string; to?: string; href?: string; external?: boolean }
export type ResourceColumn = { label: string; links: ResourceLink[] }

/** The sources behind "Tài nguyên": the brand, the API for developers, reading, help and legal. */
export const RESOURCE_COLUMNS: ResourceColumn[] = [
  {
    label: 'Thương hiệu',
    links: [
      { label: 'Logo và biểu tượng', to: '/bo-nhan-dien#logo' },
      { label: 'Màu sắc', to: '/bo-nhan-dien#mau-sac' },
      { label: 'Font chữ', to: '/bo-nhan-dien#chu' },
      { label: 'Quy tắc sử dụng', to: '/bo-nhan-dien#quy-tac' },
    ],
  },
  {
    label: 'Nhà phát triển',
    links: [
      { label: 'Tổng quan API', to: '/nha-phat-trien' },
      { label: 'Tài liệu API', href: API_REFERENCE_URL, external: true },
      { label: 'Xác thực', to: '/nha-phat-trien#xac-thuc' },
      { label: 'Mã lỗi', to: '/nha-phat-trien#loi' },
    ],
  },
  {
    label: 'Học và hỗ trợ',
    links: [
      { label: 'Blog', to: '/blog' },
      { label: 'Trung tâm trợ giúp', href: siteUrl('help') },
      { label: 'Liên hệ hỗ trợ', href: siteUrl('help', '/lien-he') },
      { label: 'Pháp lý', href: legalUrl('CUSTOMER_TERMS') },
    ],
  },
]
