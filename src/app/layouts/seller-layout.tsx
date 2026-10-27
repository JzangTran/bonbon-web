import { ClipboardListIcon, LifeBuoyIcon, MessageCircleIcon, SettingsIcon, ShoppingBagIcon, StoreIcon, UserRoundIcon, UtensilsIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AcceptingOrdersSwitch } from '@/features/accepting-orders'
import { WorkspaceShell, type AccountLink, type ExtraPage, type FooterLink, type NavParent, type Space } from './workspace'
import { merchantPath, siteUrl } from '@/shared/config/sites'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = [merchantPath('/account')]

/** A closing shop keeps what it needs to finish: orders, cases, earnings, support (close-shop.md). */
const WHILE_CLOSING = [merchantPath('/closing'), merchantPath('/orders'), merchantPath('/order-cases'), merchantPath('/performance'), merchantPath('/earnings'), merchantPath('/support-tickets'), merchantPath('/account'), merchantPath('/chat')]

/** The selling channel: everything about orders, the menu, customers and money (owner's list, web-workspace-layout.md 7.5). */
const SELLING_NAV: NavParent[] = [
  {
    key: 'orders',
    label: 'Quản lý đơn hàng',
    icon: ClipboardListIcon,
    children: [
      { to: merchantPath('/orders'), label: 'Tất cả' },
      { to: merchantPath('/orders/cancelled'), label: 'Đơn hủy' },
      { to: merchantPath('/order-cases'), label: 'Trả hàng/hoàn tiền' },
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
      { to: merchantPath('/earnings'), label: 'Thu nhập và sao kê' },
    ],
  },
]

/** Tabs of a menu row: the row stays selected and is the breadcrumb. */
const SELLING_EXTRAS: ExtraPage[] = [
  { to: merchantPath('/performance'), label: 'Hiệu suất và điểm phạt', under: merchantPath('/order-cases') },
  { to: merchantPath('/category-cases'), label: 'Món sai ngành', under: merchantPath('/menu') },
]

/** Settings: how the shop is set up, the person's account and security, and their own support requests. Nothing about selling day to day. */
const SETTINGS_NAV: NavParent[] = [
  {
    key: 'shop',
    label: 'Cửa hàng',
    icon: StoreIcon,
    children: [
      { to: merchantPath('/shop'), label: 'Hồ sơ cửa hàng' },
      { to: merchantPath('/shipping'), label: 'Cài đặt vận chuyển' },
      { to: merchantPath('/bank-account'), label: 'Tài khoản ngân hàng' },
    ],
  },
  {
    key: 'account',
    label: 'Tài khoản',
    icon: UserRoundIcon,
    children: [
      { to: merchantPath('/account'), label: 'Tài khoản và bảo mật' },
      { to: merchantPath('/notification-settings'), label: 'Cài đặt thông báo' },
    ],
  },
  {
    key: 'support',
    label: 'Hỗ trợ',
    icon: LifeBuoyIcon,
    children: [{ to: merchantPath('/support-tickets'), label: 'Yêu cầu hỗ trợ của tôi' }],
  },
]

const SPACES: Space[] = [
  { key: 'selling', label: 'Kênh bán hàng', icon: ShoppingBagIcon, nav: SELLING_NAV, extras: SELLING_EXTRAS },
  { key: 'settings', label: 'Cài đặt', icon: SettingsIcon, nav: SETTINGS_NAV },
]

const ACCOUNT: AccountLink[] = [
  { to: merchantPath('/shop'), label: 'Cài đặt' },
  { to: siteUrl('help'), label: 'Trung tâm trợ giúp', external: true },
  { to: siteUrl('help', '/lien-he'), label: 'Liên hệ hỗ trợ', external: true },
]

const FOOTER: FooterLink[] = [
  { to: siteUrl('help'), label: 'Trợ giúp', external: true },
  { to: siteUrl('help', '/phap-ly/SELLER_TERMS'), label: 'Điều khoản người bán', external: true },
  { to: siteUrl('help', '/phap-ly/PRIVACY_POLICY'), label: 'Chính sách riêng tư', external: true },
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
      spaces={approved ? SPACES : [{ key: 'only', label: 'Kênh người bán', icon: StoreIcon, nav: closing ? CLOSING_NAV : SETUP_NAV }]}
      account={ACCOUNT}
      footerLinks={FOOTER}
      loginPath={merchantPath('/login')}
      headerExtra={approved ? <AcceptingOrdersSwitch /> : null}
      orderPath={() => merchantPath('/orders')}
    />
  )
}
