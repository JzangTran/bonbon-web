import type { ReactNode } from 'react'
import { ChevronDownIcon, MenuIcon, SmartphoneIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { siteButton, siteButtonGreen } from './buttons'
import { SITE, siteUrl, type Site } from '@/shared/config/sites'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { TextSizeControl } from '@/shared/ui/text-size-control'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

type NavLink = { label: string; to: string }
/** A link to another site of bonbon (the help center). */
type NavSite = { label: string; site: Site }
type NavItem = NavLink | NavSite | { label: string; children: NavLink[] }

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
  { label: 'Trung tâm trợ giúp', site: 'help' },
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

const linkClass = 'rounded-full px-3.5 py-2 text-[0.9375rem] font-medium text-ink outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring'

/** Where a menu link goes and the plain address behind it. */
function target(item: NavLink | NavSite): { href: string; here: (pathname: string) => boolean } {
  if ('site' in item) return { href: siteUrl(item.site), here: () => SITE === item.site }
  return { href: item.to, here: (pathname) => isHere(pathname, item.to) }
}

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
    session?.role === 'SELLER' ? { href: siteUrl('merchant'), label: 'Vào trang người bán' }
    : session?.role === 'ADMIN' ? { href: siteUrl('console'), label: 'Vào trang quản trị' }
    : null
  const current = (item: NavItem) => ('children' in item ? item.children.some((c) => isHere(pathname, c.to)) : target(item).here(pathname))

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <Wrap>
        <div className="flex h-16 items-center justify-between gap-x-4">
          <a href={siteUrl('public')} className="flex shrink-0 items-center">
            <Lockup className="h-8" />
          </a>

          <nav aria-label="Menu chính" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              !('children' in item) ? (
                'site' in item ? (
                  <a key={item.label} href={target(item).href} className={cn(linkClass, current(item) && 'bg-brand-50 font-semibold text-brand-800 hover:bg-brand-50')}>
                    {item.label}
                  </a>
                ) : (
                  <PublicLink key={item.to} to={item.to} className={cn(linkClass, current(item) && 'bg-brand-50 font-semibold text-brand-800 hover:bg-brand-50')}>
                    {item.label}
                  </PublicLink>
                )
              ) : (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={cn(linkClass, 'flex items-center gap-1.5 data-[state=open]:bg-muted', current(item) && 'bg-brand-50 font-semibold text-brand-800 hover:bg-brand-50')}>
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
              <a href={area.href} className={cn(siteButtonGreen, 'hidden min-h-9 px-4 text-sm sm:inline-flex')}>
                {area.label}
              </a>
            ) : (
              <>
              <a href={siteUrl('merchant', '/register')} className={cn(siteButton, 'hidden min-h-9 bg-muted px-4 text-sm text-ink hover:bg-border md:inline-flex')}>
                Mở quán
              </a>
              <a href={siteUrl('public') + '#tai-app'} className={cn(siteButtonGreen, 'hidden min-h-9 px-4 text-sm sm:inline-flex')}>
                <SmartphoneIcon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                Tải app
              </a>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger aria-label="Mở menu" className="flex size-10 items-center justify-center rounded-full text-ink outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:hidden">
                <MenuIcon className="size-6" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64 rounded-lg">
                {NAV.map((item) =>
                  !('children' in item) ? (
                    <DropdownMenuItem key={item.label} asChild className="cursor-pointer text-base">
                      {'site' in item ? <a href={target(item).href}>{item.label}</a> : <PublicLink to={item.to}>{item.label}</PublicLink>}
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
    <footer className="border-t bg-white text-muted-foreground">
      <Wrap className="flex flex-wrap justify-between gap-6 py-10 text-sm">
        <div className="flex flex-col gap-2">
          <Lockup className="h-8 self-start" />
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
          <span className="font-semibold text-ink">Tìm hiểu thêm</span>
          <PublicLink to="/huong-dan/bat-dau" className="underline-offset-4 hover:text-ink hover:underline">Hướng dẫn bắt đầu</PublicLink>
          <PublicLink to="/huong-dan/quan-ly-cua-hang" className="underline-offset-4 hover:text-ink hover:underline">Quản lý cửa hàng</PublicLink>
          <PublicLink to="/blog" className="underline-offset-4 hover:text-ink hover:underline">Blog</PublicLink>
          <PublicLink to="/bo-nhan-dien" className="underline-offset-4 hover:text-ink hover:underline">Thư viện bộ nhận diện</PublicLink>
          <a href={siteUrl('help')} className="underline-offset-4 hover:text-ink hover:underline">Trung tâm trợ giúp</a>
        </nav>
        <div className="flex flex-col items-start gap-4">
          <TextSizeControl />
          <nav aria-label="Pháp lý" className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <Link to="/legal/CUSTOMER_TERMS" className="underline-offset-4 hover:text-ink hover:underline">Điều khoản sử dụng</Link>
          <Link to="/legal/SELLER_TERMS" className="underline-offset-4 hover:text-ink hover:underline">Điều khoản người bán</Link>
          <Link to="/legal/PRIVACY_POLICY" className="underline-offset-4 hover:text-ink hover:underline">Chính sách quyền riêng tư</Link>
          </nav>
        </div>
      </Wrap>
    </footer>
  )
}

function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6', className)}>{children}</div>
}
