import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { InlineMessage, type MessageTone } from './message'

/**
 * The feedback ladder in code (design v5, design/docs/feedback.md), the same model as the mobile app. Screens and mutation hooks call
 * useFeedback() instead of a toast; the message appears in a FeedbackRegion where the user is looking: the top of the workspace page,
 * the focus frame, the bottom of a dialog or sheet next to its buttons.
 *
 * Which region: the FeedbackHost keeps the open regions as layers. A message goes to the top layer that takes it: a region nested in
 * another is above it (the dialog over its page), otherwise the one opened last. It does not depend on where useFeedback() is called,
 * so a component that renders its own <Dialog> still reaches the dialog. A dialog takes only errors and warnings: a success usually
 * closes it, so it lands on the page and stays visible there. Carry-over: when a layer goes away holding a message under 3 s old
 * (save, then navigate), the message moves to the layer below or waits 5 s for the next page's. Without any layer: a snackbar.
 *
 * Write every message as "what happened. What it means / what next."; the first sentence becomes the title, the rest the body.
 */
type Message = { tone: MessageTone; title: string; body?: ReactNode; action?: ReactNode }
type RegionApi = { show: (message: Message) => void; clear: () => void }
type Delivered = Message & { at: number }
type Layer = { api: RegionApi; errorsOnly: boolean; parent: RegionApi | null; stamp: number }
type Host = {
  register: (layer: Omit<Layer, 'stamp'>) => void
  unregister: (api: RegionApi, fresh: Delivered | null) => void
  show: (message: Message) => boolean
  clear: () => void
}

const RegionContext = createContext<RegionApi | null>(null)
const HostContext = createContext<Host | null>(null)

const takes = (layer: Layer, m: Message) => !(layer.errorsOnly && (m.tone === 'success' || m.tone === 'info'))

export function FeedbackHost({ children }: { children: ReactNode }) {
  const layers = useRef<Layer[]>([])
  const pending = useRef<Delivered | null>(null)
  const clock = useRef(0)
  const host = useMemo<Host>(() => {
    /** the layer opened last that takes the message, then its deepest open child that takes it too */
    const topFor = (m: Message): Layer | undefined => {
      const byRecency = [...layers.current].sort((a, b) => b.stamp - a.stamp)
      let best = byRecency.find((l) => takes(l, m))
      while (best) {
        const parent = best.api
        const child = byRecency.find((l) => l.parent === parent && takes(l, m))
        if (!child) break
        best = child
      }
      return best
    }
    const showOn = (m: Message) => {
      const layer = topFor(m)
      layer?.api.show(m)
      return !!layer
    }
    return {
      register: (entry) => {
        clock.current += 1
        const layer = { ...entry, stamp: clock.current }
        layers.current = [...layers.current, layer]
        const waiting = pending.current
        if (waiting && Date.now() - waiting.at < 5000 && takes(layer, waiting)) {
          pending.current = null
          layer.api.show(waiting)
        }
      },
      unregister: (api, fresh) => {
        layers.current = layers.current.filter((l) => l.api !== api)
        if (!fresh || Date.now() - fresh.at > 3000) return
        if (!showOn(fresh)) pending.current = fresh
      },
      show: showOn,
      clear: () => topFor({ tone: 'danger', title: '' })?.api.clear(),
    }
  }, [])
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
  /** dialogs and sheets: successes go to the page */
  errorsOnly?: boolean
  className?: string
}) {
  const parent = useContext(RegionContext)
  const host = useContext(HostContext)
  const [message, setMessage] = useState<(Message & { id: number }) | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const seq = useRef(0)
  const latest = useRef<Delivered | null>(null)

  const api = useMemo<RegionApi>(
    () => ({
      show: (m) => {
        // without a host (tests, a page outside the app providers) a success leaves an error-only region for the one around it
        if (!host && errorsOnly && (m.tone === 'success' || m.tone === 'info') && parent) {
          parent.show(m)
          return
        }
        seq.current += 1
        latest.current = { ...m, at: Date.now() }
        setMessage({ ...m, id: seq.current })
      },
      clear: () => setMessage(null),
    }),
    [errorsOnly, parent, host],
  )

  useEffect(() => {
    if (!host) return
    host.register({ api, errorsOnly, parent })
    return () => host.unregister(api, latest.current)
  }, [host, api, errorsOnly, parent])

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
  const host = useContext(HostContext)
  const region = useContext(RegionContext)
  const show = useCallback(
    (raw: Message) => {
      const m = raw.body === undefined ? { ...raw, ...splitMessage(raw.title) } : raw
      if (host?.show(m)) return
      if (region) return region.show(m)
      // outside every region: a snackbar is the only place left
      const text = typeof m.body === 'string' ? `${m.title}. ${m.body}` : m.title
      if (m.tone === 'danger') toast.error(text)
      else toast(text)
    },
    [host, region],
  )
  return useMemo(
    () => ({
      success: (title, body, action) => show({ tone: 'success', title, body, action }),
      info: (title, body, action) => show({ tone: 'info', title, body, action }),
      warning: (title, body, action) => show({ tone: 'warning', title, body, action }),
      error: (problemOrTitle, body, action) =>
        show({ tone: 'danger', title: typeof problemOrTitle === 'string' ? problemOrTitle : problemMessage(problemOrTitle), body, action }),
      clear: () => (host ? host.clear() : region?.clear()),
    }),
    [show, host, region],
  )
}
