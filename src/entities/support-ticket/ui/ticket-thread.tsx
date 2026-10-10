import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

type Message = { id?: string; author?: string; body?: string; createdAt?: string; attachments?: { key?: string; url?: string }[] }

/** The messages of one ticket, oldest first; the person's on the left, support's on the right (flipped for the administrators). */
export function TicketThread({ messages, supportOnRight = true }: { messages: Message[]; supportOnRight?: boolean }) {
  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m) => {
        const support = m.author === 'SUPPORT'
        const right = support === supportOnRight
        return (
          <li key={m.id} className={cn('flex flex-col gap-1', right ? 'items-end' : 'items-start')}>
            <div className={cn('max-w-[90%] rounded-lg px-3 py-2 text-sm', support ? 'bg-primary/10' : 'bg-muted')}>
              <p className="mb-1 text-xs font-semibold text-muted-foreground">{support ? 'Hỗ trợ Bonbon' : 'Người dùng'}</p>
              <p className="break-words whitespace-pre-wrap">{m.body}</p>
              {(m.attachments ?? []).map((a) => (
                <a key={a.key} href={a.url} target="_blank" rel="noreferrer">
                  <img src={a.url} alt="Ảnh đính kèm" className="mt-2 max-h-48 rounded-sm" />
                </a>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</span>
          </li>
        )
      })}
    </ul>
  )
}
