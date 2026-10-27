import { ArrowLeftIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

/**
 * A page for one task opened from a list (add, edit, write, reply): a link back to the list, the title and a line under it,
 * then the form. Used instead of a dialog so the task has the whole page and its own address.
 */
export function SubPage({ back, title, description, children }: { back: { to: string; label: string }; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link to={back.to} className="flex w-fit items-center gap-1.5 text-ui text-muted-foreground hover:text-ink">
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
        <h1 className="text-h2 font-semibold">{title}</h1>
        {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

/** The buttons at the end of a sub-page form: the main action first on the left, cancelling beside it. */
export function SubPageActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3 pt-2">{children}</div>
}
