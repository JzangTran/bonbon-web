import { cn } from '@/shared/lib/utils'
import lockupColor from '@/shared/assets/brand/bonbon-lockup-color.svg'
import lockupWhite from '@/shared/assets/brand/bonbon-lockup-white.svg'
import markColor from '@/shared/assets/brand/bonbon-mark-color.svg'

/** The bonbon logo as a line: the face and the drawn wordmark side by side. `white` is for dark bars, `color` for light ground. */
export function Lockup({ tone = 'color', className }: { tone?: 'color' | 'white'; className?: string }) {
  return <img src={tone === 'white' ? lockupWhite : lockupColor} alt="bonbon" className={cn('h-8 w-auto', className)} />
}

/** The bonbon face alone, for small places (the sign-in pages, favicons). */
export function Mark({ className }: { className?: string }) {
  return <img src={markColor} alt="" aria-hidden="true" className={cn('h-8 w-auto', className)} />
}
