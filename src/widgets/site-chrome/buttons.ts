import { cn } from '@/shared/lib/utils'

/** Buttons of the public pages (the landing page and the site bar share them). */
export const siteButton =
  'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-sm px-6 text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[52px] sm:px-[26px]'
export const siteButtonGreen = cn(siteButton, 'bg-primary text-primary-foreground hover:bg-primary-hover')
