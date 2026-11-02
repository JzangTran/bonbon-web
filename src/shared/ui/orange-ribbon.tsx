import { useId } from 'react'
import { cn } from '@/shared/lib/utils'

export type RibbonShape = 'sweep' | 'hook' | 'curl' | 'fold' | 'wave'

/**
 * A wide orange ribbon made of round tubes lying side by side, after the corner ribbons of gitbook.com (drawn here, not their image).
 * Corner shapes (sweep, hook, curl, fold) run in from outside their box, so placed at a page corner they bleed off the edges the way
 * GitBook's does; `wave` is a long one for the middle of a page. Each corner of a page should get a different shape.
 *
 * Every tube is the same path stroked several times, from its outer edge to its middle, dark to light, so each tube reads as round and
 * all of them stay parallel round every bend. Shapes with several pieces are drawn back first, front last, so the ribbon passes over
 * and under itself. Decorative; position and size it with `className`.
 */
export function OrangeRibbon({ className, variant = 'sweep', fade = false }: { className?: string; variant?: RibbonShape; fade?: boolean }) {
  const id = useId().replace(/:/g, '')
  const shape = SHAPES[variant]
  return (
    <svg aria-hidden="true" viewBox={shape.box} fill="none" className={cn('pointer-events-none', className)}>
      <defs>
        <filter id={`${id}-shade`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#a52a00" floodOpacity="0.25" />
        </filter>
        {fade ? (
          <>
            <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="50%">
              <stop offset="0.62" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </radialGradient>
            <mask id={`${id}-mask`} maskContentUnits="objectBoundingBox">
              <rect width="1" height="1" fill={`url(#${id}-fade)`} />
            </mask>
          </>
        ) : null}
      </defs>
      <g mask={fade ? `url(#${id}-mask)` : undefined}>
        {shape.pieces.map((d, i) => (
          <g key={i} filter={`url(#${id}-shade)`} strokeLinecap="round" strokeLinejoin="round">
            {LAYERS.map(([w, color], j) => (
              <path key={j} d={d} stroke={color} strokeWidth={w} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
}

/**
 * The tubes across the ribbon: seven round tubes 18 wide, side by side. Strokes paint inwards (each narrower stroke covers the middle
 * of the one before), so walking from the ribbon's edge to its centre line, each step coloured by how close it is to the centre of its
 * tube, lights every tube along its middle and darkens the creases between them. [stroke width, colour], widest first.
 */
const TUBES = 7
const TUBE = 18
const RAMP = ['#c4380a', '#e84a10', '#ff6224', '#ff8040', '#ffa066']
const LAYERS: [number, string][] = (() => {
  const half = (TUBES * TUBE) / 2
  const out: [number, string][] = []
  for (let x = half; x > 0; x -= 1.5) {
    // distance from the centre line to the nearest tube centre (tubes are centred at 0, 18, 36, …)
    const d = Math.abs(x - Math.round(x / TUBE) * TUBE)
    const light = 1 - d / (TUBE / 2)
    out.push([2 * x, RAMP[Math.min(RAMP.length - 1, Math.floor(light * RAMP.length))]])
  }
  return out
})()

// each: the view box and the pieces, back first; corner shapes enter and leave beyond their box so the page edge cuts them
const SHAPES: Record<RibbonShape, { box: string; pieces: string[] }> = {
  // top right, like gitbook.com: in from the top edge, a long swoop down and out through the right edge
  sweep: {
    box: '0 0 600 560',
    pieces: ['M 60 -120 C 80 120, 220 260, 420 300 C 560 328, 640 260, 700 180'],
  },
  // top left: down from the top, a tight hook that curls back up and leaves through the left edge
  hook: {
    box: '0 0 600 560',
    pieces: ['M 420 -120 C 460 120, 420 330, 250 360 C 110 385, 60 260, 150 200 C 230 150, 160 60, -120 110'],
  },
  // bottom left: up from the bottom edge into a full loop, then out through the left edge (over itself)
  curl: {
    box: '0 0 600 560',
    pieces: [
      'M 380 680 C 360 470, 260 330, 150 330 C 60 330, 40 430, 120 470',
      'M 120 470 C 230 520, 340 400, 300 300 C 260 190, 80 200, -120 260',
    ],
  },
  // bottom right: in from the right edge, folding over itself, and down through the bottom edge
  fold: {
    box: '0 0 600 560',
    pieces: ['M 720 160 C 480 140, 300 220, 330 340', 'M 330 340 C 360 460, 520 420, 480 330 C 440 240, 200 330, 160 680'],
  },
  // the middle: a long, low wave across a whole width
  wave: {
    box: '0 0 1200 360',
    pieces: ['M -120 250 C 140 90, 360 60, 560 170 C 760 280, 940 300, 1320 110'],
  },
}

/**
 * A wide, flat orange band tied in a loose knot, matte, with a few thin red grooves running along it, after a 3D render the owner
 * chose (drawn here and not traced, so it is not the same knot). The light comes from above: a vertical gradient over the whole
 * drawing lights the upper parts of the band, a soft sheen sits on its upper edge, and the pieces passing behind are a shade darker.
 * The band is pieces drawn back first, front last, so it passes over and under itself; its two cut ends stay in view. Decorative.
 */
export function OrangeKnot({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  const g = (name: string) => `url(#${id}-${name})`
  return (
    <svg aria-hidden="true" viewBox="0 -30 1000 520" fill="none" className={cn('pointer-events-none', className)}>
      <defs>
        <linearGradient id={`${id}-front`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="440">
          <stop offset="0" stopColor="#ff9a52" />
          <stop offset="0.5" stopColor="#ff7433" />
          <stop offset="1" stopColor="#ff5a1f" />
        </linearGradient>
        <linearGradient id={`${id}-back`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="440">
          <stop offset="0" stopColor="#ff7f3c" />
          <stop offset="1" stopColor="#ec4a12" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id={`${id}-sheen`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {KNOT.map(({ d, back }, i) => {
        const face = g(back ? 'back' : 'front')
        return (
          <g key={i} strokeLinecap="butt" strokeLinejoin="round">
            <path d={d} stroke="#b83300" strokeOpacity="0.28" strokeWidth={118} transform="translate(0 14)" filter={g('blur')} />
            <path d={d} stroke="#e4440e" strokeWidth={120} />
            <path d={d} stroke={face} strokeWidth={114} />
            {[84, 50, 18].map((w) => (
              <g key={w}>
                <path d={d} stroke="#ee3f3a" strokeOpacity="0.55" strokeWidth={w + 2.4} />
                <path d={d} stroke={face} strokeWidth={w} />
              </g>
            ))}
            {back ? null : <path d={d} stroke="#ffc49a" strokeOpacity="0.35" strokeWidth={34} transform="translate(0 -18)" filter={g('sheen')} />}
          </g>
        )
      })}
    </svg>
  )
}

// the knot: the long tail passing behind first, then the band that comes in from the left, loops over on the right and tucks under
const KNOT = [
  { back: true, d: 'M 520 330 C 430 404, 262 400, 236 322 C 212 248, 330 196, 500 188 C 660 180, 820 214, 968 150' },
  { back: false, d: 'M 32 128 C 230 108, 330 196, 440 290 C 540 372, 730 376, 790 262 C 846 152, 736 64, 650 104 C 568 142, 602 270, 520 330' },
]
