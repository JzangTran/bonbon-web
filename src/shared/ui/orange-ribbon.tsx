import { useId } from 'react'
import { cn } from '@/shared/lib/utils'

export type RibbonShape = 'knot' | 'wave' | 'loop' | 'cross' | 'arc'

/**
 * A thick orange ribbon with grooves along it, after the 3D ribbons of gitbook.com (drawn here, not their image), in several shapes so
 * that each corner of a page gets a different one: a loose knot, a wave, a single loop, two ribbons crossing, a wide arc.
 * The grooves are the same path stroked several times, each narrower and lighter, so they stay parallel round every bend. Each shape is
 * pieces drawn back first, front last, so the ribbon passes over and under itself. Decorative; position it with `className`.
 */
export function OrangeRibbon({ className, variant = 'knot' }: { className?: string; variant?: RibbonShape }) {
  const id = useId().replace(/:/g, '')
  const shape = SHAPES[variant]
  return (
    <svg aria-hidden="true" viewBox={shape.box} fill="none" className={cn('pointer-events-none', className)}>
      <defs>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a66" />
          <stop offset="0.5" stopColor="#fe6a2e" />
          <stop offset="1" stopColor="#f2400a" />
        </linearGradient>
        <filter id={`${id}-shade`} x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#b83200" floodOpacity="0.22" />
        </filter>
        {/* the ends dissolve before the edge of the drawing, so a ribbon never shows a cut end wherever it is placed */}
        <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="50%">
          <stop offset="0.62" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`${id}-mask`} maskContentUnits="objectBoundingBox">
          <rect width="1" height="1" fill={`url(#${id}-fade)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-mask)`}>
      {shape.pieces.map((d, i) => (
        <g key={i} filter={`url(#${id}-shade)`} strokeLinecap={shape.round ? 'round' : 'butt'} strokeLinejoin="round">
          {GROOVES.map(([w, color], j) => (
            <path key={j} d={d} stroke={color === 'light' ? `url(#${id}-light)` : color} strokeWidth={w} />
          ))}
        </g>
      ))}
      </g>
    </svg>
  )
}

/** [stroke width, colour], widest first: a dark edge, then light faces split by thin darker grooves (1.5 px each side). */
const GROOVES: [number, string][] = [
  [92, '#e8420c'],
  [89, 'light'],
  [66, '#f2511a'],
  [63, 'light'],
  [40, '#f2511a'],
  [37, 'light'],
  [14, '#f5581f'],
  [11, 'light'],
]

// each: the view box, and the pieces back first; `round` caps hide the seam where two pieces of one ribbon meet
const SHAPES: Record<RibbonShape, { box: string; pieces: string[]; round?: boolean }> = {
  knot: {
    box: '0 0 1000 460',
    pieces: [
      'M 470 330 C 380 410, 210 400, 195 310 C 182 225, 320 175, 480 165 C 650 155, 820 205, 1040 110',
      'M -40 120 C 190 95, 300 200, 420 300 C 520 382, 705 385, 768 262 C 830 130, 705 40, 618 82 C 540 120, 565 262, 470 330',
    ],
  },
  wave: {
    box: '0 0 1000 320',
    pieces: ['M -40 230 C 120 110, 260 60, 400 140 C 540 220, 660 280, 800 190 C 900 126, 960 80, 1040 70'],
  },
  loop: {
    box: '0 0 700 520',
    round: true,
    pieces: [
      'M -40 420 C 130 420, 270 340, 320 230 C 360 130, 270 60, 200 110',
      'M 200 110 C 120 170, 180 300, 330 310 C 480 320, 600 230, 740 110',
    ],
  },
  cross: {
    box: '0 0 1000 420',
    pieces: ['M -40 330 C 280 340, 560 70, 1040 90', 'M -40 90 C 300 70, 600 340, 1040 320'],
  },
  arc: {
    box: '0 0 800 800',
    pieces: ['M 840 -40 C 480 40, 160 240, 180 500 C 196 720, 520 820, 860 720'],
  },
}
