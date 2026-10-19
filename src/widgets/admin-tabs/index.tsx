import { PageTabs } from '@/shared/ui/workspace-slots'

/** The administrator's home: a starting point with the work queues, and the platform's numbers. */
export function AdminHomeTabs() {
  return (
    <PageTabs
      label="Trang chủ quản trị"
      tabs={[
        { id: 'overview', label: 'Tổng quan', to: '/admin' },
        { id: 'statistics', label: 'Thống kê hệ thống', to: '/admin/statistics' },
      ]}
    />
  )
}
