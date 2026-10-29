import { useId } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * A thick orange ribbon tied in a loose knot, with grooves along it, after the 3D ribbons of gitbook.com (drawn here, not their image).
 * The grooves are the same path stroked several times, each narrower and lighter, so they stay parallel round every bend. The ribbon
 * is two pieces drawn back first, then front, so it passes over and under itself. Decorative; position it with `className`.
 */
export function OrangeRibbon({ className, variant = 'knot' }: { className?: string; variant?: 'knot' | 'wave' }) {
  const id = useId().replace(/:/g, '')
  const pieces = variant === 'knot' ? KNOT : WAVE
  return (
    <svg aria-hidden="true" viewBox={variant === 'knot' ? '0 0 1000 460' : '0 0 1000 300'} fill="none" className={cn('pointer-events-none', className)}>
      <defs>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a66" />
          <stop offset="0.5" stopColor="#fe6a2e" />
          <stop offset="1" stopColor="#f2400a" />
        </linearGradient>
        <filter id={`${id}-shade`} x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#b83200" floodOpacity="0.22" />
        </filter>
      </defs>
      {pieces.map((d, i) => (
        <g key={i} filter={`url(#${id}-shade)`} strokeLinecap="butt" strokeLinejoin="round">
          {GROOVES.map(([w, color], j) => (
            <path key={j} d={d} stroke={color === 'light' ? `url(#${id}-light)` : color} strokeWidth={w} />
          ))}
        </g>
      ))}
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

// back piece first, front piece second
const KNOT = [
  'M 470 330 C 380 410, 210 400, 195 310 C 182 225, 320 175, 480 165 C 650 155, 820 205, 1040 110',
  'M -40 120 C 190 95, 300 200, 420 300 C 520 382, 705 385, 768 262 C 830 130, 705 40, 618 82 C 540 120, 565 262, 470 330',
]

const WAVE = ['M -40 210 C 160 120, 300 90, 470 160 C 640 230, 790 250, 1040 90']
