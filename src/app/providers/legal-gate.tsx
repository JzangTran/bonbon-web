import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, clearLegalRequired, problemMessage, useGateState } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { legalUrl } from '@/shared/config/sites'

const TYPE_ROUTE: Record<string, string> = { CUSTOMER_TERMS: 'CUSTOMER_TERMS', SELLER_TERMS: 'SELLER_TERMS', PRIVACY_POLICY: 'PRIVACY_POLICY' }

/**
 * A legal document changed in a way that needs a fresh yes (accept-legal-documents.md). The server then refuses every call with
 * LEGAL_ACCEPTANCE_REQUIRED, so this blocks the page until the person reads the summary and accepts; signing out is the other way out.
 */
export function LegalGate() {
  const { signOut } = useSession()
  const queryClient = useQueryClient()
  const { legalRequiredAt } = useGateState()
  const open = legalRequiredAt !== null
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pending = useQuery({
    queryKey: ['legal', 'pending'],
    enabled: open,
    staleTime: 0,
    queryFn: async () => {
      const { data, error: problem } = await api.GET('/api/legal/pending')
      if (problem || !data) throw problem
      return data
    },
  })
  const accept = useMutation({
    mutationFn: async (documentIds: string[]) => {
      const { error: problem } = await api.POST('/api/legal/accept', { body: { documentIds } })
      if (problem) throw problem
    },
    onSuccess: async () => {
      clearLegalRequired()
      setAgreed(false)
      toast.success('Cảm ơn bạn đã đồng ý.')
      await queryClient.invalidateQueries()
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const items = pending.data?.items ?? []

  // Nothing waits any more (accepted on another device): let the person through.
  const nothingWaits = open && pending.isSuccess && items.length === 0
  useEffect(() => {
    if (!nothingWaits) return
    clearLegalRequired()
    void queryClient.invalidateQueries()
  }, [nothingWaits, queryClient])

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent showCloseButton={false} onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Điều khoản đã được cập nhật</DialogTitle>
          <DialogDescription>Hãy đọc những thay đổi dưới đây và đồng ý để tiếp tục dùng bonbon.</DialogDescription>
        </DialogHeader>
        {pending.isPending ? <Skeleton className="h-24" /> : null}
        {pending.isError ? <FormError message={problemMessage(pending.error)} /> : null}
        <ul className="flex flex-col gap-3">
          {items.map((d) => (
            <li key={d.id} className="flex flex-col gap-1 rounded-sm border p-3 text-sm">
              <p className="font-semibold">
                {d.title} <span className="font-normal text-muted-foreground">· phiên bản {d.version}</span>
              </p>
              <p className="text-xs text-muted-foreground">Có hiệu lực từ {formatDateTime(d.effectiveAt)}</p>
              {d.summary ? <p className="whitespace-pre-line">{d.summary}</p> : <p className="text-muted-foreground">Không có tóm tắt thay đổi.</p>}
              <a className="text-link" href={legalUrl(TYPE_ROUTE[d.type ?? ''] ?? d.type ?? '')} target="_blank" rel="noreferrer">
                Đọc toàn văn
              </a>
            </li>
          ))}
        </ul>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>Tôi đã đọc và đồng ý với {items.length > 1 ? 'các văn bản' : 'văn bản'} trên.</span>
        </label>
        <FormError message={error} />
        <DialogFooter>
          <Button variant="outline" onClick={() => void signOut()}>
            Đăng xuất
          </Button>
          <Button
            disabled={!agreed || items.length === 0 || accept.isPending}
            onClick={() => {
              setError(null)
              accept.mutate(items.map((d) => d.id ?? ''))
            }}
          >
            Đồng ý và tiếp tục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
