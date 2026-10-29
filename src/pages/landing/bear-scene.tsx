import type { ReactNode } from 'react'
import markSvg from '@/shared/assets/brand/bonbon-mark-color.svg?raw'
import { cn } from '@/shared/lib/utils'

export type BearKind = 'order' | 'cook' | 'deliver' | 'done' | 'shop'

const INK = '#1d1d1d'
const ORANGE = '#fe551b'
const DEEP = '#e8420c'
const PALE = '#ffe3d4'
const BLUSH = '#ffc4a8'
const line = { stroke: INK, strokeWidth: 3.2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

// the bear of the logo itself (Streamline Freehand "Saving Bear Market", CC BY 4.0), read from the logo file so the two never differ
const BEAR_PATHS = [...(markSvg.match(/<g transform="[^"]*"[^>]*>([\s\S]*?)<\/g>/)?.[1] ?? '').matchAll(/ d="([^"]+)"/g)].map((m) => m[1])

/**
 * Where the logo bear sits in every scene (scene units, 240 × 200): 7.2 times its 24-unit drawing, so its raised front paw is at about
 * (188, 83), the top of its head at (131, 22), its snout at (194, 36) and its feet on the line y = 187.
 */
const BEAR_AT = 'translate(30 18) scale(7.2)'

/** The torso and head the outline wraps, in the bear's own 24 units: filled in pale orange a little off the line, the freehand way. */
const BODY = 'M3 22.5 C1 18 0.8 13 3 10 C5 7 9 6.5 11.5 5 C13 4 15 2 18 2.2 C20.5 2.5 21.5 3.5 20.5 5 C19 7 17.5 8 17 10 C16.5 12.5 18.5 14 19 15.5 C17 16 14 15.5 13 18 C12.5 20 12 22.5 11 23 C8 23.5 5 23.5 3 22.5 Z'

function LogoBear({ tilt = 0 }: { tilt?: number }) {
  return (
    <g transform={tilt ? `rotate(${tilt} 110 187)` : undefined}>
      <g transform={BEAR_AT}>
        <path d={BODY} fill={PALE} transform="translate(0.7 0.6)" />
        {BEAR_PATHS.map((d, i) => (
          <path key={i} d={d} fill={INK} fillRule="evenodd" clipRule="evenodd" />
        ))}
      </g>
    </g>
  )
}

/** Short orange strokes around a figure, the "it is happening" marks of a hand drawing. */
function Sparks({ at }: { at: [number, number][] }) {
  return (
    <g stroke={ORANGE} strokeWidth={3} strokeLinecap="round">
      {at.map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} l6 -6 M${x + 10} ${y + 2} l8 0 M${x - 2} ${y + 10} l-6 6`} opacity={0.9} />
      ))}
    </g>
  )
}

/** What the bear does in each scene: [drawn behind the bear (held things the paw wraps), drawn in front]. */
const ACTIONS: Record<Exclude<BearKind, 'shop'>, { tilt?: number; behind: ReactNode; front: ReactNode }> = {
  // ordering: a phone in the raised paw, an order confirmed
  order: {
    behind: (
      <g transform="rotate(14 200 70)">
        <rect x="184" y="40" width="34" height="58" rx="7" fill="#fff" {...line} />
        <rect x="190" y="50" width="22" height="8" rx="3" fill={ORANGE} />
        <rect x="190" y="63" width="22" height="5" rx="2.5" fill={PALE} />
        <rect x="190" y="72" width="14" height="5" rx="2.5" fill={PALE} />
      </g>
    ),
    front: (
      <g>
        <circle cx="222" cy="30" r="13" fill={ORANGE} />
        <path d="M215 30 l5 5 l9 -10" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    ),
  },
  // cooking: a chef's hat, a pan in the paw, steam
  cook: {
    behind: (
      <g>
        <path d="M184 86 L206 82" fill="none" {...line} />
        <path d="M202 80 h40 q-2 20 -20 20 q-18 0 -20 -20 Z" fill={ORANGE} {...line} />
        <circle cx="214" cy="76" r="4" fill={DEEP} />
        <circle cx="226" cy="74" r="3.5" fill="#fff" stroke={INK} strokeWidth={2} />
        <path d="M212 62 q-5 -7 0 -13 q5 -6 0 -12 M228 60 q-5 -7 0 -13 q5 -6 0 -12" stroke="#a3a3a3" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </g>
    ),
    front: (
      <g transform="rotate(-12 150 14)">
        <path d="M128 22 q-10 -14 4 -20 q4 -12 18 -8 q12 -8 20 4 q14 2 6 18 Z" fill="#fff" {...line} />
        <path d="M130 22 h44 v8 h-44 Z" fill="#fff" {...line} />
      </g>
    ),
  },
  // delivering: leaning into the walk, the order bag swinging from the paw, speed lines behind
  deliver: {
    tilt: 6,
    behind: (
      <g>
        <path d="M184 86 q4 -10 14 -8 q8 2 6 12" fill="none" {...line} />
        <path d="M174 92 h40 l-4 40 h-32 Z" fill={ORANGE} {...line} />
        <circle cx="194" cy="110" r="6" fill="#fff" />
      </g>
    ),
    front: (
      <g stroke={ORANGE} strokeWidth={3.4} strokeLinecap="round">
        <path d="M6 96 h26 M0 112 h22 M10 128 h20" />
      </g>
    ),
  },
  // done: a warm bowl held close, hearts
  done: {
    behind: (
      <g>
        <path d="M200 58 L222 90 M210 54 L228 88" fill="none" {...line} strokeWidth={2.6} />
        <path d="M176 86 q4 -6 0 -12 M190 82 q4 -6 0 -12" stroke="#a3a3a3" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </g>
    ),
    front: (
      <g>
        <path d="M168 92 q24 -18 48 0" fill="#fff" {...line} />
        <path d="M164 92 h56 q-4 28 -28 28 q-24 0 -28 -28 Z" fill={ORANGE} {...line} />
        <path d="M214 30 c-6 -8 -18 -2 -10 8 l10 10 l10 -10 c8 -10 -4 -16 -10 -8 Z" fill={ORANGE} />
        <path d="M60 30 c-4 -5 -12 -1 -7 5 l7 7 l7 -7 c5 -6 -3 -10 -7 -5 Z" fill={BLUSH} />
      </g>
    ),
  },
}

/**
 * A scene with the bonbon bear for the landing page: the bear of the logo, in its own freehand line, doing what each step of an order
 * needs (ordering on the phone, cooking, carrying the order, enjoying it, or serving at the shop counter), on a pale orange ground.
 * Decorative.
 */
export function BearScene({ kind, className }: { kind: BearKind; className?: string }) {
  if (kind === 'shop') return <ShopScene className={className} />
  return (
    <svg aria-hidden="true" viewBox="0 0 240 200" className={cn('block h-auto w-full', className)}>
      <path d="M40 120 C30 70 70 34 122 36 C178 38 214 76 206 128 C200 170 160 192 116 188 C70 184 46 160 40 120 Z" fill={PALE} opacity={0.6} />
      <ellipse cx="112" cy="190" rx="66" ry="6" fill="#fbcdb5" />
      {/* a little smaller than the ground, so hats and hearts stay inside the frame */}
      <g transform="translate(120 192) scale(0.86) translate(-120 -192)">
        <BearFigure kind={kind} />
        {kind === 'done' ? <Sparks at={[[30, 70]]} /> : null}
      </g>
    </svg>
  )
}

/** The bear and what it holds, without the ground: for placing inside a larger drawing with a transform. */
export function BearFigure({ kind }: { kind: Exclude<BearKind, 'shop'> }) {
  const a = ACTIONS[kind]
  return (
    <g>
      {a.tilt ? <g transform={`rotate(${a.tilt} 110 187)`}>{a.behind}</g> : a.behind}
      <LogoBear tilt={a.tilt} />
      {a.front}
    </g>
  )
}

/** The seller's scene: the bear behind its own counter under a striped awning, holding a bowl out to a neighbour. */
function ShopScene({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 200" className={cn('block h-auto w-full', className)}>
      {/* awning */}
      <path d="M14 18 h212 v22 h-212 Z" fill="#fff" {...line} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${14 + i * 36} 18 h18 v22 h-18 Z`} fill={ORANGE} />
      ))}
      <path d="M14 40 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0 q9 11 18 0" fill="#fff" {...line} />
      {/* the bear, smaller and lower so it stands under the awning, holding a bowl out over the counter */}
      <g transform="translate(36 52) scale(6.1)">
        <path d={BODY} fill={PALE} transform="translate(0.7 0.6)" />
        {BEAR_PATHS.map((d, i) => (
          <path key={i} d={d} fill={INK} fillRule="evenodd" clipRule="evenodd" />
        ))}
      </g>
      <path d="M166 104 q24 -18 48 0" fill="#fff" {...line} />
      <path d="M162 104 h56 q-4 26 -28 26 q-24 0 -28 -26 Z" fill="#fff" {...line} />
      <path d="M180 92 q4 -6 0 -12 M196 90 q4 -6 0 -12" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" fill="none" />
      {/* counter */}
      <rect x="10" y="150" width="220" height="46" rx="8" fill="#fff" {...line} />
      <rect x="86" y="164" width="68" height="16" rx="8" fill={ORANGE} />
    </svg>
  )
}
