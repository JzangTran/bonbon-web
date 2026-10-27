import { BellIcon, ChevronDownIcon, MenuIcon, PanelRightIcon } from 'lucide-react'
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
import type { AccountLink, ExtraPage, FooterLink, NavParent } from './types'

export type WorkspaceProps = {
  /** "Kênh người bán" / "Quản trị": shown next to the logo */
  area: string
  homePath: string
  nav: NavParent[]
  extras?: ExtraPage[]
  account?: AccountLink[]
  footerLinks?: FooterLink[]
  loginPath: string
  /** localStorage key for which groups the person opened or closed */
  storageKey: string
  /** extra controls on the right of the header, before the bell */
  headerExtra?: ReactNode
  orderPath?: (orderId: string) => string
}

/**
 * The seller and admin workspace: a black header with the breadcrumb, a left navigation, a gray work area whose content sits on
 * a white block, a white right panel and a footer. The page never scrolls: the three body regions scroll on their own.
 * Below 1280 px the right panel becomes a drawer; below 768 px so does the navigation.
 */
export function WorkspaceShell(props: WorkspaceProps) {
  return (
    <WorkspaceSlotsProvider>
      <Shell {...props} />
    </WorkspaceSlotsProvider>
  )
}

function Shell({ area, homePath, nav, extras = [], account = [], footerLinks = [], loginPath, storageKey, headerExtra, orderPath }: WorkspaceProps) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const location = locate(pathname, nav, extras)
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

      <header className="relative z-20 flex h-12 shrink-0 items-center justify-between gap-4 border-b bg-ws-header px-4 text-ink sm:px-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {!wideNav ? (
            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
            >
              <MenuIcon className="size-[18px]" aria-hidden="true" />
            </button>
          ) : null}
          <Link to={homePath} className="flex items-center">
            <Lockup className="h-7" />
          </Link>
          <span className="hidden text-muted-foreground lg:inline">{area}</span>
          <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
          <nav aria-label="Đường dẫn" className="hidden min-w-0 sm:block">
            <ol className="flex items-baseline gap-2 whitespace-nowrap">
              <li>
                {atHome ? (
                  <span aria-current="page" className="font-semibold text-ink">
                    Trang chủ
                  </span>
                ) : (
                  <Link to={homePath} className="text-muted-foreground hover:text-foreground">
                    Trang chủ
                  </Link>
                )}
              </li>
              {location.parent && location.page ? (
                <Fragment>
                  <li aria-hidden="true" className="text-border">
                    /
                  </li>
                  <li className="text-muted-foreground">{location.parent.label}</li>
                </Fragment>
              ) : null}
              {location.page ? (
                <Fragment>
                  <li aria-hidden="true" className="text-border">
                    /
                  </li>
                  <li aria-current="page" className="truncate font-semibold text-ink">
                    {location.page.label}
                  </li>
                </Fragment>
              ) : null}
            </ol>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          {headerExtra}
          <button
            type="button"
            aria-label={unread > 0 ? `Thông báo, ${unread} chưa đọc` : 'Thông báo'}
            onClick={() => setBellOpen(true)}
            className="relative flex size-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <BellIcon className="size-[17px]" aria-hidden="true" />
            {unread > 0 ? (
              <span className="absolute top-0 -right-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-[4px] bg-destructive px-1 text-[0.625rem] font-semibold text-white tabular-nums">
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
              className="flex size-8 items-center justify-center rounded-full hover:bg-muted"
            >
              <PanelRightIcon className="size-[18px]" aria-hidden="true" />
            </button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-1 py-1 text-[0.8125rem] font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
              <span aria-hidden="true" className="flex size-[26px] items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800">
                {name.trim().charAt(0).toUpperCase() || '?'}
              </span>
              <span className="hidden max-w-40 truncate sm:inline">{name}</span>
              <ChevronDownIcon className="size-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{session?.email}</DropdownMenuLabel>
              {account.map((link) => (
                <DropdownMenuItem key={link.to} asChild>
                  <Link to={link.to}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              {account.length > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem onSelect={logout}>Đăng xuất</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

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
            className="absolute inset-0 z-30 bg-black/30"
          />
        ) : null}

        <aside
          inert={!wideNav && !navOpen}
          className={cn(
            'absolute inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto bg-card py-2 shadow-float transition-transform wsnav:static wsnav:z-auto wsnav:w-60 wsnav:translate-x-0 wsnav:shadow-none wsnav:transition-none',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav aria-label={area}>
            <NavTree nav={nav} location={location} storageKey={storageKey} onNavigate={() => setNavOpen(false)} />
          </nav>
        </aside>

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto bg-ws-ground p-2 outline-none sm:p-5">
          <div ref={setTabsHost} className="mb-3 empty:hidden sm:mb-4" />
          <div key={pathname} className="ws-content bb-page-in bg-card p-3 sm:p-6">
            <Outlet />
          </div>
          <ShellFooter links={footerLinks} className="mt-2 wsnav:hidden" />
        </main>

        <aside
          aria-label="Thông tin bổ sung"
          inert={!widePanel && !panelOpen}
          className={cn(
            'absolute inset-y-0 right-0 z-40 w-80 shrink-0 overflow-y-auto bg-card p-6 shadow-float transition-transform wspanel:static wspanel:z-auto wspanel:w-[18.5rem] wspanel:translate-x-0 wspanel:py-7 wspanel:shadow-none wspanel:transition-none',
            panelOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div ref={setPanelHost} className="flex flex-col gap-8 empty:hidden" />
          {!custom ? <NotificationFeed orderPath={orderPath} /> : null}
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
          <Link key={link.to} to={link.to} className="hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  )
}
