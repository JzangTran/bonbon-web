import { useId, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

export type BearPose = 'serve' | 'phone' | 'cook' | 'deliver' | 'eat' | 'wave'
export type BearFace = 'happy' | 'excited' | 'focused' | 'blissful' | 'wink'

/**
 * The bonbon mascot: a chubby polar bear in an orange apron, drawn as a soft 3D figure (round gradients for the fur's volume, a light
 * from the top left, shadows where parts meet). One drawing, many poses and faces, so each place on the site can show the bear doing
 * what that place is about. Front-facing, in a 240 × 260 box, standing on y = 248. Decorative.
 */
export function PolarBear({ pose, face = 'happy', className }: { pose: BearPose; face?: BearFace; className?: string }) {
  const id = useId().replace(/:/g, '')
  const u = (name: string) => `url(#${id}-${name})`
  const p = POSES[pose]
  return (
    <svg aria-hidden="true" viewBox="0 0 240 260" className={cn('block h-auto w-full overflow-visible', className)}>
      <defs>
        <radialGradient id={`${id}-fur`} cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f1f4f8" />
          <stop offset="1" stopColor="#c9d3df" />
        </radialGradient>
        <radialGradient id={`${id}-muzzle`} cx="45%" cy="35%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3e9f0" />
        </radialGradient>
        <linearGradient id={`${id}-apron`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ff8f55" />
          <stop offset="0.5" stopColor="#fe551b" />
          <stop offset="1" stopColor="#d93d08" />
        </linearGradient>
        <radialGradient id={`${id}-nose`} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#5a606b" />
          <stop offset="1" stopColor="#1f232a" />
        </radialGradient>
        <radialGradient id={`${id}-rice`} cx="40%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.6" stopColor="#f6b93b" />
          <stop offset="1" stopColor="#e08e1a" />
        </radialGradient>
        <linearGradient id={`${id}-plate`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d7dee7" />
        </linearGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#7a2a06" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* floor shadow */}
      <ellipse cx="120" cy="250" rx="72" ry="9" fill="#000" opacity="0.14" />

      <g transform={p.tilt ? `rotate(${p.tilt} 120 248)` : undefined} filter={u('soft')}>
        {p.behind?.(u)}
        {/* legs */}
        <ellipse cx="90" cy="232" rx="27" ry="19" fill={u('fur')} />
        <ellipse cx="150" cy="232" rx="27" ry="19" fill={u('fur')} />
        <ellipse cx="88" cy="240" rx="14" ry="6" fill="#dfe5ec" />
        <ellipse cx="152" cy="240" rx="14" ry="6" fill="#dfe5ec" />
        {/* body */}
        <ellipse cx="120" cy="180" rx="72" ry="66" fill={u('fur')} />
        {/* apron: bib, skirt, straps, pocket */}
        <path d="M86 138 Q120 128 154 138 L158 176 Q186 186 184 214 Q120 244 56 214 Q54 186 82 176 Z" fill={u('apron')} />
        <path d="M86 140 Q78 112 92 96 M154 140 Q162 112 148 96" stroke="#e8420c" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M100 196 h40 v14 q-20 8 -40 0 Z" fill="#e8420c" opacity="0.55" />
        <circle cx="120" cy="160" r="9" fill="#fff" opacity="0.92" />
        <path d="M116 159 a2 2 0 0 1 4 0 a2 2 0 0 1 4 0 q0 4 -4 6 q-4 -2 -4 -6 Z" fill="#fe551b" />
        {/* neck shadow */}
        <ellipse cx="120" cy="136" rx="46" ry="10" fill="#9fb0c3" opacity="0.28" />
        {/* head */}
        <circle cx="74" cy="52" r="19" fill={u('fur')} />
        <circle cx="166" cy="52" r="19" fill={u('fur')} />
        <circle cx="75" cy="54" r="9" fill="#f7c4b1" />
        <circle cx="165" cy="54" r="9" fill="#f7c4b1" />
        <ellipse cx="120" cy="92" rx="62" ry="56" fill={u('fur')} />
        {p.hat ? <ChefHat /> : null}
        <Face face={face} u={u} />
        {p.front(u)}
      </g>
      {p.over?.(u)}
    </svg>
  )
}

function Face({ face, u }: { face: BearFace; u: (n: string) => string }) {
  const eye = (cx: number) => (
    <g>
      <ellipse cx={cx} cy="86" rx="5.5" ry="7" fill="#1f232a" />
      <circle cx={cx + 1.8} cy="83.5" r="2" fill="#fff" />
    </g>
  )
  const closed = (cx: number) => <path d={`M${cx - 7} 88 q7 -8 14 0`} stroke="#1f232a" strokeWidth="3.4" strokeLinecap="round" fill="none" />
  const big = (cx: number) => (
    <g>
      <ellipse cx={cx} cy="85" rx="7" ry="8.5" fill="#1f232a" />
      <circle cx={cx + 2.4} cy="82" r="2.6" fill="#fff" />
      <circle cx={cx - 2} cy="88.5" r="1.2" fill="#fff" />
    </g>
  )
  const eyes =
    face === 'blissful' ? [closed(98), closed(142)]
    : face === 'wink' ? [eye(98), closed(142)]
    : face === 'excited' ? [big(98), big(142)]
    : [eye(98), eye(142)]
  const mouth =
    face === 'focused' ? <path d="M112 122 q8 4 16 0" stroke="#1f232a" strokeWidth="3" strokeLinecap="round" fill="none" />
    : face === 'excited' ? <path d="M108 118 q12 18 24 0 Z" fill="#c2410c" stroke="#1f232a" strokeWidth="2.6" strokeLinejoin="round" />
    : <path d="M110 118 q5 6 10 0 q5 6 10 0" stroke="#1f232a" strokeWidth="3" strokeLinecap="round" fill="none" />
  return (
    <g>
      {face === 'focused' ? (
        <path d="M88 74 l18 4 M152 74 l-18 4" stroke="#8b97a6" strokeWidth="3.4" strokeLinecap="round" />
      ) : null}
      {eyes}
      <ellipse cx="84" cy="106" rx="11" ry="7" fill="#ff9b78" opacity="0.5" />
      <ellipse cx="156" cy="106" rx="11" ry="7" fill="#ff9b78" opacity="0.5" />
      <ellipse cx="120" cy="110" rx="26" ry="19" fill={u('muzzle')} />
      <ellipse cx="120" cy="101" rx="10" ry="7" fill={u('nose')} />
      <ellipse cx="117" cy="98.5" rx="3.4" ry="1.8" fill="#fff" opacity="0.7" />
      {mouth}
    </g>
  )
}

function ChefHat() {
  return (
    <g>
      <path d="M78 52 Q66 26 88 18 Q96 2 118 8 Q138 -2 152 14 Q176 18 164 52 Z" fill="#ffffff" stroke="#dbe2ea" strokeWidth="2" />
      <path d="M96 22 q6 10 4 26 M132 18 q8 12 4 30" stroke="#e3e9f0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="78" y="46" width="86" height="14" rx="6" fill="#f3f6f9" stroke="#dbe2ea" strokeWidth="2" />
    </g>
  )
}

/** A paw: a round mitt with a pale pad. */
const paw = (u: (n: string) => string, cx: number, cy: number, r = 13) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={u('fur')} />
    <ellipse cx={cx} cy={cy + 3} rx={r * 0.5} ry={r * 0.35} fill="#f2d4c9" opacity="0.8" />
  </g>
)

/** An arm from the shoulder to the paw: a fat rounded stroke drawn twice, a shade under and the fur on top. */
const arm = (u: (n: string) => string, d: string) => (
  <g>
    <path d={d} stroke="#d3dce6" strokeWidth="30" strokeLinecap="round" fill="none" />
    <path d={d} stroke={u('fur')} strokeWidth="26" strokeLinecap="round" fill="none" />
  </g>
)

/** A plate of hot fried rice, steaming. */
const friedRice = (u: (n: string) => string, x: number, y: number, s = 1): ReactNode => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="56" ry="15" fill={u('plate')} stroke="#c9d3df" strokeWidth="1.5" />
    <ellipse cx="0" cy="6" rx="44" ry="10" fill="#eef2f6" />
    <path d="M-38 6 Q-30 -22 0 -24 Q30 -22 38 6 Q0 14 -38 6 Z" fill={u('rice')} />
    {[[-20, -6], [-8, -14], [6, -10], [18, -2], [-2, 0], [24, -12], [-26, 0]].map(([gx, gy], i) => (
      <ellipse key={i} cx={gx} cy={gy} rx="3.2" ry="1.8" fill="#fff6d6" transform={`rotate(${i * 25} ${gx} ${gy})`} />
    ))}
    {[[-14, -2, '#5cb85c'], [10, -16, '#5cb85c'], [20, 0, '#ff7a3d'], [-6, -18, '#ff7a3d'], [2, -4, '#e8420c']].map(([gx, gy, c], i) => (
      <circle key={i} cx={gx as number} cy={gy as number} r="2.6" fill={c as string} />
    ))}
    <path d="M-48 -8 q-8 -8 0 -16 q8 -8 0 -16 M-60 4 q-6 -6 0 -12 M48 -8 q8 -8 0 -16 q-8 -8 0 -16 M60 4 q6 -6 0 -12" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.85" />
  </g>
)

type Pose = {
  tilt?: number
  hat?: boolean
  behind?: (u: (n: string) => string) => ReactNode
  front: (u: (n: string) => string) => ReactNode
  over?: (u: (n: string) => string) => ReactNode
}

const POSES: Record<BearPose, Pose> = {
  // holding a plate of hot fried rice out in front, both paws
  serve: {
    front: (u) => (
      <g>
        {arm(u, 'M62 150 Q56 172 72 182')}
        {arm(u, 'M178 150 Q184 172 168 182')}
        {friedRice(u, 120, 178)}
        {paw(u, 70, 186)}
        {paw(u, 170, 186)}
      </g>
    ),
  },
  // ordering: phone up by the face, the other paw on the hip
  phone: {
    front: (u) => (
      <g>
        {arm(u, 'M62 152 Q50 186 74 200')}
        {paw(u, 76, 200, 12)}
        {arm(u, 'M176 150 Q200 124 190 98')}
        <g transform="rotate(12 196 84)">
          <rect x="178" y="52" width="38" height="64" rx="9" fill="#1f232a" />
          <rect x="182" y="58" width="30" height="50" rx="5" fill="#fff4ee" />
          <rect x="186" y="64" width="22" height="9" rx="3" fill="#fe551b" />
          <rect x="186" y="78" width="22" height="5" rx="2.5" fill="#ffd2bd" />
          <rect x="186" y="87" width="14" height="5" rx="2.5" fill="#ffd2bd" />
        </g>
        {paw(u, 190, 102, 13)}
      </g>
    ),
    over: () => (
      <g>
        <circle cx="222" cy="40" r="15" fill="#22c55e" />
        <path d="M214 40 l6 6 l10 -11" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    ),
  },
  // cooking: chef's hat, a wok held out with a flip of rice
  cook: {
    hat: true,
    front: (u) => (
      <g>
        {arm(u, 'M62 150 Q60 176 84 182')}
        {arm(u, 'M178 150 Q188 168 182 178')}
        <path d="M150 178 L212 168" stroke="#3a3f47" strokeWidth="8" strokeLinecap="round" />
        <path d="M60 172 Q120 220 176 172 Z" fill="#2f343b" />
        <path d="M66 172 Q120 160 170 172" stroke="#4a5059" strokeWidth="3" fill="none" />
        <path d="M86 170 Q120 150 152 170 Z" fill={u('rice')} />
        {paw(u, 84, 182)}
        {paw(u, 184, 176)}
      </g>
    ),
    over: () => (
      <g>
        {[[92, 150], [108, 144], [132, 146], [148, 152], [120, 140]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="3.4" ry="2" fill="#f6b93b" transform={`rotate(${i * 40} ${x} ${y})`} />
        ))}
        <path d="M70 196 q6 -12 -2 -22 M176 196 q6 -12 -2 -22" stroke="#ff7a3d" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8" />
      </g>
    ),
  },
  // delivering: leaning into the run, the order bag swinging, speed lines
  deliver: {
    tilt: -7,
    behind: (u) => arm(u, 'M60 150 Q34 150 26 128'),
    front: (u) => (
      <g>
        {paw(u, 26, 126, 12)}
        {arm(u, 'M178 150 Q196 176 192 196')}
        <path d="M178 196 q12 -18 28 0" stroke="#d93d08" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="170" y="196" width="46" height="46" rx="8" fill="#fe551b" />
        <rect x="170" y="196" width="46" height="12" rx="6" fill="#ff8f55" />
        <circle cx="193" cy="222" r="8" fill="#fff" />
        {paw(u, 192, 196, 12)}
      </g>
    ),
    over: () => (
      <g stroke="#fe551b" strokeWidth="5" strokeLinecap="round" opacity="0.85">
        <path d="M-6 150 h30 M-14 172 h26 M-4 194 h22" />
      </g>
    ),
  },
  // eating: a bowl held close, chopsticks up, hearts
  eat: {
    front: (u) => (
      <g>
        {arm(u, 'M62 152 Q58 178 82 188')}
        {arm(u, 'M178 152 Q190 140 182 120')}
        <path d="M172 126 L200 70 M182 128 L214 76" stroke="#c98a4b" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M78 176 h84 q-6 34 -42 34 q-36 0 -42 -34 Z" fill="#fe551b" />
        <path d="M84 176 Q120 156 156 176 Z" fill={u('rice')} />
        <path d="M78 176 h84" stroke="#ff8f55" strokeWidth="4" strokeLinecap="round" />
        {paw(u, 82, 190)}
        {paw(u, 182, 122, 12)}
      </g>
    ),
    over: () => (
      <g>
        <path d="M206 30 c-7 -9 -21 -2 -12 9 l12 12 l12 -12 c9 -11 -5 -18 -12 -9 Z" fill="#fe551b" />
        <path d="M30 40 c-5 -6 -14 -1 -8 6 l8 8 l8 -8 c6 -7 -3 -12 -8 -6 Z" fill="#ff9b78" />
        <path d="M212 72 c-4 -5 -10 -1 -6 4 l6 6 l6 -6 c4 -5 -2 -9 -6 -4 Z" fill="#ffb59a" />
      </g>
    ),
  },
  // the seller: one paw up in a hello, the other holding the plate
  wave: {
    front: (u) => (
      <g>
        {arm(u, 'M60 150 Q40 120 48 92')}
        {paw(u, 48, 88, 14)}
        {arm(u, 'M178 152 Q186 176 166 186')}
        {friedRice(u, 150, 182, 0.72)}
        {paw(u, 168, 190)}
      </g>
    ),
    over: () => <path d="M26 74 q-10 6 -12 18 M20 60 q-14 2 -20 12" stroke="#fe551b" strokeWidth="4" strokeLinecap="round" fill="none" />,
  },
}
