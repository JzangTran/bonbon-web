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
