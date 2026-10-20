import { useLocation } from 'react-router'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { sellerPath } from '@/shared/config/sites'

/** Complaints from customers and the shop's own fault record are two views of one concern: orders that went wrong. */
export function OrderCaseTabs() {
  return (
    <PageTabs
      label="Trả hàng và hoàn tiền"
      tabs={[
        { id: 'cases', label: 'Khiếu nại của khách', to: sellerPath('/order-cases') },
        { id: 'performance', label: 'Hiệu suất và điểm phạt', to: sellerPath('/performance') },
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
        { id: 'dishes', label: 'Món ăn', to: sellerPath('/menu'), active: pathname === sellerPath('/menu') || pathname === sellerPath('/menu/new') },
        { id: 'options', label: 'Nhóm lựa chọn', to: sellerPath('/menu/options') },
        { id: 'category-cases', label: 'Món sai ngành', to: sellerPath('/category-cases') },
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
        { id: 'statistics', label: 'Thống kê', to: sellerPath('/statistics') },
        { id: 'earnings', label: 'Thu nhập và sao kê', to: sellerPath('/earnings') },
      ]}
    />
  )
}
