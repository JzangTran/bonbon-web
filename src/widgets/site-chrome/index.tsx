import type { ReactNode } from 'react'
import { ArrowRightIcon, BookOpenIcon, ChevronDownIcon, MenuIcon, SmartphoneIcon, StoreIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { siteButton, siteButtonSolid } from './buttons'
import { SITE, siteUrl, type Site, legalUrl } from '@/shared/config/sites'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { OrangeRings } from '@/shared/ui/orange-rings'
import { TextSizeControl } from '@/shared/ui/text-size-control'


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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <Wrap>
        <div className="flex h-16 items-center justify-between gap-x-4">
          <a href={siteUrl('public')} className="flex shrink-0 items-center">
            <Lockup className="h-8" />
          </a>

          <nav aria-label="Menu chính" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              !('children' in item) ? (
                'site' in item ? (
                  <a key={item.label} href={target(item).href} className={cn(linkClass, current(item) && 'font-medium text-primary hover:bg-transparent')}>
                    {item.label}
                  </a>
                ) : (
                  <PublicLink key={item.to} to={item.to} className={cn(linkClass, current(item) && 'font-medium text-primary hover:bg-transparent')}>
                    {item.label}
                  </PublicLink>
                )
              ) : (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={cn(linkClass, 'flex items-center gap-1.5 data-[state=open]:bg-muted', current(item) && 'font-medium text-primary hover:bg-transparent')}>
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
              <a href={area.href} className={cn(siteButtonSolid, 'hidden min-h-9 px-4 text-sm sm:inline-flex')}>
                {area.label}
              </a>
            ) : (
              <>
              <a href={siteUrl('merchant', '/register')} className={cn(siteButton, 'hidden min-h-9 bg-muted px-4 text-sm text-ink hover:bg-border md:inline-flex')}>
                Mở quán
              </a>
              <a href={siteUrl('public') + '#tai-app'} className={cn(siteButtonSolid, 'hidden min-h-9 px-4 text-sm sm:inline-flex')}>
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

type FooterLink = { label: string; to?: string; href?: string }
type FooterColumn = { label: string; links: FooterLink[] }

/** The footer groups, after gitbook.com: a large group name, columns under small orange labels. */
function footerGroups(): { title: string; columns: FooterColumn[] }[] {
  return [
    {
      title: 'Sản phẩm',
      columns: [
        { label: 'Đặt món', links: [{ label: 'Tải ứng dụng', href: siteUrl('public') + '#tai-app' }, { label: 'Quán trong khu', href: siteUrl('public') + '#quan' }] },
        {
          label: 'Bán hàng',
          links: [
            { label: 'Mở quán trên bonbon', href: siteUrl('merchant', '/register') },
            { label: 'Đăng nhập kênh người bán', href: siteUrl('merchant', '/login') },
          ],
        },
        { label: 'Hướng dẫn', links: [{ label: 'Bắt đầu', to: '/huong-dan/bat-dau' }, { label: 'Quản lý cửa hàng', to: '/huong-dan/quan-ly-cua-hang' }] },
      ],
    },
    {
      title: 'Tài nguyên',
      columns: [
        { label: 'Đọc thêm', links: [{ label: 'Blog', to: '/blog' }, { label: 'Thư viện bộ nhận diện', to: '/bo-nhan-dien' }] },
        {
          label: 'Hỗ trợ',
          links: [
            { label: 'Trung tâm trợ giúp', href: siteUrl('help') },
            { label: 'Liên hệ hỗ trợ', href: siteUrl('help', '/lien-he') },
          ],
        },
        {
          label: 'Pháp lý',
          links: [
            { label: 'Điều khoản sử dụng', href: legalUrl('CUSTOMER_TERMS') },
            { label: 'Điều khoản người bán', href: legalUrl('SELLER_TERMS') },
            { label: 'Chính sách quyền riêng tư', href: legalUrl('PRIVACY_POLICY') },
          ],
        },
      ],
    },
  ]
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const cls = 'text-small text-muted-foreground transition-colors hover:text-ink'
  return link.to ? (
    <PublicLink to={link.to} className={cls}>
      {link.label}
    </PublicLink>
  ) : (
    <a href={link.href} className={cls}>
      {link.label}
    </a>
  )
}

/**
 * The public footer, after gitbook.com: tall and quiet. Groups with a large name, columns under small orange upper-case labels split
 * by faint lines, two cards on the right, then the logo, the text size, the copyright and the legal links.
 */
export function SiteFooter() {
  return (
    <footer className="bg-beige-50 pt-24 pb-12">
      <Wrap className="flex flex-col gap-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
          <div className="flex flex-col gap-12">
            {footerGroups().map((group) => (
              <section key={group.title} className="flex flex-col gap-5">
                <h2 className="text-h3 font-medium text-ink">{group.title}</h2>
                <div className="grid gap-8 sm:grid-cols-3 sm:gap-0">
                  {group.columns.map((col, i) => (
                    <div key={col.label} className={cn('flex flex-col gap-3', i > 0 && 'sm:border-l sm:border-grey-200 sm:pl-8', i < group.columns.length - 1 && 'sm:pr-8')}>
                      <h3 className="text-caption font-medium tracking-wide text-primary uppercase">{col.label}</h3>
                      <ul className="flex flex-col gap-2.5">
                        {col.links.map((link) => (
                          <li key={link.label}>
                            <FooterAnchor link={link} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <a href={siteUrl('merchant', '/register')} className="group relative flex flex-col gap-2 overflow-hidden rounded-2xl bg-primary p-6 text-white">
              <OrangeRings className="absolute -top-24 -right-24 w-72 opacity-40 mix-blend-screen" />
              <StoreIcon className="relative size-6" strokeWidth={1.5} aria-hidden="true" />
              <span className="relative mt-2 text-body font-medium">Mở quán trên bonbon</span>
              <span className="relative text-small text-white/85">Bán cho cư dân ngay trong toà và khu của bạn, hoa hồng thấp, tự giao trong khu.</span>
              <span className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-small font-medium text-ink">
                Bắt đầu
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </a>
            <PublicLink to="/huong-dan/bat-dau" className="group flex flex-col gap-2 rounded-2xl bg-accent p-6">
              <BookOpenIcon className="size-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
              <span className="mt-2 text-body font-medium text-ink">Hướng dẫn mở quán</span>
              <span className="text-small text-muted-foreground">Ba bước từ tạo tài khoản tới đơn hàng đầu tiên.</span>
              <span className="mt-1 text-small font-medium text-primary underline-offset-4 group-hover:underline">Đọc hướng dẫn</span>
            </PublicLink>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Lockup className="h-7" />
            <TextSizeControl />
          </div>
          <div className="flex flex-col gap-1 text-small text-muted-foreground">
            <span>© {new Date().getFullYear()} bonbon. Đặt món từ quán trong khu.</span>
          </div>
          <nav aria-label="Pháp lý" className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={legalUrl('CUSTOMER_TERMS')} className="text-caption text-muted-foreground hover:text-ink">Điều khoản sử dụng</a>
            <a href={legalUrl('SELLER_TERMS')} className="text-caption text-muted-foreground hover:text-ink">Điều khoản người bán</a>
            <a href={legalUrl('PRIVACY_POLICY')} className="text-caption text-muted-foreground hover:text-ink">Chính sách quyền riêng tư</a>
          </nav>
        </div>
      </Wrap>
    </footer>
  )
}

function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6', className)}>{children}</div>
}
