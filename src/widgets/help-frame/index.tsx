import { BookOpenIcon, LifeBuoyIcon, ScaleIcon, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { helpPath, siteUrl } from '@/shared/config/sites'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { buttonClass } from '@/shared/ui/button'
import { TextSizeControl } from '@/shared/ui/text-size-control'

export type HelpTab = 'help' | 'contact' | 'legal'

const TABS: { key: HelpTab; label: string; icon: LucideIcon; to: string }[] = [
  { key: 'help', label: 'Trung tâm trợ giúp', icon: BookOpenIcon, to: helpPath() },
  { key: 'contact', label: 'Liên hệ hỗ trợ', icon: LifeBuoyIcon, to: helpPath('/lien-he') },
  { key: 'legal', label: 'Pháp lý', icon: ScaleIcon, to: helpPath('/phap-ly') },
]

export type HelpNavGroup = { title: string; items: { label: string; to: string }[] }

/** The left menu on a thin rail, as on the GitBook docs: upper-case group names, the current page in orange beside an orange piece of the rail. */
export function HelpSidebar({ groups, current }: { groups: HelpNavGroup[]; current?: string }) {
  return (
    <nav aria-label="Mục lục" className="flex flex-col gap-6 border-l border-grey-200">
      {groups.map((g) => (
        <section key={g.title} className="flex flex-col gap-1">
          <h2 className="pl-3 text-caption font-medium tracking-wide text-ink uppercase">{g.title}</h2>
          <ul className="flex flex-col">
            {g.items.map((item) => {
              const on = item.to === current
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      '-ml-px flex min-h-8 items-center rounded-r-2xl border-l py-1.5 pr-1.5 pl-3 text-ui outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                      on ? 'border-primary font-medium text-primary' : 'border-transparent text-ink/65 hover:border-grey-400 hover:text-ink',
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
 * The help site, shared by customers, sellers and administrators, after the GitBook docs: a header with the logo, tabs for the help
 * center, contact and legal documents, the section's menu on the left, the page in the middle and its headings on the right.
 */
export function HelpFrame({ tab, sidebar, aside, children }: { tab: HelpTab; sidebar?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-ink">
      <a href="#main" className="sr-only z-50 rounded-sm bg-card px-3 py-2 text-ui font-medium text-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Bỏ qua đến nội dung chính
      </a>
      <header className="sticky top-0 z-30 border-b border-grey-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <a href={siteUrl('public')} aria-label="bonbon, trang chủ" className="flex items-center">
              <Lockup className="h-7" />
            </a>
            <span className="text-ui text-muted-foreground">Trợ giúp</span>
          </div>
          <div className="flex items-center gap-3">
            <a href={siteUrl('public')} className="hidden text-ui text-muted-foreground hover:text-ink sm:inline">
              Về bonbon
            </a>
            <a href={siteUrl('public') + '#tai-app'} className={buttonClass()}>
              Tải app
            </a>
          </div>
        </div>
        <nav aria-label="Trợ giúp" className="mx-auto flex w-full max-w-[1440px] gap-2 overflow-x-auto px-4 sm:px-6">
          {TABS.map((t) => {
            const Icon = t.icon
            const on = t.key === tab
            return (
              <Link
                key={t.key}
                to={t.to}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-ui whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  on ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground hover:text-ink',
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {t.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <div className={cn('mx-auto grid w-full max-w-[1440px] flex-1 gap-10 px-4 py-8 sm:px-6 lg:py-10', sidebar ? 'lg:grid-cols-[16rem_minmax(0,1fr)]' : '', sidebar && aside ? 'xl:grid-cols-[16rem_minmax(0,1fr)_15rem]' : '')}>
        {sidebar ? <aside className="hidden lg:block lg:sticky lg:top-36 lg:max-h-[calc(100svh-10rem)] lg:self-start lg:overflow-y-auto">{sidebar}</aside> : null}
        <main id="main" className="min-w-0 max-w-3xl">
          {children}
        </main>
        {aside ? <aside className="hidden xl:block xl:sticky xl:top-36 xl:self-start">{aside}</aside> : null}
      </div>
      <footer className="border-t border-grey-200 bg-beige-50">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-small text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} bonbon</span>
          <TextSizeControl />
          <nav aria-label="Pháp lý" className="flex flex-wrap gap-x-5">
            <Link to={helpPath('/phap-ly/CUSTOMER_TERMS')} className="hover:text-ink">Điều khoản sử dụng</Link>
            <Link to={helpPath('/phap-ly/SELLER_TERMS')} className="hover:text-ink">Điều khoản người bán</Link>
            <Link to={helpPath('/phap-ly/PRIVACY_POLICY')} className="hover:text-ink">Chính sách quyền riêng tư</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
