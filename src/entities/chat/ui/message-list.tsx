import { CornerUpLeftIcon } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage } from '../api'

const SIDE_LABEL: Record<string, string> = { CUSTOMER: 'Khách', SHOP: 'Cửa hàng' }

/**
 * One conversation, oldest at the top. {@code messages} arrive newest first as the API returns them. In the shop's own
 * thread "mine" aligns to the right; the administrators' read-only view has no "mine", so each message names its side.
 */
export function MessageList({ messages, onReply, showSide = false }: { messages: ChatMessage[]; onReply?: (message: ChatMessage) => void; showSide?: boolean }) {
  const ordered = [...messages].reverse()
  return (
    <ul className="flex flex-col gap-3">
      {ordered.map((m) => (
        <li key={m.id} className={cn('flex flex-col gap-1', m.mine ? 'items-end' : 'items-start')}>
          <div className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', m.mine ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
            {showSide ? <p className="mb-1 text-xs font-semibold opacity-80">{SIDE_LABEL[m.sender ?? ''] ?? m.sender}</p> : null}
            {m.replyTo ? (
              <p className={cn('mb-1 border-l-2 pl-2 text-xs opacity-80', m.mine ? 'border-primary-foreground/60' : 'border-foreground/30')}>
                {m.replyTo.text ? m.replyTo.text : m.replyTo.hasImage ? 'Ảnh' : ''}
              </p>
            ) : null}
            {m.imageUrl ? (
              <a href={m.imageUrl} target="_blank" rel="noreferrer">
                <img src={m.imageUrl} alt="Ảnh đính kèm" className="mb-1 max-h-60 rounded-sm" />
              </a>
            ) : null}
            {m.text ? <p className="break-words whitespace-pre-wrap">{m.text}</p> : null}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatDateTime(m.createdAt)}</span>
            {onReply ? (
              <button type="button" onClick={() => onReply(m)} className="inline-flex items-center gap-1 hover:text-foreground" aria-label="Trả lời tin này">
                <CornerUpLeftIcon className="size-3" /> Trả lời
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
