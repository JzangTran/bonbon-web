import { ClipboardListIcon, MessageCircleIcon, StoreIcon, UserRoundIcon, UtensilsIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AcceptingOrdersSwitch } from '@/features/accepting-orders'
import { WorkspaceShell, type AccountLink, type ExtraPage, type FooterLink, type NavParent } from './workspace'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = ['/seller/account']

/** A closing shop keeps what it needs to finish: orders, cases, earnings, support (close-shop.md). */
const WHILE_CLOSING = ['/seller/closing', '/seller/orders', '/seller/order-cases', '/seller/performance', '/seller/earnings', '/seller/support-tickets', '/seller/help', '/seller/account', '/seller/chat']

/** The seller's menu (owner's list, web-workspace-layout.md 7.5). Trang chủ is the breadcrumb root, not a row. */
const APPROVED_NAV: NavParent[] = [
  {
    key: 'orders',
    label: 'Quản lý đơn hàng',
    icon: ClipboardListIcon,
    children: [
      { to: '/seller/orders', label: 'Tất cả' },
      { to: '/seller/orders/cancelled', label: 'Đơn hủy' },
      { to: '/seller/order-cases', label: 'Trả hàng/hoàn tiền' },
      { to: '/seller/shipping', label: 'Cài đặt vận chuyển' },
    ],
  },
  {
    key: 'menu',
    label: 'Quản lý thực đơn',
    icon: UtensilsIcon,
    children: [
      { to: '/seller/menu', label: 'Tất cả món ăn' },
      { to: '/seller/menu/new', label: 'Thêm món ăn' },
    ],
  },
  {
    key: 'care',
    label: 'Chăm sóc khách hàng',
    icon: MessageCircleIcon,
    children: [
      { to: '/seller/chat', label: 'Quản lý chat' },
      { to: '/seller/reviews', label: 'Quản lý đánh giá' },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    icon: WalletIcon,
    children: [
      { to: '/seller/statistics', label: 'Doanh thu' },
      { to: '/seller/bank-account', label: 'Tài khoản ngân hàng' },
    ],
  },
]

/** Pages without a row in the menu: they sit under a parent in the breadcrumb, or are reached from the account menu or the footer. */
const EXTRAS: ExtraPage[] = [
  // Tabs of a menu row: the row stays selected and is the breadcrumb.
  { to: '/seller/performance', label: 'Hiệu suất và điểm phạt', under: '/seller/order-cases' },
  { to: '/seller/category-cases', label: 'Món sai ngành', under: '/seller/menu' },
  { to: '/seller/earnings', label: 'Thu nhập và sao kê', under: '/seller/statistics' },
  { to: '/seller/shop', label: 'Hồ sơ cửa hàng' },
  { to: '/seller/account', label: 'Tài khoản và bảo mật' },
  { to: '/seller/notification-settings', label: 'Cài đặt thông báo' },
  { to: '/seller/help', label: 'Trung tâm trợ giúp' },
  { to: '/seller/support-tickets', label: 'Liên hệ hỗ trợ' },
  { to: '/seller/closing', label: 'Đóng cửa hàng' },
]

const ACCOUNT: AccountLink[] = [
  { to: '/seller/shop', label: 'Hồ sơ cửa hàng' },
  { to: '/seller/account', label: 'Tài khoản và bảo mật' },
  { to: '/seller/notification-settings', label: 'Cài đặt thông báo' },
  { to: '/seller/help', label: 'Trung tâm trợ giúp' },
  { to: '/seller/support-tickets', label: 'Liên hệ hỗ trợ' },
]

const FOOTER: FooterLink[] = [
  { to: '/seller/help', label: 'Hỗ trợ' },
  { to: '/legal/SELLER_TERMS', label: 'Điều khoản người bán' },
  { to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' },
]

/** While the shop is not approved or is closing, the menu is a short list of single pages. */
const CLOSING_NAV: NavParent[] = [
  { key: 'closing', label: 'Đóng cửa hàng', icon: StoreIcon, to: '/seller/closing' },
  { key: 'orders', label: 'Đơn hàng', icon: ClipboardListIcon, to: '/seller/orders' },
  { key: 'cases', label: 'Trả hàng/hoàn tiền', icon: ClipboardListIcon, to: '/seller/order-cases' },
  { key: 'earnings', label: 'Thu nhập', icon: WalletIcon, to: '/seller/earnings' },
  { key: 'support', label: 'Liên hệ hỗ trợ', icon: MessageCircleIcon, to: '/seller/support-tickets' },
  { key: 'account', label: 'Tài khoản', icon: UserRoundIcon, to: '/seller/account' },
]
const SETUP_NAV: NavParent[] = [
  { key: 'open-shop', label: 'Mở cửa hàng', icon: StoreIcon, to: '/focus/open-shop' },
  { key: 'account', label: 'Tài khoản', icon: UserRoundIcon, to: '/seller/account' },
]

/** The seller area: until the shop is approved, everything leads to the open-shop page. */
export function SellerLayout() {
  const shop = useShop()
  const { pathname } = useLocation()
  const status = shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const closing = status === 'CLOSING' || status === 'CLOSED'

  if (shop.data && closing && !WHILE_CLOSING.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <Navigate to="/seller/closing" replace />
  }
  if (shop.data && !approved && !closing && !OPEN_BEFORE_APPROVAL.includes(pathname)) {
    return <Navigate to="/focus/open-shop" replace />
  }
  return (
    <WorkspaceShell
      area="Kênh người bán"
      homePath="/seller"
      nav={approved ? APPROVED_NAV : closing ? CLOSING_NAV : SETUP_NAV}
      extras={EXTRAS}
      account={ACCOUNT}
      footerLinks={FOOTER}
      loginPath="/seller/login"
      storageKey="bonbon.nav.seller"
      headerExtra={approved ? <AcceptingOrdersSwitch /> : null}
      orderPath={() => '/seller/orders'}
    />
  )
}
