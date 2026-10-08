import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { CaseEvidence, useAcceptCase, useDisputeCase, useShopCase } from '@/entities/order-case'
import { problemMessage } from '@/shared/api'
import { formatVnd } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

/** One complaint with the customer's evidence, and the shop's two answers: accept it or dispute it. */
export function SellerOrderCaseDetailPage() {
  const { id = '' } = useParams()
  const detail = useShopCase(id)
  const accept = useAcceptCase()
  const dispute = useDisputeCase()
  const [accepting, setAccepting] = useState(false)
  const [disputing, setDisputing] = useState(false)
  const [note, setNote] = useState('')
  const c = detail.data

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link to="/seller/order-cases" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Danh sách khiếu nại
      </Link>
      {detail.isError ? <FormError message={problemMessage(detail.error)} /> : null}
      {detail.isPending ? <Skeleton className="h-64" /> : null}
      {c ? (
        <>
          <CaseEvidence orderCase={c} />
          {c.status === 'AWAITING_SHOP' ? (
            <Card className="gap-3 p-4">
              <h3 className="font-semibold">Quán trả lời</h3>
              <p className="text-sm text-muted-foreground">
                Chấp nhận thì khách được hoàn {formatVnd(c.refundAmount)} ngay và quán chịu {formatVnd(c.shopBears)} trong sổ cái (phần hoa hồng của số này được hoàn lại cho quán). Phản đối thì quản trị viên xem ảnh và lý do của hai bên rồi quyết định.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setAccepting(true)}>Chấp nhận</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNote('')
                    setDisputing(true)
                  }}
                >
                  Phản đối
                </Button>
              </div>
            </Card>
          ) : null}

          <Dialog open={accepting} onOpenChange={setAccepting}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Chấp nhận khiếu nại?</DialogTitle>
                <DialogDescription>
                  Khách được hoàn {formatVnd(c.refundAmount)}. Quán chịu {formatVnd(c.shopBears)} và không hoàn tác được.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Huỷ</Button>
                </DialogClose>
                <Button disabled={accept.isPending} onClick={() => accept.mutate(id, { onSuccess: () => setAccepting(false) })}>
                  Chấp nhận
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={disputing} onOpenChange={setDisputing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Phản đối khiếu nại</DialogTitle>
                <DialogDescription>Quản trị viên sẽ quyết định. Lý do của bạn được gửi kèm và khách cũng thấy.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dispute-note">Lý do phản đối</Label>
                <Textarea id="dispute-note" rows={4} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ví dụ: đơn đã giao, khách ký nhận lúc 18:40" />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Huỷ</Button>
                </DialogClose>
                <Button disabled={note.trim().length === 0 || dispute.isPending} onClick={() => dispute.mutate({ id, note }, { onSuccess: () => setDisputing(false) })}>
                  Gửi cho quản trị viên
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  )
}
