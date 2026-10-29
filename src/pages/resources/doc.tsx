import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Rule } from './components/parts'

/**
 * One page of the guidelines, written the way the Fluent 2 docs are: a definition and why it matters, then sections whose headings say
 * what to do, short paragraphs, lists, comparison tables, do and don't pairs, a one-line rule closing a section, and a key takeaway.
 */
export type ResourceDoc = {
  title: string
  /** what it is and why it matters, one or two sentences */
  summary: string
  sections: { id: string; title: string; body: ReactNode }[]
  takeaway?: string
}

// ---------------------------------------------------------------- the blocks a page is written with

export function P({ children }: { children: ReactNode }) {
  return <p className="text-body text-ink">{children}</p>
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-h3 font-semibold">{children}</h3>
}

/** The sentence that closes a section: the rule to remember. */
export function Principle({ children }: { children: ReactNode }) {
  return <p className="border-l-2 border-primary pl-4 text-body font-medium text-ink">{children}</p>
}

export function List({ title, items, ordered = false }: { title?: string; items: ReactNode[]; ordered?: boolean }) {
  const Tag = ordered ? 'ol' : 'ul'
  return (
    <div className="flex flex-col gap-2">
      {title ? <p className="text-body text-ink">{title}</p> : null}
      <Tag className={cn('flex flex-col gap-1.5 pl-5 text-body text-ink', ordered ? 'list-decimal' : 'list-disc marker:text-primary')}>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </Tag>
    </div>
  )
}

/** A comparison table: the first column names the thing, the others say what it is for. */
export function DataTable({ head, rows, caption }: { head: string[]; rows: ReactNode[][]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-grey-200">
      <table className="w-full min-w-[32rem] text-left text-ui">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-beige-50">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-grey-200 align-top">
              {r.map((cell, j) => (
                <td key={j} className={cn('px-4 py-3 text-ink', j === 0 && 'font-medium')}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Do and don't, side by side. */
export function Rules({ items }: { items: { ok: boolean; caption: string; demo: ReactNode }[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((r) => (
        <Rule key={r.caption} ok={r.ok} caption={r.caption}>
          {r.demo}
        </Rule>
      ))}
    </div>
  )
}

/** A "Do:" or "Don't:" line for writing, where a sample would only repeat the words. */
export function Say({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <p className={cn('text-body', ok ? 'text-success-fg' : 'text-danger-fg')}>
      <span className="font-semibold">{ok ? 'Do: ' : "Don't: "}</span>
      <span className="text-ink">{children}</span>
    </p>
  )
}

export function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-ink px-4 py-4 font-mono text-small leading-6 text-white/90">
      <code>{children}</code>
    </pre>
  )
}

/** Inline code: a token, a class, a file. */
export function C({ children }: { children: ReactNode }) {
  return <code className="rounded-xs bg-grey-100 px-1 py-0.5 font-mono text-[0.875em]">{children}</code>
}
