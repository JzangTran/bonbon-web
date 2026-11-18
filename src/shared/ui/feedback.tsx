import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { InlineMessage, type MessageTone } from './message'

/**
 * The feedback ladder in code (design v5, design/docs/feedback.md). Screens and mutation hooks call useFeedback() instead of a toast;
 * the message appears in the nearest FeedbackRegion, which sits where the user is looking: the top of the workspace page, the bottom
 * of a dialog or sheet (next to its buttons). Write every message as what happened (title) · what it means and what next (body).
 *
 * A region in a dialog takes only errors and warnings: a success usually closes the dialog, so it goes up to the page's region and
 * stays visible there. With no region at all (a page outside the shells) the message falls back to a snackbar.
 */
type Message = { tone: MessageTone; title: string; body?: ReactNode; action?: ReactNode }
type RegionApi = { show: (message: Message) => void; clear: () => void }

const RegionContext = createContext<RegionApi | null>(null)

/**
 * Carry-over: a screen often saves and then goes back or away at once, which unmounts its region with the fresh message in it. The
 * host keeps the mounted page regions in order; when one goes away holding a message under 3 s old, the message moves to the region
 * still open on top (the screen the user returns to) or waits for the next one that opens (a route change).
 */
type Delivered = Message & { at: number }
type Host = { register: (region: RegionApi) => void; unregister: (region: RegionApi, fresh: Delivered | null) => void }
const HostContext = createContext<Host | null>(null)

export function FeedbackHost({ children }: { children: ReactNode }) {
  const regions = useRef<RegionApi[]>([])
  const pending = useRef<Delivered | null>(null)
  const host = useMemo<Host>(
    () => ({
      register: (region) => {
        regions.current.push(region)
        const waiting = pending.current
        pending.current = null
        if (waiting && Date.now() - waiting.at < 5000) region.show(waiting)
      },
      unregister: (region, fresh) => {
        regions.current = regions.current.filter((r) => r !== region)
        if (!fresh || Date.now() - fresh.at > 3000) return
        const next = regions.current[regions.current.length - 1]
        if (next) next.show(fresh)
        else pending.current = fresh
      },
    }),
    [],
  )
  return <HostContext value={host}>{children}</HostContext>
}

export function FeedbackRegion({
  children,
  placement = 'top',
  errorsOnly = false,
  className,
}: {
  children: ReactNode
  /** where the message shows relative to the content: top of a page, bottom of a dialog (next to its buttons) */
  placement?: 'top' | 'bottom'
  /** dialogs and sheets: successes go up to the page */
  errorsOnly?: boolean
  className?: string
}) {
  const parent = useContext(RegionContext)
  const host = useContext(HostContext)
  const latest = useRef<Delivered | null>(null)
  const [message, setMessage] = useState<(Message & { id: number }) | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const seq = useRef(0)

  const api = useMemo<RegionApi>(
    () => ({
      show: (m) => {
        if (errorsOnly && (m.tone === 'success' || m.tone === 'info') && parent) {
          parent.show(m)
          return
        }
        seq.current += 1
        latest.current = { ...m, at: Date.now() }
        setMessage({ ...m, id: seq.current })
      },
      clear: () => setMessage(null),
    }),
    [errorsOnly, parent],
  )

  useEffect(() => {
    if (!host || errorsOnly) return
    host.register(api)
    return () => host.unregister(api, latest.current)
  }, [host, api, errorsOnly])

  useEffect(() => {
    if (!message) return
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ref.current?.scrollIntoView?.({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
  }, [message])

  const el = message ? (
    <div ref={ref} data-slot="feedback-region" className={cn(placement === 'top' ? 'mb-4' : 'mt-1', className)}>
      <InlineMessage key={message.id} tone={message.tone} title={message.title} action={message.action} onDismiss={() => setMessage(null)}>
        {message.body}
      </InlineMessage>
    </div>
  ) : null

  return (
    <RegionContext value={api}>
      {placement === 'top' ? el : null}
      {children}
      {placement === 'bottom' ? el : null}
    </RegionContext>
  )
}

export type Feedback = {
  /** what happened, then what it means / what next */
  success: (title: string, body?: ReactNode, action?: ReactNode) => void
  info: (title: string, body?: ReactNode, action?: ReactNode) => void
  warning: (title: string, body?: ReactNode, action?: ReactNode) => void
  /** an API problem (its own sentence is used) or a sentence of your own */
  error: (problemOrTitle: unknown, body?: ReactNode, action?: ReactNode) => void
  clear: () => void
}

/**
 * A message written as one string, "Đã lưu nháp lúc 14:02. Khách chưa thấy món này…", shows its first sentence as the title and the
 * rest as the body, so call sites can keep passing one translated sentence pair.
 */
export function splitMessage(text: string): { title: string; body?: string } {
  const m = /^(.+?[.;!?])\s+(\S[\s\S]*)$/.exec(text.trim())
  return m ? { title: m[1].replace(/[.;]$/, ''), body: m[2] } : { title: text.trim().replace(/\.$/, '') }
}

export function useFeedback(): Feedback {
  const region = useContext(RegionContext)
  const show = useCallback(
    (raw: Message) => {
      const m = raw.body === undefined ? { ...raw, ...splitMessage(raw.title) } : raw
      if (region) return region.show(m)
      // outside every region: a snackbar is the only place left
      const text = typeof m.body === 'string' ? `${m.title} ${m.body}` : m.title
      if (m.tone === 'danger') toast.error(text)
      else toast(text)
    },
    [region],
  )
  return useMemo(
    () => ({
      success: (title, body, action) => show({ tone: 'success', title, body, action }),
      info: (title, body, action) => show({ tone: 'info', title, body, action }),
      warning: (title, body, action) => show({ tone: 'warning', title, body, action }),
      error: (problemOrTitle, body, action) =>
        show({ tone: 'danger', title: typeof problemOrTitle === 'string' ? problemOrTitle : problemMessage(problemOrTitle), body, action }),
      clear: () => region?.clear(),
    }),
    [show, region],
  )
}
