import { BellIcon, ChevronDownIcon, ChevronRightIcon, MenuIcon, PanelRightIcon } from 'lucide-react'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { textScaleFactor, useTextScale } from '@/shared/lib/text-scale'
import { TextSizeControl } from '@/shared/ui/text-size-control'
import { NotificationFeed, useNotifications } from '@/entities/notification'
import { useSession } from '@/entities/session'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { Lockup } from '@/shared/ui/brand'
import { cn } from '@/shared/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { WorkspaceSlotsProvider } from '@/shared/ui/workspace-slots'
import { useSlotHosts } from '@/shared/ui/workspace-slots/context'
import { locate } from './locate'
import { NavTree } from './nav-tree'
import { PageSearch } from './page-search'
import type { AccountLink, FooterLink, Space } from './types'

export type WorkspaceProps = {
  /** "Kênh người bán" / "Quản trị": shown next to the logo */
  area: string
  homePath: string
  /** one or more parts with their own navigation; with two or more, tabs under the header switch between them */
  spaces: Space[]
  account?: AccountLink[]
  footerLinks?: FooterLink[]
  loginPath: string
  /** extra controls on the right of the header, before the bell */
  headerExtra?: ReactNode
  orderPath?: (orderId: string) => string
}

/**
 * The seller, admin and ops workspace, after the GitBook docs: a white header with the logo, a page search in the middle and the
 * account on the right; a left navigation on a thin rail; the page with a small breadcrumb above it; a right column on a rail like
 * GitBook's "On this page". The page never scrolls: the three body regions scroll on their own.
 * Below 1280 px the right column becomes a drawer; below 768 px so does the navigation.
 */
export function WorkspaceShell(props: WorkspaceProps) {
  return (
    <WorkspaceSlotsProvider>
      <Shell {...props} />
    </WorkspaceSlotsProvider>
  )
}

