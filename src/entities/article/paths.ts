import { t } from '@/shared/i18n'
import type { Collection } from './types'

/** Plain data, no imports from the app: vite.config.ts reads it to write sitemap.xml. */
export const COLLECTION_BASE: Record<Collection, string> = {
  'getting-started': '/guides/getting-started',
  'manage-your-shop': '/guides/manage-your-shop',
  blog: '/blog',
}

export const COLLECTION_TITLE: Record<Collection, string> = {
  'getting-started': t('Bắt đầu'),
  'manage-your-shop': t('Quản lý cửa hàng'),
  blog: 'Blog',
}

export const articlePath = (collection: Collection, slug: string) => `${COLLECTION_BASE[collection]}/${slug}`
