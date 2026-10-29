import { BearFigure } from './bear-scene'
import { t } from '@/shared/i18n'

const INK = '#1d1d1d'
const ORANGE = '#fe551b'
const PALE = '#ffe3d4'
const line = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** A tower with rows of windows; `lit` lists the windows (row, column) with the light on. */
function Tower({ x, y, w, h, cols, lit }: { x: number; y: number; w: number; h: number; cols: number; lit: [number, number][] }) {
  const pad = 22
  const cell = (w - pad * 2) / cols
  const rows = Math.floor((h - 70) / 46)
  const windows = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const on = lit.some(([lr, lc]) => lr === r && lc === c)
      windows.push(<rect key={`${r}-${c}`} x={x + pad + c * cell + 6} y={y + 26 + r * 46} width={cell - 12} height={26} rx={4} fill={on ? ORANGE : PALE} />)
    }
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="#fff" {...line} />
      {windows}
      <rect x={x + w / 2 - 20} y={y + h - 44} width={40} height={44} rx={6} fill={PALE} {...line} />
    </g>
  )
}

function Bush({ x, y, r }: { x: number; y: number; r: number }) {
  return <circle cx={x} cy={y} r={r} fill="#fff" {...line} />
}

/**
 * The landing picture: two apartment towers, a small shop at the foot of one, and the bonbon bear carrying an order along the
 * short orange route to the other tower. Line drawing in ink with orange, on pale orange, with small labels on top.
 */
export function NeighbourhoodScene() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-accent" role="img" aria-label={t('Minh hoạ: quán dưới sảnh toà S1, gấu bonbon mang món sang toà S2 trong vài phút')}>
      <svg aria-hidden="true" viewBox="0 0 1000 480" className="block h-auto w-full">
        {/* sun and clouds */}
        <circle cx="520" cy="96" r="38" fill={PALE} />
        <path d="M600 120 h70 a18 18 0 0 0 -18 -26 a26 26 0 0 0 -46 6 a16 16 0 0 0 -6 20 Z" fill="#fff" {...line} strokeWidth={2.5} />
        <path d="M330 80 h56 a14 14 0 0 0 -14 -20 a20 20 0 0 0 -36 4 a12 12 0 0 0 -6 16 Z" fill="#fff" {...line} strokeWidth={2.5} />

        {/* street */}
        <path d="M0 420 H1000" {...line} />
        <path d="M0 450 H1000" stroke={PALE} strokeWidth={14} />

        <Tower x={50} y={110} w={230} h={310} cols={3} lit={[[1, 1], [3, 0]]} />
        <Tower x={730} y={70} w={220} h={350} cols={3} lit={[[2, 2]]} />

        {/* the shop at the foot of tower S1 */}
        <g>
          <rect x={300} y={300} width={170} height={120} rx={8} fill="#fff" {...line} />
          <path d="M292 270 h186 v30 h-186 Z" fill="#fff" {...line} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${292 + i * 37.2} 270 h18.6 v30 h-18.6 Z`} fill={ORANGE} />
          ))}
          <path d="M292 300 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0 q9.3 12 18.6 0" fill="#fff" {...line} />
          <rect x={318} y={340} width={60} height={80} rx={6} fill={PALE} {...line} />
          <rect x={396} y={334} width={56} height={40} rx={6} fill={PALE} {...line} strokeWidth={2.5} />
          <path d="M412 360 h24 a12 9 0 0 1 -24 0 Z" fill={ORANGE} />
        </g>

        {/* the route from the shop door to tower S2, and the end pin */}
        <path d="M380 412 C 470 380, 520 440, 600 410 S 760 400, 840 406" fill="none" stroke={ORANGE} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
        <g transform="translate(840 330)">
          <path d="M0 0 c-20 0 -30 14 -30 28 c0 22 30 48 30 48 c0 0 30 -26 30 -48 c0 -14 -10 -28 -30 -28 Z" fill={ORANGE} {...line} />
          <circle cx="0" cy="28" r="9" fill="#fff" />
        </g>

        <Bush x={500} y={404} r={16} />
        <Bush x={520} y={410} r={11} />
        <Bush x={690} y={404} r={15} />

        {/* the bear on its way */}
        <g transform="translate(548 236) scale(0.82)">
          <BearFigure kind="deliver" />
        </g>
      </svg>

      <span className="absolute top-[46%] left-[30%] hidden rounded-full bg-white px-3 py-1.5 text-small font-medium text-ink shadow-float sm:block">
        {t('Quán dưới sảnh S1 · 120 m')}
      </span>
      <span className="absolute top-[8%] right-[3%] hidden rounded-full bg-white px-3 py-1.5 text-small font-medium text-ink shadow-float sm:block">
        {t('Giao tới Toà S2 · căn 1508')}
      </span>
      <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-full bg-ink px-3 py-1.5 text-[0.75rem] font-medium text-white sm:text-small">
        {t('12 phút, món còn nóng')}
      </span>
    </div>
  )
}
