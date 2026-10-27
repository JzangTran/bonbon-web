import { ClipboardListIcon, MessageCircleIcon, StoreIcon, UserRoundIcon, UtensilsIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AcceptingOrdersSwitch } from '@/features/accepting-orders'
import { WorkspaceShell, type AccountLink, type ExtraPage, type FooterLink, type NavParent } from './workspace'
import { merchantPath } from '@/shared/config/sites'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = [merchantPath('/account')]

/** A closing shop keeps what it needs to finish: orders, cases, earnings, support (close-shop.md). */
const WHILE_CLOSING = [merchantPath('/closing'), merchantPath('/orders'), merchantPath('/order-cases'), merchantPath('/performance'), merchantPath('/earnings'), merchantPath('/support-tickets'), merchantPath('/help'), merchantPath('/account'), merchantPath('/chat')]

/** The seller's menu (owner's list, web-workspace-layout.md 7.5). Trang chủ is the breadcrumb root, not a row. */
const APPROVED_NAV: NavParent[] = [
  {
    key: 'orders',
    label: 'Quản lý đơn hàng',
    icon: ClipboardListIcon,
    children: [
      { to: merchantPath('/orders'), label: 'Tất cả' },
      { to: merchantPath('/orders/cancelled'), label: 'Đơn hủy' },
      { to: merchantPath('/order-cases'), label: 'Trả hàng/hoàn tiền' },
      { to: merchantPath('/shipping'), label: 'Cài đặt vận chuyển' },
    ],
  },
  {
    key: 'menu',
    label: 'Quản lý thực đơn',
    icon: UtensilsIcon,
    children: [
      { to: merchantPath('/menu'), label: 'Tất cả món ăn' },
      { to: merchantPath('/menu/new'), label: 'Thêm món ăn' },
    ],
  },
  {
    key: 'care',
    label: 'Chăm sóc khách hàng',
    icon: MessageCircleIcon,
    children: [
      { to: merchantPath('/chat'), label: 'Quản lý chat' },
      { to: merchantPath('/reviews'), label: 'Quản lý đánh giá' },
    ],
  },
  {
    key: 'finance',
    label: 'Tài chính',
    icon: WalletIcon,
    children: [
      { to: merchantPath('/statistics'), label: 'Doanh thu' },
      { to: merchantPath('/bank-account'), label: 'Tài khoản ngân hàng' },
    ],
  },
]

/** Pages without a row in the menu: they sit under a parent in the breadcrumb, or are reached from the account menu or the footer. */
const EXTRAS: ExtraPage[] = [
  // Tabs of a menu row: the row stays selected and is the breadcrumb.
  { to: merchantPath('/performance'), label: 'Hiệu suất và điểm phạt', under: merchantPath('/order-cases') },
  { to: merchantPath('/category-cases'), label: 'Món sai ngành', under: merchantPath('/menu') },
  { to: merchantPath('/earnings'), label: 'Thu nhập và sao kê', under: merchantPath('/statistics') },
  { to: merchantPath('/shop'), label: 'Hồ sơ cửa hàng' },
  { to: merchantPath('/account'), label: 'Tài khoản và bảo mật' },
  { to: merchantPath('/notification-settings'), label: 'Cài đặt thông báo' },
  { to: merchantPath('/help'), label: 'Trung tâm trợ giúp' },
  { to: merchantPath('/support-tickets'), label: 'Liên hệ hỗ trợ' },
  { to: merchantPath('/closing'), label: 'Đóng cửa hàng' },
]

const ACCOUNT: AccountLink[] = [
  { to: merchantPath('/shop'), label: 'Hồ sơ cửa hàng' },
  { to: merchantPath('/account'), label: 'Tài khoản và bảo mật' },
  { to: merchantPath('/notification-settings'), label: 'Cài đặt thông báo' },
  { to: merchantPath('/help'), label: 'Trung tâm trợ giúp' },
  { to: merchantPath('/support-tickets'), label: 'Liên hệ hỗ trợ' },
]

const FOOTER: FooterLink[] = [
  { to: merchantPath('/help'), label: 'Hỗ trợ' },
  { to: '/legal/SELLER_TERMS', label: 'Điều khoản người bán' },
  { to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' },
]

/** While the shop is not approved or is closing, the menu is a short list of single pages. */
const CLOSING_NAV: NavParent[] = [
  { key: 'closing', label: 'Đóng cửa hàng', icon: StoreIcon, to: merchantPath('/closing') },
  { key: 'orders', label: 'Đơn hàng', icon: ClipboardListIcon, to: merchantPath('/orders') },
  { key: 'cases', label: 'Trả hàng/hoàn tiền', icon: ClipboardListIcon, to: merchantPath('/order-cases') },
  { key: 'earnings', label: 'Thu nhập', icon: WalletIcon, to: merchantPath('/earnings') },
  { key: 'support', label: 'Liên hệ hỗ trợ', icon: MessageCircleIcon, to: merchantPath('/support-tickets') },
  { key: 'account', label: 'Tài khoản', icon: UserRoundIcon, to: merchantPath('/account') },
]
const SETUP_NAV: NavParent[] = [
  { key: 'open-shop', label: 'Mở cửa hàng', icon: StoreIcon, to: '/focus/open-shop' },
  { key: 'account', label: 'Tài khoản', icon: UserRoundIcon, to: merchantPath('/account') },
]

/** The seller area: until the shop is approved, everything leads to the open-shop page. */
export function SellerLayout() {
  const shop = useShop()
  const { pathname } = useLocation()
  const status = shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const closing = status === 'CLOSING' || status === 'CLOSED'

  if (shop.data && closing && !WHILE_CLOSING.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <Navigate to={merchantPath('/closing')} replace />
  }
  if (shop.data && !approved && !closing && !OPEN_BEFORE_APPROVAL.includes(pathname)) {
    return <Navigate to="/focus/open-shop" replace />
  }
  return (
    <WorkspaceShell
      area="Kênh người bán"
      homePath={merchantPath()}
      nav={approved ? APPROVED_NAV : closing ? CLOSING_NAV : SETUP_NAV}
      extras={EXTRAS}
      account={ACCOUNT}
      footerLinks={FOOTER}
      loginPath={merchantPath('/login')}
      headerExtra={approved ? <AcceptingOrdersSwitch /> : null}
      orderPath={() => merchantPath('/orders')}
    />
  )
}
