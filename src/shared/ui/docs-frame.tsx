import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { legalUrl, siteUrl } from '@/shared/config/sites'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { buttonClass } from '@/shared/ui/button'
import { TextSizeControl } from '@/shared/ui/text-size-control'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { t } from '@/shared/i18n'

export type DocsTab = { key: string; label: string; icon: LucideIcon; to: string }
export type DocsNavGroup = { title: string; items: { label: string; to: string }[] }

/**
 * The left menu on a thin rail, as on the GitBook docs: grey upper-case group names, grey pages, the current page in orange beside an
 * orange piece of the rail; hovering any row gives a light grey ground and black text.
 */
export function DocsRail({ groups, current, label = t('Mục lục') }: { groups: DocsNavGroup[]; current?: string; label?: string }) {
  return (
    <nav aria-label={label} className="flex flex-col gap-6 border-l border-grey-200">
      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-1">
          <h2 className="pl-3 text-caption font-medium tracking-wide text-muted-foreground uppercase">{g.title}</h2>
          <ul className="flex flex-col">
            {g.items.map((item) => {
              const on = item.to === current
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      '-ml-px flex min-h-8 items-center rounded-r-md border-l py-1.5 pr-1.5 pl-3 text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      on ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground hover:border-grey-400',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </nav>
  )
}

/**
 * A documentation site of bonbon (the help center, the brand), after the GitBook docs: a header with the logo and the site's name,
 * tabs for its parts, the part's menu on the left, the page in the middle and its headings on the right, a beige footer.
 */
export function DocsFrame({ label, tabs, tab, sidebar, aside, wide = false, search, tabsEnd, decoration, children }: {
  /** the site's name beside the logo (Trợ giúp, Thương hiệu) */
  label: string
  tabs: DocsTab[]
  tab: string
  sidebar?: ReactNode
  aside?: ReactNode
  /** the page uses the whole width, with no reading column */
  wide?: boolean
  /** a search box in the middle of the header */
  search?: ReactNode
  /** at the right end of the tab row (the language) */
  tabsEnd?: ReactNode
  /** a decorative picture at the top right: above the headings list when there is one, behind the page otherwise */
  decoration?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-x-clip bg-background text-ink">
      <a href="#main" className="sr-only z-50 rounded-sm bg-card px-3 py-2 text-ui font-medium text-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        {t('Bỏ qua đến nội dung chính')}
      </a>
      <header className="sticky top-0 z-30 border-b border-grey-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-3">
            <a href={siteUrl('public')} aria-label={t('bonbon, trang chủ')} className="flex items-center">
              <Lockup className="h-7" />
            </a>
            <span className="text-ui text-muted-foreground">{label}</span>
          </div>
          {search ? <div className="flex min-w-0 flex-1 justify-center">{search}</div> : null}
          <div className="flex shrink-0 items-center gap-2">
            <a href={siteUrl('public')} className="hidden rounded-md px-2.5 py-1.5 text-ui text-muted-foreground transition-colors hover:bg-grey-100 hover:text-ink sm:inline">
              {t('Về bonbon')}
            </a>
            <a href={siteUrl('public') + '#get-app'} className={buttonClass()}>
              {t('Tải app')}
            </a>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        <nav aria-label={label} className="flex min-w-0 gap-1 overflow-x-auto">
          {tabs.map((tItem) => {
            const Icon = tItem.icon
            const on = tItem.key === tab
            return (
              <Link
                key={tItem.key}
                to={tItem.to}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  '-mb-px flex shrink-0 items-center gap-2 rounded-t-md border-b-2 px-3 py-2.5 text-ui whitespace-nowrap outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring',
                  on ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground',
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {tItem.label}
              </Link>
            )
          })}
        </nav>
        {tabsEnd ? <div className="hidden shrink-0 sm:block">{tabsEnd}</div> : null}
        </div>
      </header>
      {decoration && !aside ? (
        <div aria-hidden="true" className="pointer-events-none absolute top-28 right-0 -z-0 hidden w-[34rem] translate-x-[30%] xl:block">
          {decoration}
        </div>
      ) : null}
      <div className={cn('relative z-10 mx-auto grid w-full max-w-[1440px] flex-1 gap-10 px-4 py-8 sm:px-6 lg:py-10', sidebar ? 'lg:grid-cols-[16rem_minmax(0,1fr)]' : '', sidebar && aside ? 'xl:grid-cols-[16rem_minmax(0,1fr)_15rem]' : '')}>
        {sidebar ? <aside className="hidden lg:block lg:sticky lg:top-36 lg:max-h-[calc(100svh-10rem)] lg:self-start lg:overflow-y-auto">{sidebar}</aside> : null}
        <main id="main" className={cn('relative min-w-0', !wide && 'max-w-3xl')}>
          {children}
        </main>
        {aside ? (
          <aside className="hidden xl:block xl:sticky xl:top-36 xl:self-start">
            {decoration ? (
              <div aria-hidden="true" className="pointer-events-none mb-6 -mr-[clamp(1rem,4vw,6rem)]">
                {decoration}
              </div>
            ) : null}
            {aside}
          </aside>
        ) : null}
      </div>
      <footer className="border-t border-grey-200 bg-beige-50">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-small text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} bonbon</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <LanguageSwitch />
            <TextSizeControl />
          </div>
          <nav aria-label={t('Pháp lý')} className="flex flex-wrap gap-x-5">
            <a href={legalUrl('CUSTOMER_TERMS')} className="hover:text-ink">
              {t('Điều khoản sử dụng')}
            </a>
            <a href={legalUrl('SELLER_TERMS')} className="hover:text-ink">
              {t('Điều khoản người bán')}
            </a>
            <a href={legalUrl('PRIVACY_POLICY')} className="hover:text-ink">
              {t('Chính sách quyền riêng tư')}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
