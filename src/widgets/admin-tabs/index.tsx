import { PageTabs } from '@/shared/ui/workspace-slots'
import { consolePath } from '@/shared/config/sites'

/** The administrator's home: a starting point with the work queues, and the platform's numbers. */
export function AdminHomeTabs() {
  return (
    <PageTabs
      label="Trang chủ quản trị"
      tabs={[
        { id: 'overview', label: 'Tổng quan', to: consolePath() },
        { id: 'statistics', label: 'Thống kê hệ thống', to: consolePath('/statistics') },
      ]}
    />
  )
}
