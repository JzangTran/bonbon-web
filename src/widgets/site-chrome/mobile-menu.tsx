import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDownIcon, MenuIcon, XIcon } from 'lucide-react'
import { useLocation } from 'react-router'
import { cn } from '@/shared/lib/utils'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { t } from '@/shared/i18n'
import type { ResourceColumn, ResourceLink } from './resources'

export type MobileMenuItem =
  | { kind: 'group'; label: string; columns: ResourceColumn[]; current: boolean }
  | { kind: 'link'; label: string; render: (className: string, onClick: () => void) => ReactNode; current: boolean }

/** Opens and closes with the height of its content, without measuring it (the 0fr → 1fr grid row). */
function Fold({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
      <div className="overflow-hidden" inert={!open}>
        {children}
      </div>
    </div>
  )
}

/**
 * The public site's menu under 1024 px: a sheet over the whole page below the bar, on the same solid white as the bar while it is
 * open (no half-blurred page showing through). Only the top items show; a group opens on tap, and inside it each column opens on its
 * own, so nothing is a wall of links. The actions sit at the bottom, in reach of the thumb.
 */
export function MobileMenu({
  items,
  renderLink,
  actions,
  open,
  onOpenChange,
}: {
  items: MobileMenuItem[]
  renderLink: (l: ResourceLink, className: string, onClick: () => void) => ReactNode
  actions: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [group, setGroup] = useState<string | null>(null)
  const [column, setColumn] = useState<string | null>(null)
  const { pathname, hash } = useLocation()
  const close = () => onOpenChange(false)

  // a link was followed: the menu goes
  useEffect(() => {
    onOpenChange(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash])

  useEffect(() => {
    if (!open) return
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onOpenChange(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = before
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  const row = 'flex w-full items-center justify-between gap-4 py-4 text-left text-[1.0625rem] font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <>
      <button
        type="button"
        aria-label={open ? t('Đóng menu') : t('Mở menu')}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => onOpenChange(!open)}
        className="relative flex size-10 items-center justify-center rounded-full text-ink outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
      >
        <MenuIcon className={cn('absolute size-6 transition-all duration-200', open ? 'scale-50 rotate-90 opacity-0' : 'opacity-100')} aria-hidden="true" />
        <XIcon className={cn('absolute size-6 transition-all duration-200', open ? 'opacity-100' : 'scale-50 -rotate-90 opacity-0')} aria-hidden="true" />
      </button>
      {createPortal(
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('Menu chính')}
          inert={!open}
          className={cn(
            'fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-white transition-[opacity,transform] duration-200 ease-out lg:hidden',
            open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
          )}
        >
          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6">
            <ul className="divide-y divide-grey-200">
              {items.map((item) =>
                item.kind === 'link' ? (
                  <li key={item.label}>{item.render(cn(row, item.current && 'text-primary'), close)}</li>
                ) : (
                  <li key={item.label}>
                    <button
                      type="button"
                      aria-expanded={group === item.label}
                      onClick={() => {
                        setGroup(group === item.label ? null : item.label)
                        setColumn(null)
                      }}
                      className={cn(row, item.current && 'text-primary')}
                    >
                      {item.label}
                      <ChevronDownIcon className={cn('size-5 text-muted-foreground transition-transform duration-300', group === item.label && 'rotate-180')} aria-hidden="true" />
                    </button>
                    <Fold open={group === item.label}>
                      <div className="mb-4 flex flex-col gap-1 rounded-2xl bg-grey-50 p-2">
                        {item.columns.map((col) => {
                          const opened = column === col.label
                          return (
                            <div key={col.label} className={cn('rounded-xl transition-colors', opened && 'bg-white shadow-[0_1px_2px_rgb(0_0_0/0.06)]')}>
                              <button
                                type="button"
                                aria-expanded={opened}
                                onClick={() => setColumn(opened ? null : col.label)}
                                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left text-ui font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {col.label}
                                <span className="text-caption text-muted-foreground">
                                  {col.links.length}
                                  <ChevronDownIcon className={cn('ml-1 inline size-4 transition-transform duration-300', opened && 'rotate-180')} aria-hidden="true" />
                                </span>
                              </button>
                              <Fold open={opened}>
                                <ul className="flex flex-col pb-2">
                                  {col.links.map((l) => (
                                    <li key={l.label}>
                                      {renderLink(
                                        l,
                                        'flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-ui text-muted-foreground transition-colors hover:bg-grey-50 hover:text-ink',
                                        close,
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </Fold>
                            </div>
                          )
                        })}
                      </div>
                    </Fold>
                  </li>
                ),
              )}
            </ul>
          </nav>
          <div className="flex flex-col gap-3 border-t border-grey-200 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
            <div className="grid grid-cols-2 gap-2 [&>*]:w-full">{actions}</div>
            <div className="flex items-center justify-center text-small text-muted-foreground">
              <LanguageSwitch />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
