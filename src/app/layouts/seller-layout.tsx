import { ClipboardListIcon, MessageSquareIcon, StoreIcon, UtensilsCrossedIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AreaLayout, type NavGroup } from './area-layout'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = ['/seller/open-shop', '/seller/account']

/** The seller area: until the shop is approved, everything leads to the open-shop page. */
export function SellerLayout() {
  const shop = useShop()
  const { pathname } = useLocation()
  const status = shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const nav: NavGroup[] = approved
    ? [
        { items: [{ to: '/seller', label: 'Tổng quan' }] },
        { title: 'Quản lý đơn hàng', icon: <ClipboardListIcon />, items: [{ to: '/seller/orders', label: 'Tất cả đơn hàng' }] },
        { title: 'Quản lý thực đơn', icon: <UtensilsCrossedIcon />, items: [{ to: '/seller/menu', label: 'Thực đơn & nhóm lựa chọn' }] },
        { title: 'Tài chính', icon: <WalletIcon />, items: [{ to: '/seller/earnings', label: 'Thu nhập' }] },
        { title: 'Chăm sóc khách hàng', icon: <MessageSquareIcon />, items: [{ to: '/seller/reviews', label: 'Quản lý đánh giá' }] },
        {
          title: 'Cửa hàng',
          icon: <StoreIcon />,
          items: [
            { to: '/seller/shop', label: 'Hồ sơ cửa hàng' },
            { to: '/seller/account', label: 'Tài khoản' },
          ],
        },
      ]
    : [
        {
          items: [
            { to: '/seller/open-shop', label: status === 'PENDING' ? 'Hồ sơ cửa hàng' : 'Mở cửa hàng' },
            { to: '/seller/account', label: 'Tài khoản' },
          ],
        },
      ]

  if (shop.data && !approved && !OPEN_BEFORE_APPROVAL.includes(pathname)) {
    return <Navigate to="/seller/open-shop" replace />
  }
  return <AreaLayout title="Kênh người bán" nav={nav} loginPath="/seller/login" />
}
