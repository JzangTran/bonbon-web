import { CheckIcon, CodeIcon, XIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { t } from '@/shared/i18n'

/** The grey stage a live sample sits on, centred, like the Fluent 2 docs. */
export function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex min-h-48 flex-wrap items-center justify-center gap-3 rounded-xl bg-grey-100 p-8', className)}>{children}</div>
}

/** The live example at the top of a component page, with its code one click away. */
export function Example({ children, code }: { children: ReactNode; code: string }) {
  const [open, setOpen] = useState(false)
  return (
    <figure className="overflow-hidden rounded-xl border border-grey-200">
      <div className="flex min-h-48 flex-wrap items-center justify-center gap-3 bg-white p-8">{children}</div>
      <figcaption className="bg-ink text-white">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-2 px-4 py-3 text-ui outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <CodeIcon className="size-4" aria-hidden="true" />
          {open ? t('Ẩn mã') : t('Xem mã')}
        </button>
        {open ? (
          <pre className="overflow-x-auto border-t border-white/10 px-4 py-4 font-mono text-small leading-6 text-white/90">
            <code>{code}</code>
          </pre>
        ) : null}
      </figcaption>
    </figure>
  )
}

/** One variant of a component: its sample on a small stage, its name and when to pick it. */
export function Variant({ name, children, demo }: { name: string; children: ReactNode; demo: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Stage className="min-h-36">{demo}</Stage>
      <h3 className="text-body font-medium">{name}</h3>
      <p className="text-body text-ink">{children}</p>
    </div>
  )
}

/** A do or a don't: the sample with a green tick or a red cross, and the caption in the same colour. */
export function Rule({ ok, caption, children }: { ok: boolean; caption: string; children: ReactNode }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative">
        <span
          aria-hidden="true"
          className={cn('absolute top-4 left-4 flex size-6 items-center justify-center rounded-full text-white', ok ? 'bg-success' : 'bg-destructive')}
        >
          {ok ? <CheckIcon className="size-4" strokeWidth={3} /> : <XIcon className="size-4" strokeWidth={3} />}
        </span>
        <Stage>{children}</Stage>
      </div>
      <figcaption className={cn('text-ui font-medium', ok ? 'text-success-fg' : 'text-danger-fg')}>
        <span className="sr-only">{ok ? t('Nên: ') : t('Không nên: ')}</span>
        {caption}
      </figcaption>
    </figure>
  )
}

/** A titled block of explanation inside a section. */
export function Point({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {title ? <h3 className="text-h3 font-medium">{title}</h3> : null}
      <div className="flex flex-col gap-3 text-body text-ink">{children}</div>
    </div>
  )
}
