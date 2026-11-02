import { pictureOf, type MascotPose } from '@/shared/assets/mascot-pictures'
import { cn } from '@/shared/lib/utils'
import { Illustration } from './illustration'
import type { IllustrationName } from './shapes'

/**
 * The bonbon bear for a state screen (empty list, success, error, maintenance), as a rendered picture; the line drawing `fallback`
 * stands in while that picture has not been added. Decorative: hidden from screen readers, the text next to it carries the meaning.
 */
export function MascotArt({ pose, fallback, className }: { pose: MascotPose; fallback: IllustrationName; className?: string }) {
  const src = pictureOf(pose)
  if (!src) return <Illustration name={fallback} className={className} />
  return <img src={src} alt="" aria-hidden="true" draggable={false} className={cn('h-auto w-40 max-w-full select-none', className)} />
}
