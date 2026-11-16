import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, BanIcon, BotIcon, ImageIcon, SendIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'

import {
  CHAT_KEY,
  MessageList,
  useAutoReply,
  useBlockConversation,
  useConversations,
  useMarkRead,
  useSaveAutoReply,
  useSendMessage,
  useThread,
  type ChatMessage,
  type Conversation,
} from '@/entities/chat'
import { ReportDialog, type ReportTarget } from '@/features/report-content'
import { useOrderSocket } from '@/entities/order'
import { useSession } from '@/entities/session'
import { acceptUploads } from '@/shared/lib/upload'
import { problemMessage } from '@/shared/api'
import { formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormError } from '@/widgets/auth-shell'
import { t } from '@/shared/i18n'

/** Customers writing to the shop (send-message.md, view-conversation-list.md): the list on one side, the open conversation on the other. */
export function SellerChatPage() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const selected = params.get('c')
  const [page, setPage] = useState(0)
  const socket = useOrderSocket(
    session?.accessToken ?? null,
    () => undefined,
    () => void queryClient.invalidateQueries({ queryKey: CHAT_KEY }),
  )
  const live = socket === 'live'
  const conversations = useConversations(page, live)
  const items = conversations.data?.items ?? []
  const total = conversations.data?.total ?? 0
  const size = conversations.data?.size ?? 30

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{t('Tin nhắn')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('Khách nhắn hỏi về món, thời gian hoặc địa chỉ giao. Khách chỉ thấy "cửa hàng" trả lời, không thấy ai bên bạn viết. ')}{live ? t('Tin mới hiện ngay.') : t('Đang kiểm tra tin mới mỗi vài giây.')}
        </p>
      </div>

      <AutoReplyCard />

      {conversations.isError ? <FormError message={problemMessage(conversations.error)} /> : null}

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className={cn('flex flex-col gap-2', selected ? 'hidden md:flex' : '')}>
          {conversations.isPending ? <Skeleton className="h-24" /> : null}
          {conversations.data && items.length === 0 ? <EmptyState mascot="empty-chat" title={t('Chưa có khách nào nhắn tin.')} className="px-3 py-6" /> : null}
          <ul className="flex flex-col gap-2">
            {items.map((c) => (
              <li key={c.id}>
                <ConversationRow conversation={c} active={c.id === selected} onOpen={() => setParams({ c: c.id ?? '' })} />
              </li>
            ))}
          </ul>
          {total > size ? (
            <div className="flex items-center justify-between text-sm">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                {t('Trước')}
              </Button>
              <span className="text-muted-foreground">
                {page + 1} / {Math.ceil(total / size)}
              </span>
              <Button variant="outline" size="sm" disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
                {t('Sau')}
              </Button>
            </div>
          ) : null}
        </div>

        <div className={cn(selected ? '' : 'hidden md:block')}>
          {selected ? (
            <Thread key={selected} conversationId={selected} conversation={items.find((c) => c.id === selected)} live={live} onBack={() => setParams({})} />
          ) : (
            <Card className="hidden p-6 text-sm text-muted-foreground md:block">{t('Chọn một cuộc trò chuyện để xem và trả lời.')}</Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ConversationRow({ conversation: c, active, onOpen }: { conversation: Conversation; active: boolean; onOpen: () => void }) {
  const last = c.lastMessage
  return (
    <button type="button" onClick={onOpen} className="block w-full rounded-sm text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card className={cn('gap-1 p-3 transition-colors hover:bg-accent', active && 'border-primary')}>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate', c.unread ? 'font-semibold' : '')}>
            {c.customerName}
            {c.blockedByMe ? <span className="ml-2 text-xs font-normal text-muted-foreground">{t('· đã chặn')}</span> : null}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(last?.sentAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', c.unread ? 'text-foreground' : 'text-muted-foreground')}>
            {last?.sender === 'SHOP' ? t('Bạn: ') : ''}
            {last?.text || (last?.hasImage ? t('Đã gửi một ảnh') : '')}
          </span>
          {c.unread ? <span aria-label={t('Chưa đọc')} className="size-2.5 shrink-0 rounded-full bg-primary" /> : null}
        </div>
      </Card>
    </button>
  )
}

function Thread({ conversationId, conversation, live, onBack }: { conversationId: string; conversation?: Conversation; live: boolean; onBack: () => void }) {
  const thread = useThread(conversationId, live)
  const block = useBlockConversation(conversationId)
  const [reporting, setReporting] = useState<ReportTarget | null>(null)
  const blockedByMe = !!conversation?.blockedByMe
  const blockedByOther = !!conversation?.blockedByOther
  const closed = blockedByMe || blockedByOther
  const markRead = useMarkRead()
  const send = useSendMessage(conversationId)
  const [text, setText] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const messages = thread.data?.pages.flatMap((p) => p.items ?? []) ?? []
  const newest = messages[0]?.id

  // Opening a conversation, and every new message while it is open, marks it read.
  useEffect(() => {
    if (newest) markRead.mutate(conversationId)
    bottom.current?.scrollIntoView?.({ block: 'end' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newest, conversationId])

  const submit = () => {
    if (!text.trim() && !image) return
    send.mutate(
      { text, image, replyToMessageId: replyTo?.id },
      {
        onSuccess: () => {
          setText('')
          setImage(null)
          setReplyTo(null)
        },
      },
    )
  }

  return (
    <Card className="flex h-[70vh] flex-col gap-0 p-0">
      <div className="flex items-center gap-2 border-b p-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack} aria-label={t('Quay lại danh sách')}>
          <ArrowLeftIcon />
        </Button>
        <span className="flex-1 truncate font-semibold">{conversation?.customerName ?? t('Cuộc trò chuyện')}</span>
        <Button
          variant="outline"
          size="sm"
          disabled={block.isPending}
          onClick={() => {
            if (blockedByMe || window.confirm(t('Chặn khách này? Khách sẽ không nhắn được cho quán nữa. Đơn hàng không bị ảnh hưởng và bạn có thể bỏ chặn bất cứ lúc nào.'))) {
              block.mutate(!blockedByMe)
            }
          }}
        >
          <BanIcon />
          {blockedByMe ? t('Bỏ chặn') : t('Chặn')}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {thread.isError ? <FormError message={problemMessage(thread.error)} /> : null}
        {thread.isPending ? <Skeleton className="h-24" /> : null}
        {thread.hasNextPage ? (
          <div className="mb-3 text-center">
            <Button variant="outline" size="sm" disabled={thread.isFetchingNextPage} onClick={() => void thread.fetchNextPage()}>
              {t('Tải tin cũ hơn')}
            </Button>
          </div>
        ) : null}
        <MessageList messages={messages} onReply={closed ? undefined : setReplyTo} onReport={(m) => setReporting({ type: 'MESSAGE', id: m.id ?? '' })} />
        <div ref={bottom} />
      </div>
      <ReportDialog target={reporting} open={!!reporting} onOpenChange={(open) => !open && setReporting(null)} />
      {closed ? (
        <p className="border-t bg-muted/50 p-3 text-sm text-muted-foreground">
          {blockedByMe ? t('Bạn đã chặn khách này. Bỏ chặn để nhắn tiếp.') : t('Khách đã đóng cuộc trò chuyện này. Đơn hàng của khách vẫn đến bình thường.')}
        </p>
      ) : (
      <div className="flex flex-col gap-2 border-t p-3">
        {replyTo ? (
          <div className="flex items-center justify-between gap-2 rounded-sm bg-muted px-2 py-1 text-xs">
            <span className="truncate">{t('Trả lời: ')}{replyTo.text || t('Ảnh')}</span>
            <button type="button" onClick={() => setReplyTo(null)} aria-label={t('Bỏ trả lời')}>
              <XIcon className="size-4" />
            </button>
          </div>
        ) : null}
        {image ? (
          <div className="flex items-center justify-between gap-2 rounded-sm bg-muted px-2 py-1 text-xs">
            <span className="truncate">{t('Ảnh: ')}{image.name}</span>
            <button type="button" onClick={() => setImage(null)} aria-label={t('Bỏ ảnh')}>
              <XIcon className="size-4" />
            </button>
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <input
            ref={file}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={async (e) => {
              const picked = Array.from(e.target.files ?? []).slice(0, 1)
              e.target.value = ''
              const [ok] = await acceptUploads(picked, { maxMb: 5 }, (m) => toast.error(m))
              if (ok) setImage(ok)
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => file.current?.click()} aria-label={t('Đính kèm ảnh')}>
            <ImageIcon />
          </Button>
          <Textarea
            value={text}
            maxLength={1000}
            rows={2}
            placeholder={t('Nhập tin nhắn…')}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <Button type="button" onClick={submit} disabled={send.isPending || (!text.trim() && !image)} aria-label={t('Gửi')}>
            <SendIcon />
          </Button>
        </div>
      </div>
      )}
    </Card>
  )
}

/** The one message the shop sends by itself when a customer writes and nobody has answered yet (configure-auto-reply.md). */
function AutoReplyCard() {
  const current = useAutoReply()
  const save = useSaveAutoReply()
  const [draft, setDraft] = useState<string | null>(null)
  if (!current.data) return null
  const message = draft ?? current.data.message ?? ''
  const changed = draft !== null && draft.trim() !== (current.data.message ?? '')
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BotIcon className="size-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{t('Trả lời tự động')}</p>
            <p className="text-xs text-muted-foreground">{t('Gửi một lần khi khách nhắn mà quán chưa trả lời. Khách thấy nhãn "Trả lời tự động".')}</p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!!current.data.enabled}
          aria-label={t('Bật trả lời tự động')}
          disabled={save.isPending}
          onClick={() => save.mutate({ enabled: !current.data?.enabled })}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50',
            current.data.enabled ? 'bg-primary' : 'bg-grey-300',
          )}
        >
          <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', current.data.enabled && 'translate-x-5')} />
        </button>
      </div>
      {current.data.enabled ? (
        <div className="flex flex-col gap-2">
          <Textarea value={message} maxLength={1000} rows={2} onChange={(e) => setDraft(e.target.value)} aria-label={t('Nội dung trả lời tự động')} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{message.length}/1000</span>
            <Button
              size="sm"
              disabled={!changed || !message.trim() || save.isPending}
              onClick={() => save.mutate({ message: message.trim() }, { onSuccess: () => { setDraft(null); toast.success(t('Đã lưu tin trả lời tự động.')) } })}
            >
              {t('Lưu')}
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  )
}
