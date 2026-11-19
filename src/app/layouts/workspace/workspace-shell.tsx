import { BellIcon, ChevronDownIcon, ChevronRightIcon, MenuIcon, PanelRightIcon } from 'lucide-react'
import { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { LanguageSwitch } from '@/shared/ui/language-switch'
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
import { FeedbackRegion } from '@/shared/ui/feedback'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { WorkspaceSlotsProvider } from '@/shared/ui/workspace-slots'
import { useSlotHosts } from '@/shared/ui/workspace-slots/context'
import { locate } from './locate'
import { NavTree } from './nav-tree'
import { PageSearch } from './page-search'
import type { AccountLink, FooterLink, Space } from './types'
import { t } from '@/shared/i18n'

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
  /**
   * A pared-down mode (the seller's "Bán hàng tập trung"): the label replaces the area name, and the page search, space tabs,
   * breadcrumb, right column and footer are left out, so only the navigation given in `spaces` and the page remain.
   */
  focus?: { label: string }
}

/**
 * The seller, admin and ops workspace, after Microsoft Teams (design v6.1): three neutral layers with gentle steps between them. The
 * global frame (grey) holds a slim top bar (logo, page search, account) and, with two or more spaces, an app rail down the left
 * (icon with a small fixed-size label under it). Inside the frame, a panel with a rounded corner: the navigation pane (light grey)
 * and the content (white). A right column appears only when the page puts something in it (RightPanel); notifications live under
 * the bell. The page never scrolls: the body regions scroll on their own. Below 1280 px the right column becomes a drawer; below
 * 768 px so does the navigation.
 */
export function WorkspaceShell(props: WorkspaceProps) {
  return (
    <WorkspaceSlotsProvider>
      <Shell {...props} />
    </WorkspaceSlotsProvider>
  )
}

