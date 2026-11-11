import type { LucideIcon } from 'lucide-react'

export type NavChild = { to: string; label: string }

/**
 * A parent row of the left nav. With `children` it is a group (expand/collapse); with `to` instead it is a
 * single page. `defaultOpen` is how a group starts for someone who never opened or closed it.
 */
export type NavParent = {
  key: string
  label: string
  icon: LucideIcon
  to?: string
  children?: NavChild[]
  defaultOpen?: boolean
}

/** A page that has no row in the nav (reached from the account menu, the footer or a link): only its breadcrumb is known. */
export type ExtraPage = {
  to: string
  label: string
  parentKey?: string
  /** the `to` of the nav row this page is a tab of: that row stays selected and is the breadcrumb */
  under?: string
}

/**
 * A part of the workspace with its own navigation, shown as a tab under the header (after the GitBook docs tabs): the seller's
 * selling channel and settings, or the administrator's operations, content and settings.
 */
export type Space = {
  key: string
  label: string
  icon: LucideIcon
  nav: NavParent[]
  extras?: ExtraPage[]
}

/** A row of the account menu; `external` links go to another bonbon site (the help center). */
export type AccountLink = { to: string; label: string; external?: boolean }
export type FooterLink = { to: string; label: string; external?: boolean }
