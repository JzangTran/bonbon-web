import { cn } from '@/shared/lib/utils'
import { PolarBear, type BearFace, type BearPose } from './polar-bear'

export type BearKind = 'order' | 'cook' | 'deliver' | 'done' | 'shop'

/** What the bear does, and how it feels about it, in each scene. */
const SCENES: Record<BearKind, { pose: BearPose; face: BearFace }> = {
  order: { pose: 'phone', face: 'excited' },
  cook: { pose: 'cook', face: 'focused' },
  deliver: { pose: 'deliver', face: 'happy' },
  done: { pose: 'eat', face: 'blissful' },
  shop: { pose: 'wave', face: 'wink' },
}

/**
 * A small scene with the bonbon polar bear for the landing page: the same bear in a different pose and mood for each step of an
 * order (ordering on the phone, cooking, running the order over, enjoying it) and for the seller's band (waving behind a plate).
 * Decorative.
 */
export function BearScene({ kind, className }: { kind: BearKind; className?: string }) {
  const s = SCENES[kind]
  return (
    <div aria-hidden="true" className={cn('relative', className)}>
      <svg viewBox="0 0 240 200" className="absolute inset-x-0 bottom-0 h-auto w-full">
        <path d="M30 140 C20 80 64 30 122 32 C186 34 222 82 214 138 C208 182 166 200 118 198 C66 196 38 176 30 140 Z" fill="#ffd2bd" opacity="0.55" />
        {[[34, 46], [206, 36], [214, 120], [22, 110]].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill={i % 2 ? '#fe551b' : '#ffb59a'} />
        ))}
      </svg>
      <PolarBear pose={s.pose} face={s.face} className="relative mx-auto w-[78%]" />
    </div>
  )
}