function Shell({ area, homePath, spaces, account = [], footerLinks = [], loginPath, headerExtra, orderPath, focus }: WorkspaceProps) {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const found = spaces.map((s) => ({ space: s, location: locate(pathname, s.nav, s.extras ?? []) }))
  const here = found.find((f) => f.location.page) ?? found[0]
  const { space, location } = here
  const allNav = spaces.flatMap((s) => s.nav)
  const allExtras = spaces.flatMap((s) => s.extras ?? [])
  const { setPanelHost, setTabsHost, custom } = useSlotHosts()
  const notifications = useNotifications(20, !session?.team)
  const unread = notifications.data?.unread ?? 0

  const wideNav = useMediaQuery('(min-width: 768px)')
  // in focus there is no right column, so no button to open it either
  const widePanel = useMediaQuery('(min-width: 1280px)') || Boolean(focus)
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
    <div className="ws-root flex h-svh flex-col bg-frame text-body-sm text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-sm bg-card px-3 py-2 text-body-sm font-semibold text-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:ring-2 focus:ring-ring"
      >
        {t('Bỏ qua đến nội dung chính')}
      </a>

      <header className="relative z-20 flex h-12 shrink-0 items-center gap-4 bg-frame px-3 text-ink sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!wideNav ? (
            <button
              type="button"
              aria-label={t('Mở menu')}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <MenuIcon className="size-[18px]" aria-hidden="true" />
            </button>
          ) : null}
          <Link to={homePath} className="flex items-center">
            <Lockup className="h-6" />
          </Link>
          {focus ? (
            <span className="hidden rounded-xs bg-accent px-3 py-1 text-caption font-semibold text-accent-foreground sm:inline">{focus.label}</span>
          ) : (
            <span className="hidden text-body-sm text-text-secondary lg:inline">{area}</span>
          )}
        </div>

        {!focus ? <PageSearch nav={allNav} extras={allExtras} className="hidden w-full max-w-[25rem] md:block" /> : null}

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
          {headerExtra}
          {session?.team ? null : (
            <Popover open={bellOpen} onOpenChange={setBellOpen}>
              <PopoverTrigger asChild>
                <button
            type="button"
            aria-label={unread > 0 ? t('Thông báo, {v0} chưa đọc', { v0: unread }) : t('Thông báo')}
            className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-ink"
          >
            <BellIcon className="size-[18px]" aria-hidden="true" />
            {unread > 0 ? (
              <span className="absolute top-0.5 right-0 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary px-1 text-caption font-semibold text-white tabular-nums">
                {unread > 99 ? '99+' : unread}
              </span>
            ) : null}
          </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 max-w-[calc(100vw-2rem)] p-4">
                <NotificationFeed orderPath={orderPath} limit={5} />
                <Link
                  to={`${homePath.replace(/\/$/, '')}/notifications`}
                  onClick={() => setBellOpen(false)}
                  className="mt-3 flex h-10 items-center justify-center rounded-control text-label text-link hover:bg-surface-subtle"
                >
                  {t('Xem tất cả trong Hộp thư')}
                </Link>
              </PopoverContent>
            </Popover>
          )}
          {!widePanel && custom ? (
            <button
              type="button"
              aria-label={t('Thông tin bổ sung')}
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen((o) => !o)}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-ink"
            >
              <PanelRightIcon className="size-[18px]" aria-hidden="true" />
            </button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 items-center gap-2 rounded-control pr-2 pl-1 text-body-sm outline-none hover:bg-background/70 focus-visible:ring-2 focus-visible:ring-ring">
              <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-accent text-caption font-semibold text-primary">
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
              <DropdownMenuItem onSelect={logout}>{t('Đăng xuất')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
      {spaces.length > 1 && wideNav && !focus ? <AppRail spaces={spaces} current={space.key} /> : null}
      <div className={cn('relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background', wideNav && 'rounded-tl-card border-t border-l border-border', wideNav && !(spaces.length > 1 && !focus) && 'ml-2')}>
        {(navOpen && !wideNav) || (panelOpen && !widePanel) ? (
          <button
            type="button"
            aria-label={t('Đóng')}
            tabIndex={-1}
            onClick={() => {
              setNavOpen(false)
              setPanelOpen(false)
            }}
            className="bb-overlay absolute inset-0 z-30 bg-overlay"
          />
        ) : null}

        <aside
          inert={!wideNav && !navOpen}
          className={cn(
            'absolute inset-y-0 left-0 z-40 w-64 shrink-0 overflow-y-auto border-r border-border bg-pane px-3 py-4 shadow-float transition-transform wsnav:static wsnav:z-auto wsnav:translate-x-0 wsnav:shadow-none wsnav:transition-none',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {!wideNav && !focus ? <PageSearch nav={allNav} extras={allExtras} className="mb-6" /> : null}
          <nav aria-label={area}>
            {!wideNav && spaces.length > 1 ? <SpaceTabs spaces={spaces} current={space.key} onNavigate={() => setNavOpen(false)} /> : null}
            <NavTree nav={space.nav} location={location} homePath={space === spaces[0] && !focus ? homePath : undefined} onNavigate={() => setNavOpen(false)} />
          </nav>
        </aside>

        <main id="main" tabIndex={-1} className="min-w-0 flex-1 overflow-y-auto bg-background outline-none">
          <div key={pathname} className="ws-content bb-page-in px-4 py-5 sm:px-8 sm:py-6">
            {!focus ? <Breadcrumb homePath={homePath} atHome={atHome} location={location} /> : null}
            <div ref={setTabsHost} className="mb-6 empty:hidden" />
            {/* where this page's results and errors appear (design v5 feedback ladder, rung 2) */}
            <FeedbackRegion>
              <Outlet />
            </FeedbackRegion>
          </div>
          {!focus ? <ShellFooter links={footerLinks} className="mt-2 wsnav:hidden" /> : null}
        </main>

        {!focus ? (
          <aside
            aria-label={t('Thông tin bổ sung')}
            inert={!widePanel && !panelOpen}
            hidden={!custom}
            className={cn(
              'absolute inset-y-0 right-0 z-40 w-80 shrink-0 overflow-y-auto bg-pane p-5 shadow-float transition-transform wspanel:static wspanel:z-auto wspanel:w-72 wspanel:translate-x-0 wspanel:border-l wspanel:border-border wspanel:shadow-none wspanel:transition-none',
              panelOpen ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            <div ref={setPanelHost} className="flex flex-col gap-6 empty:hidden" />
          </aside>
        ) : null}
      </div>
      </div>

      {!focus ? <ShellFooter links={footerLinks} className="hidden wsnav:flex" /> : null}

    </div>
  )
}

/** The first page of a space: its first single page or the first page of its first group. */
const firstPage = (s: Space) => s.nav[0]?.to ?? s.nav[0]?.children?.[0]?.to ?? '/'

/** The spaces as a short list at the top of the navigation drawer on a narrow screen. */
function SpaceTabs({ spaces, current, onNavigate }: { spaces: Space[]; current: string; vertical?: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label={t('Khu vực làm việc')} className="mb-5 flex flex-col gap-0.5">
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
              'flex min-h-9 items-center gap-2.5 rounded-control px-3 text-body-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
              on ? 'bg-background font-semibold text-ink' : 'text-text-secondary hover:bg-surface-strong hover:text-ink',
            )}
          >
            <Icon className={cn('size-[18px]', on && 'text-primary')} aria-hidden="true" />
            {s.label}
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * The app rail, after Microsoft Teams: one button per space down the left of the frame, an icon with its name under it in a
 * small fixed size (10 px, whatever the icon). The current one has a white tile, the icon in the signal blue and a short blue
 * mark at the left; choosing one gives the icon a quick little wiggle.
 */
function AppRail({ spaces, current }: { spaces: Space[]; current: string }) {
  const [wiggle, setWiggle] = useState<string | null>(null)
  return (
    <nav aria-label={t('Khu vực làm việc')} className="flex w-[68px] shrink-0 flex-col items-center gap-1 pt-1">
      {spaces.map((s) => {
        const Icon = s.icon
        const on = s.key === current
        return (
          <Link
            key={s.key}
            to={firstPage(s)}
            aria-current={on ? 'page' : undefined}
            onClick={() => setWiggle(s.key + Date.now())}
            className={cn(
              'group relative flex w-14 flex-col items-center gap-1 rounded-control py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
              on ? 'text-primary' : 'text-text-secondary hover:bg-background/60 hover:text-ink',
            )}
          >
            {on ? <span aria-hidden="true" className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" /> : null}
            <Icon
              key={wiggle?.startsWith(s.key) ? wiggle : s.key}
              className={cn('size-6', wiggle?.startsWith(s.key) && 'bb-wiggle')}
              strokeWidth={on ? 1.75 : 1.5}
              aria-hidden="true"
            />
            <span className={cn('max-w-full truncate px-0.5 text-[10px] leading-3', on ? 'font-semibold' : '')}>{s.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

/**
 * Where the page is, and a way to move: every step but the last is a link. The group step opens a short menu of its pages, so a
 * neighbouring page is one click away.
 */
function Breadcrumb({ homePath, atHome, location }: { homePath: string; atHome: boolean; location: ReturnType<typeof locate> }) {
  const step = 'inline-flex h-7 items-center gap-1 rounded-control px-2 text-text-secondary outline-none transition-colors hover:bg-surface-strong hover:text-ink focus-visible:ring-2 focus-visible:ring-ring'
  const group = location.parent?.children && location.page ? location.parent : null
  return (
    <nav aria-label={t('Đường dẫn')} className="-ml-2 mb-3">
      <ol className="flex flex-wrap items-center gap-0.5 text-caption">
        <li>
          {atHome ? (
            <span aria-current="page" className="inline-flex h-7 items-center px-2 text-ink">{t('Trang chủ')}</span>
          ) : (
            <Link to={homePath} className={step}>
              {t('Trang chủ')}
            </Link>
          )}
        </li>
        {group ? (
          <Fragment>
            <li aria-hidden="true" className="text-text-tertiary">
              <ChevronRightIcon className="size-3" />
            </li>
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger className={step}>
                  {group.label}
                  <ChevronDownIcon className="size-3" aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {group.children!.map((c) => (
                    <DropdownMenuItem key={c.to} asChild>
                      <Link to={c.to} aria-current={c.to === location.page?.to ? 'page' : undefined} className={c.to === location.page?.to ? 'font-semibold' : undefined}>
                        {c.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          </Fragment>
        ) : null}
        {location.page ? (
          <Fragment>
            <li aria-hidden="true" className="text-text-tertiary">
              <ChevronRightIcon className="size-3" />
            </li>
            <li aria-current="page" className="inline-flex h-7 items-center px-2 text-ink">
              {location.page.label}
            </li>
          </Fragment>
        ) : null}
      </ol>
    </nav>
  )
}

/** Copyright, version and links. Below md it ends the scrolling work area instead of taking a fixed strip of the screen. */
function ShellFooter({ links, className }: { links: FooterLink[]; className?: string }) {
  return (
    <footer className={cn('flex min-h-8 shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-0.5 bg-frame px-4 py-1.5 text-caption text-text-tertiary sm:px-5', className)}>
      <span>
        © {new Date().getFullYear()}{t(' bonbon · phiên bản ')}{__APP_VERSION__}
      </span>
      <LanguageSwitch className="[&_button]:h-6 [&_button]:min-w-6" />
      <nav aria-label={t('Liên kết chân trang')} className="flex flex-wrap gap-x-5">
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
