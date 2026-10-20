import { ClipboardListIcon, MessageCircleIcon, StoreIcon, UserRoundIcon, UtensilsIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AcceptingOrdersSwitch } from '@/features/accepting-orders'
import { WorkspaceShell, type AccountLink, type ExtraPage, type FooterLink, type NavParent } from './workspace'
import { sellerPath } from '@/shared/config/sites'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = [sellerPath('/account')]

/** A closing shop keeps what it needs to finish: orders, cases, earnings, support (close-shop.md). */
const WHILE_CLOSING = [sellerPath('/closing'), sellerPath('/orders'), sellerPath('/order-cases'), sellerPath('/performance'), sellerPath('/earnings'), sellerPath('/support-tickets'), sellerPath('/help'), sellerPath('/account'), sellerPath('/chat')]

/** The seller's menu (owner's list, web-workspace-layout.md 7.5). Trang chủ is the breadcrumb root, not a row. */
const APPROVED_NAV: NavParent[] = [
  {
    key: 'orders',
    label: 'Quản lý đơn hàng',
    icon: ClipboardListIcon,
    children: [
      { to: sellerPath('/orders'), label: 'Tất cả' },
      { to: sellerPath('/orders/cancelled'), label: 'Đơn hủy' },
      { to: sellerPath('/order-cases'), label: 'Trả hàng/hoàn tiền' },
      { to: sellerPath('/shipping'), label: 'Cài đặt vận chuyển' },
    ],
  },
  {
    key: 'menu',
    label: 'Quản lý thực đơn',
    icon: UtensilsIcon,
    children: [
      { to: sellerPath('/menu'), label: 'Tất cả món ăn' },
      { to: sellerPath('/menu/new'), label: 'Thêm món ăn' },
    ],
  },
  {
    key: 'care',
    label: 'Chăm sóc khách hàng',
    icon: MessageCircleIcon,
    children: [
      { to: sellerPath('/chat'), label: 'Quản lý chat' },
      { to: sellerPath('/reviews'), label: 'Quản lý đánh giá' },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    icon: WalletIcon,
    children: [
      { to: sellerPath('/statistics'), label: 'Doanh thu' },
      { to: sellerPath('/bank-account'), label: 'Tài khoản ngân hàng' },
    ],
  },
]

/** Pages without a row in the menu: they sit under a parent in the breadcrumb, or are reached from the account menu or the footer. */
const EXTRAS: ExtraPage[] = [
  // Tabs of a menu row: the row stays selected and is the breadcrumb.
  { to: sellerPath('/performance'), label: 'Hiệu suất và điểm phạt', under: sellerPath('/order-cases') },
  { to: sellerPath('/category-cases'), label: 'Món sai ngành', under: sellerPath('/menu') },
  { to: sellerPath('/earnings'), label: 'Thu nhập và sao kê', under: sellerPath('/statistics') },
  { to: sellerPath('/shop'), label: 'Hồ sơ cửa hàng' },
  { to: sellerPath('/account'), label: 'Tài khoản và bảo mật' },
  { to: sellerPath('/notification-settings'), label: 'Cài đặt thông báo' },
  { to: sellerPath('/help'), label: 'Trung tâm trợ giúp' },
  { to: sellerPath('/support-tickets'), label: 'Liên hệ hỗ trợ' },
  { to: sellerPath('/closing'), label: 'Đóng cửa hàng' },
]

const ACCOUNT: AccountLink[] = [
  { to: sellerPath('/shop'), label: 'Hồ sơ cửa hàng' },
  { to: sellerPath('/account'), label: 'Tài khoản và bảo mật' },
  { to: sellerPath('/notification-settings'), label: 'Cài đặt thông báo' },
  { to: sellerPath('/help'), label: 'Trung tâm trợ giúp' },
  { to: sellerPath('/support-tickets'), label: 'Liên hệ hỗ trợ' },
]

const FOOTER: FooterLink[] = [
  { to: sellerPath('/help'), label: 'Hỗ trợ' },
  { to: '/legal/SELLER_TERMS', label: 'Điều khoản người bán' },
  { to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' },
]

/** While the shop is not approved or is closing, the menu is a short list of single pages. */
const CLOSING_NAV: NavParent[] = [
  { key: 'closing', label: 'Đóng cửa hàng', icon: StoreIcon, to: sellerPath('/closing') },
  { key: 'orders', label: 'Đơn hàng', icon: ClipboardListIcon, to: sellerPath('/orders') },
  { key: 'cases', label: 'Trả hàng/hoàn tiền', icon: ClipboardListIcon, to: sellerPath('/order-cases') },
  { key: 'earnings', label: 'Thu nhập', icon: WalletIcon, to: sellerPath('/earnings') },
  { key: 'support', label: 'Liên hệ hỗ trợ', icon: MessageCircleIcon, to: sellerPath('/support-tickets') },
  { key: 'account', label: 'Tài khoản', icon: UserRoundIcon, to: sellerPath('/account') },
]
const SETUP_NAV: NavParent[] = [
  { key: 'open-shop', label: 'Mở cửa hàng', icon: StoreIcon, to: '/focus/open-shop' },
  { key: 'account', label: 'Tài khoản', icon: UserRoundIcon, to: sellerPath('/account') },
]

/** The seller area: until the shop is approved, everything leads to the open-shop page. */
export function SellerLayout() {
  const shop = useShop()
  const { pathname } = useLocation()
  const status = shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const closing = status === 'CLOSING' || status === 'CLOSED'

  if (shop.data && closing && !WHILE_CLOSING.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <Navigate to={sellerPath('/closing')} replace />
  }
  if (shop.data && !approved && !closing && !OPEN_BEFORE_APPROVAL.includes(pathname)) {
    return <Navigate to="/focus/open-shop" replace />
  }
  return (
    <WorkspaceShell
      area="Kênh người bán"
      homePath={sellerPath()}
      nav={approved ? APPROVED_NAV : closing ? CLOSING_NAV : SETUP_NAV}
      extras={EXTRAS}
      account={ACCOUNT}
      footerLinks={FOOTER}
      loginPath={sellerPath('/login')}
      storageKey="bonbon.nav.seller"
      headerExtra={approved ? <AcceptingOrdersSwitch /> : null}
      orderPath={() => sellerPath('/orders')}
    />
  )
}
