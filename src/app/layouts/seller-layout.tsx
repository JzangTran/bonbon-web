import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AreaLayout, type NavItem } from './area-layout'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = ['/seller/open-shop', '/seller/account']

/** The seller area: until the shop is approved, everything leads to the open-shop page. */
export function SellerLayout() {
  const shop = useShop()
  const { pathname } = useLocation()
  const status = shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const nav: NavItem[] = approved
    ? [
        { to: '/seller', label: 'Tổng quan' },
        { to: '/seller/menu', label: 'Thực đơn' },
        { to: '/seller/shop', label: 'Cửa hàng' },
        { to: '/seller/account', label: 'Tài khoản' },
      ]
    : [
        { to: '/seller/open-shop', label: status === 'PENDING' ? 'Hồ sơ cửa hàng' : 'Mở cửa hàng' },
        { to: '/seller/account', label: 'Tài khoản' },
      ]

  if (shop.data && !approved && !OPEN_BEFORE_APPROVAL.includes(pathname)) {
    return <Navigate to="/seller/open-shop" replace />
  }
  return <AreaLayout title="Người bán" nav={nav} loginPath="/seller/login" />
}
