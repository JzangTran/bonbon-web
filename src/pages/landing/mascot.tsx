import { cn } from '@/shared/lib/utils'
import { pictureOf } from './mascot-pictures'
import { PolarBear, type BearFace, type BearPose } from './polar-bear'


/**
 * The bonbon polar bear in one pose: the rendered 3D picture when one has been added for that pose, otherwise the drawn stand-in.
 * Decorative.
 */
export function Mascot({ pose, face, className }: { pose: BearPose; face?: BearFace; className?: string }) {
  const src = pictureOf(pose)
  if (src) return <img src={src} alt="" aria-hidden="true" decoding="async" className={cn('block h-auto object-contain', className)} />
  return <PolarBear pose={pose} face={face} className={className} />
}
