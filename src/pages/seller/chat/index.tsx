import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeftIcon, ImageIcon, SendIcon, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { CHAT_KEY, MessageList, useConversations, useMarkRead, useSendMessage, useThread, type ChatMessage, type Conversation } from '@/entities/chat'
import { useOrderSocket } from '@/entities/order'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatRelative } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

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
        <h1 className="text-2xl font-bold">Tin nhắn</h1>
        <p className="text-sm text-muted-foreground">
          Khách nhắn hỏi về món, thời gian hoặc địa chỉ giao. Khách chỉ thấy &quot;cửa hàng&quot; trả lời, không thấy ai bên bạn viết. {live ? 'Tin mới hiện ngay.' : 'Đang kiểm tra tin mới mỗi vài giây.'}
        </p>
      </div>

      {conversations.isError ? <FormError message={problemMessage(conversations.error)} /> : null}

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className={cn('flex flex-col gap-2', selected ? 'hidden md:flex' : '')}>
          {conversations.isPending ? <Skeleton className="h-24" /> : null}
          {conversations.data && items.length === 0 ? <Card className="p-4 text-sm text-muted-foreground">Chưa có khách nào nhắn tin.</Card> : null}
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
                Trước
              </Button>
              <span className="text-muted-foreground">
                {page + 1} / {Math.ceil(total / size)}
              </span>
              <Button variant="outline" size="sm" disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)}>
                Sau
              </Button>
            </div>
          ) : null}
        </div>

        <div className={cn(selected ? '' : 'hidden md:block')}>
          {selected ? (
            <Thread key={selected} conversationId={selected} live={live} onBack={() => setParams({})} />
          ) : (
            <Card className="hidden p-6 text-sm text-muted-foreground md:block">Chọn một cuộc trò chuyện để xem và trả lời.</Card>
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
          <span className={cn('truncate', c.unread ? 'font-semibold' : '')}>{c.customerName}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{formatRelative(last?.sentAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', c.unread ? 'text-foreground' : 'text-muted-foreground')}>
            {last?.sender === 'SHOP' ? 'Bạn: ' : ''}
            {last?.text || (last?.hasImage ? 'Đã gửi một ảnh' : '')}
          </span>
          {c.unread ? <span aria-label="Chưa đọc" className="size-2.5 shrink-0 rounded-full bg-primary" /> : null}
        </div>
      </Card>
    </button>
  )
}

function Thread({ conversationId, live, onBack }: { conversationId: string; live: boolean; onBack: () => void }) {
  const thread = useThread(conversationId, live)
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
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack} aria-label="Quay lại danh sách">
          <ArrowLeftIcon />
        </Button>
        <span className="font-semibold">Cuộc trò chuyện</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {thread.isError ? <FormError message={problemMessage(thread.error)} /> : null}
        {thread.isPending ? <Skeleton className="h-24" /> : null}
        {thread.hasNextPage ? (
          <div className="mb-3 text-center">
            <Button variant="outline" size="sm" disabled={thread.isFetchingNextPage} onClick={() => void thread.fetchNextPage()}>
              Tải tin cũ hơn
            </Button>
          </div>
        ) : null}
        <MessageList messages={messages} onReply={setReplyTo} />
        <div ref={bottom} />
      </div>
      <div className="flex flex-col gap-2 border-t p-3">
        {replyTo ? (
          <div className="flex items-center justify-between gap-2 rounded-sm bg-muted px-2 py-1 text-xs">
            <span className="truncate">Trả lời: {replyTo.text || 'Ảnh'}</span>
            <button type="button" onClick={() => setReplyTo(null)} aria-label="Bỏ trả lời">
              <XIcon className="size-4" />
            </button>
          </div>
        ) : null}
        {image ? (
          <div className="flex items-center justify-between gap-2 rounded-sm bg-muted px-2 py-1 text-xs">
            <span className="truncate">Ảnh: {image.name}</span>
            <button type="button" onClick={() => setImage(null)} aria-label="Bỏ ảnh">
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
            onChange={(e) => {
              setImage(e.target.files?.[0] ?? null)
              e.target.value = ''
            }}
          />
          <Button type="button" variant="outline" size="icon" onClick={() => file.current?.click()} aria-label="Đính kèm ảnh">
            <ImageIcon />
          </Button>
          <Textarea
            value={text}
            maxLength={1000}
            rows={2}
            placeholder="Nhập tin nhắn…"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
          />
          <Button type="button" onClick={submit} disabled={send.isPending || (!text.trim() && !image)} aria-label="Gửi">
            <SendIcon />
          </Button>
        </div>
      </div>
    </Card>
  )
}
