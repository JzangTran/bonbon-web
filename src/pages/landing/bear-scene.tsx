import { cn } from '@/shared/lib/utils'

export type BearKind = 'order' | 'cook' | 'deliver' | 'done' | 'shop'

const INK = '#1d1d1d'
const ORANGE = '#fe551b'
const PALE = '#ffe3d4'
const line = { stroke: INK, strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** The bonbon bear, drawn in the line style of the logo: round head, small ears, dot eyes, a snout. `happy` closes the eyes in a smile. */
function Bear({ happy = false }: { happy?: boolean }) {
  return (
    <g>
      {/* body */}
      <path d="M78 200 C78 150 96 132 120 132 C144 132 162 150 162 200" fill="#fff" {...line} />
      {/* ears */}
      <circle cx="87" cy="56" r="12" fill="#fff" {...line} />
      <circle cx="153" cy="56" r="12" fill="#fff" {...line} />
      <circle cx="87" cy="56" r="5" fill={PALE} />
      <circle cx="153" cy="56" r="5" fill={PALE} />
      {/* head */}
      <ellipse cx="120" cy="92" rx="46" ry="42" fill="#fff" {...line} />
      {/* cheeks */}
      <circle cx="94" cy="104" r="6" fill={PALE} />
      <circle cx="146" cy="104" r="6" fill={PALE} />
      {/* eyes */}
      {happy ? (
        <>
          <path d="M101 88 q5 -6 10 0" fill="none" {...line} />
          <path d="M129 88 q5 -6 10 0" fill="none" {...line} />
        </>
      ) : (
        <>
          <circle cx="106" cy="87" r="3.5" fill={INK} />
          <circle cx="134" cy="87" r="3.5" fill={INK} />
          <path d="M100 78 q6 -4 12 0" fill="none" {...line} strokeWidth={2.5} />
          <path d="M128 78 q6 -4 12 0" fill="none" {...line} strokeWidth={2.5} />
        </>
      )}
      {/* snout */}
      <ellipse cx="120" cy="104" rx="14" ry="10" fill="#fff" {...line} strokeWidth={2.5} />
      <ellipse cx="120" cy="100" rx="5" ry="3.5" fill={INK} />
      <path d="M115 108 q2.5 3 5 0 q2.5 3 5 0" fill="none" {...line} strokeWidth={2} />
    </g>
  )
}

function Paw({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="9" fill="#fff" {...line} strokeWidth={2.5} />
}

function Props({ kind }: { kind: BearKind }) {
  switch (kind) {
    case 'order':
      return (
        <g>
          <g transform="rotate(-10 172 150)">
            <rect x="152" y="112" width="42" height="72" rx="8" fill="#fff" {...line} />
            <rect x="158" y="122" width="30" height="10" rx="3" fill={ORANGE} />
            <rect x="158" y="138" width="30" height="5" rx="2.5" fill={PALE} />
            <rect x="158" y="148" width="22" height="5" rx="2.5" fill={PALE} />
            <rect x="158" y="164" width="30" height="10" rx="5" fill={ORANGE} />
          </g>
          <Paw x={156} y={168} />
          <g transform="translate(176 52)">
            <circle r="16" fill={ORANGE} />
            <path d="M-7 0 l5 5 l9 -10" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )
    case 'cook':
      return (
        <g>
          {/* chef hat */}
          <path d="M92 58 C80 52 82 30 100 32 C104 18 136 18 140 32 C158 30 160 52 148 58 Z" fill="#fff" {...line} />
          <rect x="94" y="54" width="52" height="12" rx="3" fill="#fff" {...line} />
          {/* steam */}
          <path d="M104 132 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#a3a3a3" strokeWidth={2.5} strokeLinecap="round" transform="translate(-34 20)" />
          <path d="M104 132 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#a3a3a3" strokeWidth={2.5} strokeLinecap="round" transform="translate(84 16)" />
          {/* pot */}
          <path d="M80 160 h80 v22 a12 12 0 0 1 -12 12 h-56 a12 12 0 0 1 -12 -12 Z" fill={ORANGE} {...line} />
          <rect x="74" y="152" width="92" height="10" rx="5" fill="#fff" {...line} />
          <path d="M80 170 h-10 M160 170 h10" {...line} />
          <Paw x={92} y={150} />
          <Paw x={148} y={150} />
        </g>
      )
    case 'deliver':
      return (
        <g>
          {/* cap */}
          <path d="M80 72 C80 40 160 40 160 72 Z" fill={ORANGE} {...line} />
          <path d="M156 70 h22" {...line} strokeWidth={4} />
          {/* speed lines */}
          <path d="M20 120 h34 M30 140 h28 M16 160 h40" stroke={ORANGE} strokeWidth={3} strokeLinecap="round" />
          {/* bag */}
          <path d="M140 150 h44 l-4 44 h-36 Z" fill={PALE} {...line} />
          <path d="M152 150 v-8 a10 10 0 0 1 20 0 v8" fill="none" {...line} />
          <circle cx="162" cy="172" r="7" fill={ORANGE} />
          <Paw x={146} y={156} />
        </g>
      )
    case 'done':
      return (
        <g>
          {/* hearts */}
          <path d="M44 62 c-6 -10 -20 -2 -12 8 l12 12 l12 -12 c8 -10 -6 -18 -12 -8 Z" fill={ORANGE} />
          <path d="M192 44 c-4 -7 -14 -1 -8 5 l8 8 l8 -8 c6 -6 -4 -12 -8 -5 Z" fill={ORANGE} opacity={0.6} />
          {/* bowl with noodles and chopsticks */}
          <path d="M160 128 l26 -34 M168 132 l28 -30" {...line} />
          <path d="M82 150 h76 a38 32 0 0 1 -76 0 Z" fill={ORANGE} {...line} />
          <path d="M92 150 q8 -10 16 0 q8 -10 16 0 q8 -10 16 0 q8 -10 16 0" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
          <Paw x={84} y={160} />
          <Paw x={156} y={160} />
        </g>
      )
    case 'shop':
      return (
        <g>
          {/* awning */}
          <path d="M20 24 h200 v24 h-200 Z" fill="#fff" {...line} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${20 + i * 40} 24 h20 v24 h-20 Z`} fill={ORANGE} />
          ))}
          <path d="M20 48 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0 q10 12 20 0" fill="#fff" {...line} />
        </g>
      )
  }
}

/**
 * A small scene with the bonbon bear, for the landing page: ordering on the phone, cooking, carrying the order, enjoying the meal,
 * or standing at the shop counter. Line drawing in ink with orange, on a pale orange ground. Decorative.
 */
export function BearScene({ kind, className }: { kind: BearKind; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 200" className={cn('block h-auto w-full', className)}>
      {kind !== 'shop' ? <circle cx="120" cy="112" r="78" fill={PALE} opacity={0.55} /> : null}
      {kind === 'shop' ? <Props kind="shop" /> : null}
      <Bear happy={kind === 'done'} />
      {kind === 'shop' ? (
        <>
          <rect x="16" y="160" width="208" height="40" rx="6" fill="#fff" {...line} />
          <rect x="88" y="172" width="64" height="16" rx="8" fill={ORANGE} />
          <path d="M40 146 h36 a18 14 0 0 1 -36 0 Z" fill={PALE} {...line} strokeWidth={2.5} />
          <path d="M50 136 q-4 -6 0 -12 M62 136 q-4 -6 0 -12" fill="none" stroke="#a3a3a3" strokeWidth={2} strokeLinecap="round" />
          <Paw x={100} y={158} />
          <Paw x={140} y={158} />
        </>
      ) : (
        <Props kind={kind} />
      )}
    </svg>
  )
}
