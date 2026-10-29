import { t } from '@/shared/i18n'
import { useLocation } from 'react-router'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { merchantPath } from '@/shared/config/sites'

/** Complaints from customers and the shop's own fault record are two views of one concern: orders that went wrong. */
export function OrderCaseTabs() {
  return (
    <PageTabs
      label={t('Trả hàng và hoàn tiền')}
      tabs={[
        { id: 'cases', label: t('Khiếu nại của khách'), to: merchantPath('/order-cases') },
        { id: 'performance', label: t('Hiệu suất và điểm phạt'), to: merchantPath('/performance') },
      ]}
    />
  )
}

/** The menu: dishes (and the form to add one), the option groups they offer, and the dishes flagged under the wrong category. */
export function MenuTabs() {
  const { pathname } = useLocation()
  return (
    <PageTabs
      label={t('Thực đơn')}
      tabs={[
        { id: 'dishes', label: t('Món ăn'), to: merchantPath('/menu'), active: pathname === merchantPath('/menu') || pathname === merchantPath('/menu/new') },
        { id: 'options', label: t('Nhóm lựa chọn'), to: merchantPath('/menu/options') },
        { id: 'category-cases', label: t('Món sai ngành'), to: merchantPath('/category-cases') },
      ]}
    />
  )
}

/** Revenue statistics and the earnings statement answer the same question: how much did the shop make. */
export function FinanceTabs() {
  return (
    <PageTabs
      label={t('Doanh thu')}
      tabs={[
        { id: 'statistics', label: t('Thống kê'), to: merchantPath('/statistics') },
        { id: 'earnings', label: t('Thu nhập và sao kê'), to: merchantPath('/earnings') },
      ]}
    />
  )
}
