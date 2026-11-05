import { ClipboardListIcon, LifeBuoyIcon, MessageCircleIcon, SettingsIcon, ShoppingBagIcon, StoreIcon, TicketPercentIcon, UserRoundIcon, UtensilsIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { AcceptingOrdersSwitch } from '@/features/accepting-orders'
import { SellingFocusToggle, useSellingFocus } from '@/features/selling-focus'
import { WorkspaceShell, type AccountLink, type ExtraPage, type FooterLink, type NavParent, type Space } from './workspace'
import { merchantPath, siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/** Pages a seller without an approved shop may open (open-shop.md: selling features stay blocked until then). */
const OPEN_BEFORE_APPROVAL = [merchantPath('/account')]

/** A closing shop keeps what it needs to finish: orders, cases, earnings, support (close-shop.md). */
const WHILE_CLOSING = [merchantPath('/closing'), merchantPath('/orders'), merchantPath('/order-cases'), merchantPath('/performance'), merchantPath('/earnings'), merchantPath('/support-tickets'), merchantPath('/account'), merchantPath('/chat')]

/** The selling channel: everything about orders, the menu, customers and money (owner's list, web-workspace-layout.md 7.5). */
const SELLING_NAV: NavParent[] = [
  {
    key: 'orders',
    label: t('Quản lý đơn hàng'),
    icon: ClipboardListIcon,
    children: [
      { to: merchantPath('/orders'), label: t('Tất cả') },
      { to: merchantPath('/orders/cancelled'), label: t('Đơn hủy') },
      { to: merchantPath('/order-cases'), label: t('Trả hàng/hoàn tiền') },
    ],
  },
  {
    key: 'menu',
    label: t('Quản lý thực đơn'),
    icon: UtensilsIcon,
    children: [
      { to: merchantPath('/menu'), label: t('Tất cả món ăn') },
      { to: merchantPath('/menu/new'), label: t('Thêm món ăn') },
    ],
  },
  { key: 'vouchers', label: t('Voucher của quán'), icon: TicketPercentIcon, to: merchantPath('/vouchers') },
  {
    key: 'care',
    label: t('Chăm sóc khách hàng'),
    icon: MessageCircleIcon,
    children: [
      { to: merchantPath('/chat'), label: t('Quản lý chat') },
      { to: merchantPath('/reviews'), label: t('Quản lý đánh giá') },
    ],
  },
  {
    key: 'finance',
    label: t('Tài chính'),
    icon: WalletIcon,
    children: [
      { to: merchantPath('/statistics'), label: t('Doanh thu') },
      { to: merchantPath('/earnings'), label: t('Thu nhập và sao kê') },
    ],
  },
]

/** Tabs of a menu row: the row stays selected and is the breadcrumb. */
const SELLING_EXTRAS: ExtraPage[] = [
  { to: merchantPath('/performance'), label: t('Hiệu suất và điểm phạt'), under: merchantPath('/order-cases') },
  { to: merchantPath('/category-cases'), label: t('Món sai ngành'), under: merchantPath('/menu') },
]

/** Settings: how the shop is set up, the person's account and security, and their own support requests. Nothing about selling day to day. */
const SETTINGS_NAV: NavParent[] = [
  {
    key: 'shop',
    label: t('Cửa hàng'),
    icon: StoreIcon,
    children: [
      { to: merchantPath('/shop'), label: t('Hồ sơ cửa hàng') },
      { to: merchantPath('/shipping'), label: t('Cài đặt vận chuyển') },
      { to: merchantPath('/bank-account'), label: t('Tài khoản ngân hàng') },
    ],
  },
  {
    key: 'account',
    label: t('Tài khoản'),
    icon: UserRoundIcon,
    children: [
      { to: merchantPath('/account'), label: t('Tài khoản và bảo mật') },
      { to: merchantPath('/notification-settings'), label: t('Cài đặt thông báo') },
    ],
  },
  {
    key: 'support',
    label: t('Hỗ trợ'),
    icon: LifeBuoyIcon,
    children: [{ to: merchantPath('/support-tickets'), label: t('Yêu cầu hỗ trợ của tôi') }],
  },
]

const SPACES: Space[] = [
  { key: 'selling', label: t('Kênh bán hàng'), icon: ShoppingBagIcon, nav: SELLING_NAV, extras: SELLING_EXTRAS },
  { key: 'settings', label: t('Cài đặt'), icon: SettingsIcon, nav: SETTINGS_NAV, extras: [{ to: merchantPath('/support-tickets/new'), label: t('Gửi phiếu hỗ trợ'), under: merchantPath('/support-tickets') }] },
]

const ACCOUNT: AccountLink[] = [
  { to: merchantPath('/shop'), label: t('Cài đặt') },
  { to: siteUrl('help'), label: t('Trung tâm trợ giúp'), external: true },
  { to: siteUrl('help', '/contact'), label: t('Liên hệ hỗ trợ'), external: true },
]

const FOOTER: FooterLink[] = [
  { to: siteUrl('help'), label: t('Trợ giúp'), external: true },
  { to: siteUrl('help', '/legal/SELLER_TERMS'), label: t('Điều khoản người bán'), external: true },
  { to: siteUrl('help', '/legal/PRIVACY_POLICY'), label: t('Chính sách riêng tư'), external: true },
]

/**
 * "Bán hàng tập trung" (selling focus): only what a busy service needs, each one page. Orders with their New / In progress /
 * Done tabs, chat with customers, and the menu to mark dishes and options sold out. Everything else (dashboard, statistics,
 * money, reviews, settings) is out of the way until the seller leaves the mode.
 */
const FOCUS_NAV: NavParent[] = [
  { key: 'orders', label: t('Đơn hàng'), icon: ClipboardListIcon, to: merchantPath('/orders') },
  { key: 'chat', label: t('Tin nhắn'), icon: MessageCircleIcon, to: merchantPath('/chat') },
  { key: 'menu', label: t('Còn/hết món'), icon: UtensilsIcon, to: merchantPath('/menu') },
]
const FOCUS_EXTRAS: ExtraPage[] = [{ to: merchantPath('/menu/options'), label: t('Tùy chọn món'), under: merchantPath('/menu') }]
const FOCUS_PAGES = [merchantPath('/orders'), merchantPath('/chat'), merchantPath('/menu'), merchantPath('/menu/options')]

/** While the shop is not approved or is closing, the menu is a short list of single pages. */
const CLOSING_NAV: NavParent[] = [
  { key: 'closing', label: t('Đóng cửa hàng'), icon: StoreIcon, to: merchantPath('/closing') },
  { key: 'orders', label: t('Đơn hàng'), icon: ClipboardListIcon, to: merchantPath('/orders') },
  { key: 'cases', label: t('Trả hàng/hoàn tiền'), icon: ClipboardListIcon, to: merchantPath('/order-cases') },
  { key: 'earnings', label: t('Thu nhập'), icon: WalletIcon, to: merchantPath('/earnings') },
  { key: 'support', label: t('Liên hệ hỗ trợ'), icon: MessageCircleIcon, to: merchantPath('/support-tickets') },
  { key: 'account', label: t('Tài khoản'), icon: UserRoundIcon, to: merchantPath('/account') },
]
const SETUP_NAV: NavParent[] = [
  { key: 'open-shop', label: t('Mở cửa hàng'), icon: StoreIcon, to: '/focus/open-shop' },
  { key: 'account', label: t('Tài khoản'), icon: UserRoundIcon, to: merchantPath('/account') },
]

/** The seller area: until the shop is approved, everything leads to the open-shop page. */
export function SellerLayout() {
  const shop = useShop()
  const { pathname } = useLocation()
  const status = shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const closing = status === 'CLOSING' || status === 'CLOSED'
  const focus = useSellingFocus() && approved

  if (shop.data && closing && !WHILE_CLOSING.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return <Navigate to={merchantPath('/closing')} replace />
  }
  if (shop.data && !approved && !closing && !OPEN_BEFORE_APPROVAL.includes(pathname)) {
    return <Navigate to="/focus/open-shop" replace />
  }
  if (focus && !FOCUS_PAGES.includes(pathname)) {
    return <Navigate to={merchantPath('/orders')} replace />
  }
  return (
    <WorkspaceShell
      area={t('Kênh người bán')}
      homePath={focus ? merchantPath('/orders') : merchantPath()}
      spaces={
        focus
          ? [{ key: 'focus', label: t('Bán hàng tập trung'), icon: ShoppingBagIcon, nav: FOCUS_NAV, extras: FOCUS_EXTRAS }]
          : approved
            ? SPACES
            : [{ key: 'only', label: t('Kênh người bán'), icon: StoreIcon, nav: closing ? CLOSING_NAV : SETUP_NAV }]
      }
      focus={focus ? { label: t('Bán hàng tập trung') } : undefined}
      account={ACCOUNT}
      footerLinks={FOOTER}
      loginPath={merchantPath('/login')}
      headerExtra={
        approved ? (
          <>
            <SellingFocusToggle />
            <AcceptingOrdersSwitch />
          </>
        ) : null
      }
      orderPath={() => merchantPath('/orders')}
    />
  )
}
