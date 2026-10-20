import type { ReactNode } from 'react'
import { ChevronDownIcon, MenuIcon, SmartphoneIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { siteButtonGreen } from './buttons'
import { SITE, siteUrl } from '@/shared/config/sites'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { TextSizeControl } from '@/shared/ui/text-size-control'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

type NavLink = { label: string; to: string }
type NavItem = NavLink | { label: string; children: NavLink[] }

/** The public site's menu. Hướng dẫn opens a submenu. */
const NAV: NavItem[] = [
  {
    label: 'Hướng dẫn',
    children: [
      { label: 'Bắt đầu', to: '/huong-dan/bat-dau' },
      { label: 'Quản lý cửa hàng', to: '/huong-dan/quan-ly-cua-hang' },
    ],
  },
  { label: 'Blog', to: '/blog' },
  { label: 'Thư viện bộ nhận diện', to: '/bo-nhan-dien' },
  { label: 'Trung tâm trợ giúp', to: '/tro-giup' },
]

/** A link to a page of the public site: inside the app on the public host, a plain address from the seller and admin hosts. */
export function PublicLink({ to, className, children, onClick }: { to: string; className?: string; children: ReactNode; onClick?: () => void }) {
  if (SITE === 'public') {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    )
  }
  return (
    <a href={siteUrl('public', to)} className={className} onClick={onClick}>
      {children}
    </a>
  )
}

const linkClass = 'rounded-sm px-4 py-2.5 text-[0.9375rem] font-medium text-white outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white'

function isHere(pathname: string, to: string) {
  return pathname === to || pathname.startsWith(`${to}/`)
}

/**
 * The public site's bar (landing, content pages, legal documents): the logo, the menu (Hướng dẫn with a submenu, Blog, Thư viện bộ nhận
 * diện, Trung tâm trợ giúp) and one action. Under 1024 px the menu folds into one button. Sign-in pages have their own slimmer bar, and the
 * workspace, focus and payment pages show no site bar at all.
 */
export function SiteHeader() {
  const { session } = useSession()
  const { pathname } = useLocation()
  const area =
    session?.role === 'SELLER' ? { href: siteUrl('seller'), label: 'Vào trang người bán' }
    : session?.role === 'ADMIN' ? { href: siteUrl('admin'), label: 'Vào trang quản trị' }
    : null
  const current = (item: NavItem) => ('to' in item ? isHere(pathname, item.to) : item.children.some((c) => isHere(pathname, c.to)))

  return (
    <header className="pt-4 sm:pt-6">
      <Wrap>
        <div className="flex items-center justify-between gap-x-4 rounded-xl bg-ink py-2.5 pr-2.5 pl-5 sm:pl-[30px]">
          <a href={siteUrl('public')} className="flex shrink-0 items-center">
            <Lockup tone="white" className="h-9" />
          </a>

          <nav aria-label="Menu chính" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              'to' in item ? (
                <PublicLink key={item.to} to={item.to} className={cn(linkClass, current(item) && 'bg-white font-semibold text-ink hover:bg-white')}>
                  {item.label}
                </PublicLink>
              ) : (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={cn(linkClass, 'flex items-center gap-1.5 data-[state=open]:bg-white/10', current(item) && 'bg-white font-semibold text-ink hover:bg-white data-[state=open]:bg-white')}>
                    {item.label}
                    <ChevronDownIcon className="size-4" aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-52 rounded-lg">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.to} asChild className="cursor-pointer">
                        <PublicLink to={child.to}>{child.label}</PublicLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            {area ? (
              <a href={area.href} className={cn(siteButtonGreen, 'hidden min-h-12 px-[22px] sm:inline-flex')}>
                {area.label}
              </a>
            ) : (
              <a href={siteUrl('public') + '#tai-app'} className={cn(siteButtonGreen, 'hidden min-h-12 px-[22px] sm:inline-flex')}>
                <SmartphoneIcon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                Tải app
              </a>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Mở menu" className="flex size-12 items-center justify-center rounded-sm text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white lg:hidden">
                <MenuIcon className="size-6" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64 rounded-lg">
                {NAV.map((item) =>
                  'to' in item ? (
                    <DropdownMenuItem key={item.to} asChild className="cursor-pointer text-base">
                      <PublicLink to={item.to}>{item.label}</PublicLink>
                    </DropdownMenuItem>
                  ) : (
                    <div key={item.label}>
                      <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.to} asChild className="cursor-pointer pl-7 text-base">
                          <PublicLink to={child.to}>{child.label}</PublicLink>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ),
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer text-base font-semibold text-primary">
                  <a href={area ? area.href : siteUrl('public') + '#tai-app'}>{area ? area.label : 'Tải app'}</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Wrap>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-brand-100">
      <Wrap className="flex flex-wrap justify-between gap-6 py-10 text-sm">
        <div className="flex flex-col gap-2">
          <Lockup tone="white" className="h-9 self-start" />
          <span>Đặt món từ quán trong khu.</span>
          {SUPPORT_EMAIL ? (
            <span>
              Liên hệ:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </span>
          ) : null}
        </div>
        <nav aria-label="Tìm hiểu thêm" className="flex flex-col items-start gap-2">
          <span className="font-semibold text-white">Tìm hiểu thêm</span>
          <PublicLink to="/huong-dan/bat-dau" className="underline-offset-4 hover:text-white hover:underline">Hướng dẫn bắt đầu</PublicLink>
          <PublicLink to="/huong-dan/quan-ly-cua-hang" className="underline-offset-4 hover:text-white hover:underline">Quản lý cửa hàng</PublicLink>
          <PublicLink to="/blog" className="underline-offset-4 hover:text-white hover:underline">Blog</PublicLink>
          <PublicLink to="/bo-nhan-dien" className="underline-offset-4 hover:text-white hover:underline">Thư viện bộ nhận diện</PublicLink>
          <PublicLink to="/tro-giup" className="underline-offset-4 hover:text-white hover:underline">Trung tâm trợ giúp</PublicLink>
        </nav>
        <div className="flex flex-col items-start gap-4">
          <TextSizeControl tone="light" />
          <nav aria-label="Pháp lý" className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <Link to="/legal/CUSTOMER_TERMS" className="underline-offset-4 hover:text-white hover:underline">Điều khoản sử dụng</Link>
          <Link to="/legal/SELLER_TERMS" className="underline-offset-4 hover:text-white hover:underline">Điều khoản người bán</Link>
          <Link to="/legal/PRIVACY_POLICY" className="underline-offset-4 hover:text-white hover:underline">Chính sách quyền riêng tư</Link>
          </nav>
        </div>
      </Wrap>
    </footer>
  )
}

function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6', className)}>{children}</div>
}
