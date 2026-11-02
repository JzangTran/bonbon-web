import { t } from '@/shared/i18n'
import { Mascot } from './mascot'

/** A two-part tag like the name cards on a show poster: a small kicker over a bold value. */
function Tag({ kicker, value, className }: { kicker: string; value: string; className: string }) {
  return (
    <div className={`absolute flex flex-col items-start ${className}`}>
      <span className="rounded-t-md bg-white px-2.5 shadow-sm pt-1 text-[0.6875rem] font-bold tracking-wide text-primary uppercase sm:text-caption">{kicker}</span>
      <span className="rounded-md rounded-tl-none bg-ink px-3 py-1.5 text-ui font-bold text-white shadow-[0_6px_16px_rgb(0_0_0/0.25)] sm:text-body">{value}</span>
    </div>
  )
}

/**
 * The landing picture: the bonbon polar bear in its apron, holding out a plate of hot fried rice, standing in front of the page's
 * ribbon with no backdrop of its own. Name-card tags say where the shop is, where the food goes and how fast.
 */
export function HeroPoster() {
  return (
    <div
      role="img"
      aria-label={t('Minh hoạ: gấu bonbon đeo tạp dề cam bưng đĩa cơm chiên nóng hổi, từ quán dưới sảnh tới căn hộ của bạn')}
      className="relative aspect-[16/11] sm:aspect-[16/7.5]"
    >
      <Mascot pose="serve" face="excited" className="absolute bottom-0 left-1/2 w-[46%] -translate-x-1/2 [mask-image:linear-gradient(to_bottom,black_80%,transparent)] sm:w-[36%]" />
      <Tag kicker={t('Quán dưới sảnh')} value={t('S1 · 120 m')} className="top-[14%] left-[8%] -rotate-3" />
      <Tag kicker={t('Giao tới')} value={t('Toà S2 · căn 1508')} className="top-[18%] right-[6%] rotate-2" />
      <Tag kicker={t('Món còn nóng')} value={t('12 phút')} className="bottom-[14%] left-[10%] rotate-2" />
    </div>
  )
}
