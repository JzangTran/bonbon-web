import { cn } from '@/shared/lib/utils'
import { PolarBear, type BearFace, type BearPose } from './polar-bear'

// rendered pictures of the mascot, one per pose (mascot/<pose>.webp or .png, transparent background); see mascot/README.md
const PICTURES = import.meta.glob<string>('./mascot/*.{webp,png}', { eager: true, query: '?url', import: 'default' })

const pictureOf = (pose: BearPose) => PICTURES[`./mascot/${pose}.webp`] ?? PICTURES[`./mascot/${pose}.png`]

/**
 * The bonbon polar bear in one pose: the rendered 3D picture when one has been added for that pose, otherwise the drawn stand-in.
 * Decorative.
 */
export function Mascot({ pose, face, className }: { pose: BearPose; face?: BearFace; className?: string }) {
  const src = pictureOf(pose)
  if (src) return <img src={src} alt="" aria-hidden="true" decoding="async" className={cn('block h-auto object-contain', className)} />
  return <PolarBear pose={pose} face={face} className={className} />
}
