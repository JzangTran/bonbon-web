import { cn } from '@/shared/lib/utils'

/** Buttons of the public pages: pills, ink for the main action, a pale fill for the second one. */
export const siteButton =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-ui font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-6'
export const siteButtonGreen = cn(siteButton, 'bg-primary text-primary-foreground hover:bg-primary-hover')
