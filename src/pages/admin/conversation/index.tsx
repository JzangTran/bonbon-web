import { ArrowLeftIcon } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { MessageList, useAdminConversation, useAdminThread } from '@/entities/chat'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

/** A customer-shop conversation, read only (view-any-conversation.md). Opening it is written to the audit log. */
export function AdminConversationPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()
  const allowed = !!session?.permissions.has('admin-conversation:read')

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền đọc trò chuyện giữa khách và quán.</p>
  return <Viewer id={id} onBack={() => void navigate(-1)} />
}

function Viewer({ id, onBack }: { id: string; onBack: () => void }) {
  const conversation = useAdminConversation(id)
  const thread = useAdminThread(id)
  const messages = thread.data?.pages.flatMap((p) => p.items ?? []) ?? []

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Quay lại
      </button>
      <div>
        <h1 className="text-2xl font-bold">Trò chuyện khách – quán</h1>
        {conversation.data ? (
          <p className="text-sm text-muted-foreground">
            {conversation.data.customerName} ↔ {conversation.data.shopName} · từ {formatDateTime(conversation.data.createdAt)}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">Chỉ đọc. Việc mở cuộc trò chuyện này được ghi nhật ký cùng tên bạn.</p>
      </div>
      {conversation.isError ? <FormError message={problemMessage(conversation.error)} /> : null}
      {thread.isError ? <FormError message={problemMessage(thread.error)} /> : null}
      {thread.isPending ? <Skeleton className="h-48" /> : null}
      <Card className="p-4">
        {thread.hasNextPage ? (
          <div className="mb-3 text-center">
            <Button variant="outline" size="sm" disabled={thread.isFetchingNextPage} onClick={() => void thread.fetchNextPage()}>
              Tải tin cũ hơn
            </Button>
          </div>
        ) : null}
        {thread.data && messages.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có tin nhắn.</p> : null}
        <MessageList messages={messages} showSide />
      </Card>
    </div>
  )
}
