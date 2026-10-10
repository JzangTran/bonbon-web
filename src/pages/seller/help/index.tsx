import { LifeBuoyIcon } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { useHelpArticles } from '@/entities/help'
import { problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

/** Answers written by the Bonbon team, for sellers (browse-help-center.md). Search ignores case and accents. */
export function SellerHelpPage() {
  const [q, setQ] = useState('')
  const articles = useHelpArticles(q)
  const items = articles.data?.items ?? []

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Trợ giúp</h1>
          <p className="text-sm text-muted-foreground">Hướng dẫn và câu hỏi thường gặp dành cho người bán.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/seller/support-tickets">
            <LifeBuoyIcon /> Liên hệ hỗ trợ
          </Link>
        </Button>
      </div>

      <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm trong trợ giúp, ví dụ: khiếu nại" aria-label="Tìm trong trợ giúp" />

      {articles.isError ? <FormError message={problemMessage(articles.error)} /> : null}
      {articles.isPending ? <Skeleton className="h-32" /> : null}
      {articles.data && items.length === 0 ? (
        <Card className="gap-2 p-6 text-sm text-muted-foreground">
          <p>Không có bài nào khớp. Thử từ khác, hoặc gửi câu hỏi cho đội hỗ trợ.</p>
        </Card>
      ) : null}

      <ul className="flex flex-col gap-3">
        {items.map((a) => (
          <li key={a.id}>
            <Card className="p-0">
              <details className="group p-4">
                <summary className="cursor-pointer list-none font-semibold marker:hidden">{a.title}</summary>
                <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">{a.body}</p>
              </details>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
