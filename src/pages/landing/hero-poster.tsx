import { t } from '@/shared/i18n'
import { Mascot } from './mascot'

/** Bits of confetti and sparkle scattered over the poster: [x %, y %, kind, rotation]. */
const BITS: [number, number, 'spark' | 'chip' | 'dot' | 'grain', number][] = [
  [8, 14, 'spark', 0],
  [18, 70, 'chip', 30],
  [27, 26, 'grain', 60],
  [36, 84, 'dot', 0],
  [64, 12, 'chip', -20],
  [72, 78, 'spark', 0],
  [86, 24, 'grain', -40],
  [92, 62, 'chip', 50],
  [12, 44, 'dot', 0],
  [80, 46, 'dot', 0],
  [44, 10, 'grain', 20],
  [58, 90, 'grain', -60],
]

function Bit({ kind, rotate }: { kind: (typeof BITS)[number][2]; rotate: number }) {
  if (kind === 'spark') {
    return (
      <svg viewBox="0 0 24 24" className="size-7" style={{ rotate: `${rotate}deg` }}>
        <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" fill="#fff" />
      </svg>
    )
  }
  if (kind === 'chip') return <span className="block h-3 w-6 rounded-[3px] bg-[#ffd166] shadow-sm" style={{ rotate: `${rotate}deg` }} />
  if (kind === 'grain') return <span className="block h-2.5 w-5 rounded-full bg-[#fff1c7]" style={{ rotate: `${rotate}deg` }} />
  return <span className="block size-3 rounded-full bg-white/70" />
}

/** A two-part tag like the name cards on a show poster: a small kicker over a bold value. */
function Tag({ kicker, value, className }: { kicker: string; value: string; className: string }) {
  return (
    <div className={`absolute flex flex-col items-start ${className}`}>
      <span className="rounded-t-md bg-white px-2.5 pt-1 text-[0.6875rem] font-bold tracking-wide text-primary uppercase sm:text-caption">{kicker}</span>
      <span className="rounded-md rounded-tl-none bg-ink px-3 py-1.5 text-ui font-bold text-white shadow-[0_6px_16px_rgb(0_0_0/0.25)] sm:text-body">{value}</span>
    </div>
  )
}

/**
 * The landing picture, after a festive show poster: a hot orange stage with a burst of light, confetti and grains of rice, and the
 * bonbon polar bear in its apron in the middle, holding out a plate of steaming fried rice. Name-card tags say where the shop is,
 * where the food goes and how fast.
 */
export function HeroPoster() {
  return (
    <div
      role="img"
      aria-label={t('Minh hoạ: gấu bonbon đeo tạp dề cam bưng đĩa cơm chiên nóng hổi, từ quán dưới sảnh tới căn hộ của bạn')}
      className="relative isolate aspect-[16/10] overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_50%_100%,#ff8a3d_0%,#fe551b_45%,#d63a07_100%)] sm:aspect-[16/8]"
    >
      {/* the burst of light behind the bear */}
      <div className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[78%] -translate-x-1/2 -translate-y-[38%] rounded-full bg-[repeating-conic-gradient(from_0deg,rgb(255_255_255/0.16)_0deg_9deg,transparent_9deg_18deg)]" />
      <div className="absolute top-1/2 left-1/2 -z-10 aspect-square w-[46%] -translate-x-1/2 -translate-y-[30%] rounded-full bg-[radial-gradient(circle,#ffd9a6_0%,rgb(255_217_166/0)_70%)]" />
      {BITS.map(([x, y, kind, r], i) => (
        <div key={i} aria-hidden="true" className="absolute -z-10" style={{ left: `${x}%`, top: `${y}%` }}>
          <Bit kind={kind} rotate={r} />
        </div>
      ))}
      <Mascot pose="serve" face="excited" className="absolute bottom-[-2%] left-1/2 w-[42%] -translate-x-1/2 sm:w-[34%]" />
      <Tag kicker={t('Quán dưới sảnh')} value={t('S1 · 120 m')} className="top-[10%] left-[5%] -rotate-3" />
      <Tag kicker={t('Giao tới')} value={t('Toà S2 · căn 1508')} className="top-[12%] right-[5%] rotate-2" />
      <Tag kicker={t('Món còn nóng')} value={t('12 phút')} className="bottom-[10%] left-[6%] rotate-2" />
    </div>
  )
}
