import { ClipboardListIcon, LifeBuoyIcon, MessageCircleIcon, SettingsIcon, ShieldCheckIcon, ShoppingBagIcon, StoreIcon, TicketPercentIcon, UserRoundIcon, UsersRoundIcon, UtensilsIcon, WalletIcon } from 'lucide-react'
import { Navigate, useLocation } from 'react-router'
import { useSession, type Session } from '@/entities/session'
import { shopStatus, useShop } from '@/entities/shop'
import { TeamSwitcher } from './team-switcher'
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

/** The team console of a main account (seller-team): members, roles, linked shops. */
const TEAM_NAV: NavParent[] = [
  { key: 'members', label: t('Thành viên'), icon: UsersRoundIcon, to: merchantPath('/team') },
  { key: 'roles', label: t('Vai trò và quyền'), icon: ShieldCheckIcon, to: merchantPath('/team/roles') },
  { key: 'shops', label: t('Cửa hàng liên kết'), icon: StoreIcon, to: merchantPath('/team/shops') },
]
const TEAM_SPACE: Space = { key: 'team', label: t('Quản lý nhóm'), icon: UsersRoundIcon, nav: TEAM_NAV }

/** What each page needs; a member only sees the pages its role on this shop opens. */
const NEEDS: Record<string, string> = {
  [merchantPath('/orders')]: 'order:read',
  [merchantPath('/orders/cancelled')]: 'order:read',
  [merchantPath('/order-cases')]: 'order:read',
  [merchantPath('/menu')]: 'vendor:read',
  [merchantPath('/menu/new')]: 'vendor:write',
  [merchantPath('/vouchers')]: 'voucher:read',
  [merchantPath('/chat')]: 'conversation:read',
  [merchantPath('/reviews')]: 'vendor:read',
  [merchantPath('/statistics')]: 'stats:read',
  [merchantPath('/earnings')]: 'earnings:read',
  [merchantPath('/shop')]: 'vendor:read',
  [merchantPath('/shipping')]: 'vendor:read',
  [merchantPath('/bank-account')]: 'vendor:read',
}
/** The person's own pages: a main account or member is not that person, so they are hidden (the server refuses them too). */
const PERSONAL = [merchantPath('/account'), merchantPath('/notification-settings'), merchantPath('/support-tickets')]

function forTeam(nav: NavParent[], session: Session): NavParent[] {
  const can = (to: string) => !PERSONAL.includes(to) && (!NEEDS[to] || session.permissions.has(NEEDS[to]))
  return nav
    .map((p) => (p.children ? { ...p, children: p.children.filter((c) => can(c.to)) } : p))
    .filter((p) => (p.children ? p.children.length > 0 : !p.to || can(p.to)))
}

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
  const { session } = useSession()
  const team = session?.team
  const { pathname } = useLocation()
  // a team session knows its shop's status from the sign-in; the shop record needs vendor:read, which a member may not have
  const shop = useShop(!team)
  const teamShop = team?.shops.find((s) => s.vendorId === team.shopId)
  const status = team ? (teamShop?.status as ReturnType<typeof shopStatus>) : shopStatus(shop.data)
  const approved = status === 'APPROVED'
  const sellingFocus = useSellingFocus()
  const focus = sellingFocus && approved && !team

  if (team && session) {
    const console = team.shopId === null
    const inTeam = pathname === merchantPath('/team') || pathname.startsWith(merchantPath('/team/'))
    if (console && !inTeam) return <Navigate to={merchantPath('/team')} replace />
    if (!console && team.kind === 'MEMBER' && inTeam) return <Navigate to={merchantPath()} replace />
    const selling = forTeam(SELLING_NAV, session)
    const settings = forTeam(SETTINGS_NAV, session)
    // the dashboard reads everything; a member starts on the first page its role opens
    const firstPage = selling[0]?.to ?? selling[0]?.children?.[0]?.to ?? settings[0]?.children?.[0]?.to
    if (!console && team.kind === 'MEMBER' && pathname === merchantPath() && firstPage) return <Navigate to={firstPage} replace />
    const spaces: Space[] = console
      ? [TEAM_SPACE]
      : [
          { key: 'selling', label: t('Kênh bán hàng'), icon: ShoppingBagIcon, nav: selling, extras: SELLING_EXTRAS },
          ...(settings.length ? [{ key: 'settings', label: t('Cài đặt'), icon: SettingsIcon, nav: settings }] : []),
          ...(team.kind === 'MAIN_ACCOUNT' ? [TEAM_SPACE] : []),
        ]
    return (
      <WorkspaceShell
        area={team.kind === 'MAIN_ACCOUNT' ? t('Tài khoản chính') : t('Kênh người bán')}
        homePath={console ? merchantPath('/team') : merchantPath()}
        spaces={spaces}
        account={[]}
        footerLinks={FOOTER}
        loginPath={merchantPath('/login')}
        headerExtra={
          <>
            <TeamSwitcher />
            {!console && approved && session.permissions.has('vendor:write') ? <AcceptingOrdersSwitch /> : null}
          </>
        }
        orderPath={() => merchantPath('/orders')}
      />
    )
  }
  const closing = status === 'CLOSING' || status === 'CLOSED'

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
