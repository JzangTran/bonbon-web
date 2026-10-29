import { t } from '@/shared/i18n'
import type { Collection } from './types'

/** Plain data, no imports from the app: vite.config.ts reads it to write sitemap.xml. */
export const COLLECTION_BASE: Record<Collection, string> = {
  'bat-dau': '/huong-dan/bat-dau',
  'quan-ly-cua-hang': '/huong-dan/quan-ly-cua-hang',
  blog: '/blog',
}

export const COLLECTION_TITLE: Record<Collection, string> = {
  'bat-dau': t('Bắt đầu'),
  'quan-ly-cua-hang': t('Quản lý cửa hàng'),
  blog: 'Blog',
}

export const articlePath = (collection: Collection, slug: string) => `${COLLECTION_BASE[collection]}/${slug}`
