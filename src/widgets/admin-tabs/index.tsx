import { t } from '@/shared/i18n'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { consolePath } from '@/shared/config/sites'

/** The administrator's home: a starting point with the work queues, and the platform's numbers. */
export function AdminHomeTabs() {
  return (
    <PageTabs
      label={t('Trang chủ quản trị')}
      tabs={[
        { id: 'overview', label: t('Tổng quan'), to: consolePath() },
        { id: 'statistics', label: t('Thống kê hệ thống'), to: consolePath('/statistics') },
      ]}
    />
  )
}
