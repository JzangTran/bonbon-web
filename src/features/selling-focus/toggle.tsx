import { CrosshairIcon, LogOutIcon } from 'lucide-react'
import { t } from '@/shared/i18n'
import { setSellingFocus, useSellingFocus } from './model'

/** The header button that turns selling focus on, or, while it is on, the way out. */
export function SellingFocusToggle() {
  const on = useSellingFocus()
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t('Thoát bán hàng tập trung') : t('Bán hàng tập trung')}
      onClick={() => setSellingFocus(!on)}
      title={on ? undefined : t('Chỉ giữ đơn hàng, tin nhắn và còn/hết món')}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full whitespace-nowrap border border-grey-300 px-3 text-ui font-medium text-ink outline-none hover:bg-grey-50 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {on ? <LogOutIcon className="size-4" aria-hidden="true" /> : <CrosshairIcon className="size-4" aria-hidden="true" />}
      <span className="hidden min-[1600px]:inline">{on ? t('Thoát bán hàng tập trung') : t('Bán hàng tập trung')}</span>
      <span className="min-[1600px]:hidden">{on ? t('Thoát') : t('Tập trung')}</span>
    </button>
  )
}
