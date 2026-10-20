import { useEffect, useState, type ReactNode } from 'react'
import { SmartphoneIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'
import { Lockup } from '@/shared/ui/brand'
import { siteButtonGreen } from './buttons'
import { siteUrl } from '@/shared/config/sites'
import { TextSizeControl } from '@/shared/ui/text-size-control'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

export type SiteSection = { id: string; label: string }

/** The section nearest the top of the screen, to mark its link in the bar. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | undefined>(ids[0])
  const key = ids.join(',')
  useEffect(() => {
    if (ids.length === 0) return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = ids.find((id) => visible.has(id))
        if (first) setActive(first)
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

/**
 * The public site's bar (landing, legal documents): the logo, an optional row of in-page section links, and one action.
 * Sign-in pages have their own slimmer bar, and the workspace, focus and payment pages show no site bar at all.
 */
export function SiteHeader({ sections = [] }: { sections?: SiteSection[] }) {
  const { session } = useSession()
  const active = useActiveSection(sections.map((s) => s.id))
  const area =
    session?.role === 'SELLER' ? { href: siteUrl('seller'), label: 'Vào trang người bán' }
    : session?.role === 'ADMIN' ? { href: siteUrl('admin'), label: 'Vào trang quản trị' }
    : null

  return (
    <header className="pt-4 sm:pt-6">
      <Wrap>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-ink py-2.5 pr-2.5 pl-5 sm:pl-[30px]">
          <a href={siteUrl('public')} className="flex items-center">
            <Lockup tone="white" className="h-9" />
          </a>
          {sections.length > 0 ? (
            <nav aria-label="Trang chủ" className="order-3 flex w-full flex-wrap gap-1 sm:order-none sm:w-auto">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={active === id ? 'location' : undefined}
                  className={cn(
                    'rounded-sm px-4 py-2.5 text-[0.9375rem] font-medium text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:px-[18px]',
                    active === id && 'bg-white font-semibold text-ink hover:bg-white',
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          ) : null}
          {area ? (
            <a href={area.href} className={cn(siteButtonGreen, 'min-h-12 px-[22px]')}>
              {area.label}
            </a>
          ) : sections.length > 0 ? (
            <a href="#tai-app" className={cn(siteButtonGreen, 'min-h-12 px-[22px]')}>
              <SmartphoneIcon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              Tải app
            </a>
          ) : (
            <a href={siteUrl('public')} className={cn(siteButtonGreen, 'min-h-12 px-[22px]')}>
              Về trang chủ
            </a>
          )}
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