function Shell({ area, homePath, spaces, account = [], footerLinks = [], loginPath, headerExtra, orderPath }: WorkspaceProps) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const found = spaces.map((s) => ({ space: s, location: locate(pathname, s.nav, s.extras ?? []) }))
  const here = found.find((f) => f.location.page) ?? found[0]
  const { space, location } = here
  const allNav = spaces.flatMap((s) => s.nav)
  const allExtras = spaces.flatMap((s) => s.extras ?? [])
  const { setPanelHost, setTabsHost, custom } = useSlotHosts()
  const notifications = useNotifications()
  const unread = notifications.data?.unread ?? 0

  const factor = textScaleFactor(useTextScale())
  const wideNav = useMediaQuery(`(min-width: ${768 * factor}px)`)
  const widePanel = useMediaQuery(`(min-width: ${1280 * factor}px)`)
  const [navOpen, setNavOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  useEffect(() => {
    if (!navOpen && !panelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavOpen(false)
        setPanelOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen, panelOpen])

  const logout = async () => {
    await signOut()
    navigate(loginPath, { replace: true })
  }
  const name = session?.name || session?.email || ''
  const atHome = pathname === homePath

  return (
    <div className="ws-root flex h-svh flex-col bg-card text-[0.8125rem]">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-card px-3 py-2 text-sm font-semibold text-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        Bỏ qua đến nội dung chính
      </a>

      <header className="relative z-20 flex h-16 shrink-0 items-center gap-4 border-b border-grey-200 bg-ws-header px-4 text-ink sm:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!wideNav ? (
            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <MenuIcon className="size-[18px]" aria-hidden="true" />
            </button>
          ) : null}
          <Link to={homePath} className="flex items-center">
            <Lockup className="h-7" />
          </Link>
          <span className="hidden text-ui text-muted-foreground lg:inline">{area}</span>
        </div>

        <PageSearch nav={allNav} extras={allExtras} className="hidden w-full max-w-[25rem] md:block" />

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          {headerExtra}
          <button
            type="button"
            aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
            onClick={() => setBellOpen(true)}
            className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-ink"
          >
            <BellIcon className="size-[18px]" aria-hidden="true" />
            {unread > 0 ? (
              <span className="absolute top-0.5 right-0 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] font-semibold text-white tabular-nums">
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null}
          </button>
          {!widePanel ? (
            <button
              type="button"
              aria-label="Thông tin bổ sung"
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-ink"
            >
              <PanelRightIcon className="size-[18px]" aria-hidden="true" />
            </button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-full border border-grey-300 pr-3 pl-1 text-ui outline-none hover:bg-grey-50 focus-visible:ring-2 focus-visible:ring-ring">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-accent text-caption font-semibold text-primary">
                {name.trim().charAt(0).toUpperCase() || '?'}
              </span>
              <span className="hidden max-w-40 truncate sm:inline">{name}</span>
              <ChevronDownIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{session?.email}</DropdownMenuLabel>
              {account.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  {link.external ? <a href={link.to}>{link.label}</a> : <Link to={link.to}>{link.label}</Link>}
                </DropdownMenuItem>
              ))}
              {account.length > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem onSelect={logout}>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      {spaces.length > 1 && wideNav ? (
        <div className="shrink-0 border-b border-grey-200 bg-ws-header px-4 sm:px-5">
          <SpaceTabs spaces={spaces} current={space.key} />
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {(navOpen && !wideNav) || (panelOpen && !widePanel) ? (
          <button
            type="button"
            aria-label="Đóng"
            tabIndex={-1}
            onClick={() => {
              setNavOpen(false)
              setPanelOpen(false)
            }}
            className="bb-overlay absolute inset-0 z-30 bg-black/30"
          />
        ) : null}

        <aside
          inert={!wideNav && !navOpen}
          className={cn(
            'absolute inset-y-0 left-0 z-40 w-72 shrink-0 overflow-y-auto bg-card px-5 py-8 shadow-float transition-transform wsnav:static wsnav:z-auto wsnav:translate-x-0 wsnav:shadow-none wsnav:transition-none',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {!wideNav ? <PageSearch nav={allNav} extras={allExtras} className="mb-6" /> : null}
          <nav aria-label={area}>
            {!wideNav && spaces.length > 1 ? <SpaceTabs spaces={spaces} current={space.key} vertical onNavigate={() => setNavOpen(false)} /> : null}
            <NavTree nav={space.nav} location={location} homePath={space === spaces[0] ? homePath : undefined} onNavigate={() => setNavOpen(false)} />
          </nav>
        </aside>

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto bg-ws-ground outline-none">
          <div key={pathname} className="ws-content bb-page-in px-4 py-6 sm:px-8 sm:py-8">
            <nav aria-label="Đường dẫn" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
                <li>
                  {atHome ? (
                    <span aria-current="page">Trang chủ</span>
                  ) : (
                    <Link to={homePath} className="hover:text-ink">
                      Trang chủ
                    </Link>
                  )}
                </li>
                {location.parent?.children && location.page ? (
                  <Fragment>
                    <li aria-hidden="true">
                      <ChevronRightIcon className="size-3" />
                    </li>
                    <li>{location.parent.label}</li>
                  </Fragment>
                ) : null}
                {location.page ? (
                  <Fragment>
                    <li aria-hidden="true">
                      <ChevronRightIcon className="size-3" />
                    </li>
                    <li aria-current="page" className="text-ink">
                      {location.page.label}
                    </li>
                  </Fragment>
                ) : null}
              </ol>
            </nav>
            <div ref={setTabsHost} className="mb-6 empty:hidden" />
            <Outlet />
          </div>
          <ShellFooter links={footerLinks} className="mt-2 wsnav:hidden" />
        </main>

        <aside
          aria-label="Thông tin bổ sung"
          inert={!widePanel && !panelOpen}
          className={cn(
            'absolute inset-y-0 right-0 z-40 w-80 shrink-0 overflow-y-auto bg-card p-6 shadow-float transition-transform wspanel:static wspanel:z-auto wspanel:w-72 wspanel:translate-x-0 wspanel:py-8 wspanel:pr-8 wspanel:pl-0 wspanel:shadow-none wspanel:transition-none',
            panelOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="wspanel:border-l wspanel:border-grey-200 wspanel:pl-5">
            <div ref={setPanelHost} className="flex flex-col gap-8 empty:hidden" />
            {!custom ? <NotificationFeed orderPath={orderPath} /> : null}
          </div>
        </aside>
      </div>

      <ShellFooter links={footerLinks} className="hidden wsnav:flex" />

      <Sheet open={bellOpen} onOpenChange={setBellOpen}>
        <SheetContent side="right" className="gap-0 p-0">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle>Thông báo</SheetTitle>
            <SheetDescription className="sr-only">Thông báo mới nhất của bạn</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-6 py-4">
            <NotificationFeed orderPath={orderPath} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/** The first page of a space: its first single page or the first page of its first group. */
const firstPage = (s: Space) => s.nav[0]?.to ?? s.nav[0]?.children?.[0]?.to ?? '/'

/**
 * The tabs of the spaces, after the GitBook docs: an icon and a name; the current one in orange with an orange line under it.
 * Stacked as a short list at the top of the navigation drawer on a narrow screen.
 */
function SpaceTabs({ spaces, current, vertical = false, onNavigate }: { spaces: Space[]; current: string; vertical?: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Khu vực làm việc" className={cn(vertical ? 'mb-6 flex flex-col gap-1' : '-mb-px flex gap-2 overflow-x-auto')}>
      {spaces.map((s) => {
        const Icon = s.icon
        const on = s.key === current
        return (
          <Link
            key={s.key}
            to={firstPage(s)}
            onClick={onNavigate}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 text-ui whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
              vertical ? 'rounded-full px-3 py-2' : 'border-b-2 px-3 py-2.5',
              'transition-colors hover:bg-grey-100 hover:text-ink',
              !vertical && 'rounded-t-md',
              on ? cn('font-medium text-primary', !vertical && 'border-primary') : cn('text-muted-foreground', !vertical && 'border-transparent'),
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
            {s.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Copyright, version and links. Below md it ends the scrolling work area instead of taking a fixed strip of the screen. */
function ShellFooter({ links, className }: { links: FooterLink[]; className?: string }) {
  return (
    <footer className={cn('flex min-h-8 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-0.5 border-t border-ws-hairline bg-card px-4 py-1.5 text-[0.6875rem] text-muted-foreground sm:px-5', className)}>
      <span>
        © {new Date().getFullYear()} bonbon · phiên bản {__APP_VERSION__}
      </span>
      <TextSizeControl className="[&_button]:size-6" />
      <nav aria-label="Liên kết chân trang" className="flex flex-wrap gap-x-5">
        {links.map((link) => (
          link.external ? (
            <a key={link.to} href={link.to} className="hover:text-foreground">
              {link.label}
            </a>
          ) : (
            <Link key={link.to} to={link.to} className="hover:text-foreground">
              {link.label}
            </Link>
          )
        ))}
      </nav>
    </footer>
  )
}
