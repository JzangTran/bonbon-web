import { cn } from '@/shared/lib/utils'

/** Buttons of the public pages: pills, ink for the main action, a pale fill for the second one. */
export const siteButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.9375rem] font-semibold outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-6'
export const siteButtonGreen = cn(siteButton, 'bg-ink text-white hover:bg-ink/85')
