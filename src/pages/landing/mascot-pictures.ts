import type { BearPose } from './polar-bear'

// rendered pictures of the mascot, one per pose (mascot/<pose>.webp, transparent background); see mascot/README.md
const PICTURES = import.meta.glob<string>('./mascot/*.webp', { eager: true, query: '?url', import: 'default' })

/** The rendered picture for a pose, when one has been added. */
export const pictureOf = (pose: BearPose): string | undefined => PICTURES[`./mascot/${pose}.webp`]
