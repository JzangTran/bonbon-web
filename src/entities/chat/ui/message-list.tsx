import { t } from '@/shared/i18n'
import { BotIcon, CornerUpLeftIcon, FlagIcon } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import type { ChatMessage } from '../api'

const SIDE_LABEL: Record<string, string> = { CUSTOMER: t('Khách'), SHOP: t('Cửa hàng') }

/**
 * One conversation, oldest at the top. {@code messages} arrive newest first as the API returns them. In the shop's own
 * thread "mine" aligns to the right; the administrators' read-only view has no "mine", so each message names its side.
 * A message removed after a report shows as removed (administrators still read it), an auto-reply carries its label, and
 * {@code onReport} offers reporting the other side's messages.
 */
export function MessageList({
  messages,
  onReply,
  onReport,
  showSide = false,
}: {
  messages: ChatMessage[]
  onReply?: (message: ChatMessage) => void
  onReport?: (message: ChatMessage) => void
  showSide?: boolean
}) {
  const ordered = [...messages].reverse()
  return (
    <ul className="flex flex-col gap-3">
      {ordered.map((m) => {
        const removedForMe = m.removed && !showSide
        return (
          <li key={m.id} className={cn('flex flex-col gap-1', m.mine ? 'items-end' : 'items-start')}>
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                removedForMe ? 'border border-dashed bg-transparent text-muted-foreground italic' : m.mine ? 'bg-primary text-primary-foreground' : 'bg-muted',
              )}
            >
              {showSide ? <p className="mb-1 text-xs font-semibold opacity-80">{SIDE_LABEL[m.sender ?? ''] ?? m.sender}</p> : null}
              {removedForMe ? (
                <p>{t('Tin nhắn đã bị gỡ vì vi phạm quy định.')}</p>
              ) : (
                <>
                  {m.replyTo ? (
                    <p className={cn('mb-1 border-l-2 pl-2 text-xs opacity-80', m.mine ? 'border-primary-foreground/60' : 'border-foreground/30')}>
                      {m.replyTo.text ? m.replyTo.text : m.replyTo.hasImage ? t('Ảnh') : t('Tin đã bị gỡ')}
                    </p>
                  ) : null}
                  {m.imageUrl ? (
                    <a href={m.imageUrl} target="_blank" rel="noreferrer">
                      <img src={m.imageUrl} alt={t('Ảnh đính kèm')} className="mb-1 max-h-60 rounded-sm" />
                    </a>
                  ) : null}
                  {m.text ? <p className="break-words whitespace-pre-wrap">{m.text}</p> : null}
                  {showSide && m.removed ? <p className="mt-1 text-xs font-semibold text-destructive">{t('Đã gỡ sau báo cáo')}</p> : null}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {m.autoReply ? (
                <span className="inline-flex items-center gap-1">
                  <BotIcon className="size-3" />
                  {t('Trả lời tự động')}
                </span>
              ) : null}
              <span>{formatDateTime(m.createdAt)}</span>
              {onReply && !removedForMe ? (
                <button type="button" onClick={() => onReply(m)} className="inline-flex items-center gap-1 hover:text-foreground" aria-label={t('Trả lời tin này')}>
                  <CornerUpLeftIcon className="size-3" />{t(' Trả lời')}
                </button>
              ) : null}
              {onReport && !m.mine && !m.removed && !m.autoReply ? (
                <button type="button" onClick={() => onReport(m)} className="inline-flex items-center gap-1 hover:text-destructive" aria-label={t('Báo cáo tin này')}>
                  <FlagIcon className="size-3" />
                  {t('Báo cáo')}
                </button>
              ) : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
