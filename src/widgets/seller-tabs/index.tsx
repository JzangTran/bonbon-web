import { useLocation } from 'react-router'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { merchantPath } from '@/shared/config/sites'

/** Complaints from customers and the shop's own fault record are two views of one concern: orders that went wrong. */
export function OrderCaseTabs() {
  return (
    <PageTabs
      label="Trả hàng và hoàn tiền"
      tabs={[
        { id: 'cases', label: 'Khiếu nại của khách', to: merchantPath('/order-cases') },
        { id: 'performance', label: 'Hiệu suất và điểm phạt', to: merchantPath('/performance') },
      ]}
    />
  )
}

/** The menu: dishes (and the form to add one), the option groups they offer, and the dishes flagged under the wrong category. */
export function MenuTabs() {
  const { pathname } = useLocation()
  return (
    <PageTabs
      label="Thực đơn"
      tabs={[
        { id: 'dishes', label: 'Món ăn', to: merchantPath('/menu'), active: pathname === merchantPath('/menu') || pathname === merchantPath('/menu/new') },
        { id: 'options', label: 'Nhóm lựa chọn', to: merchantPath('/menu/options') },
        { id: 'category-cases', label: 'Món sai ngành', to: merchantPath('/category-cases') },
      ]}
    />
  )
}

/** Revenue statistics and the earnings statement answer the same question: how much did the shop make. */
export function FinanceTabs() {
  return (
    <PageTabs
      label="Doanh thu"
      tabs={[
        { id: 'statistics', label: 'Thống kê', to: merchantPath('/statistics') },
        { id: 'earnings', label: 'Thu nhập và sao kê', to: merchantPath('/earnings') },
      ]}
    />
  )
}
