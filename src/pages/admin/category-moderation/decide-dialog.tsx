import { t } from '@/shared/i18n'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { leaves, useCategoryTree, useDecideAppeal, type CategoryCase } from '@/entities/dish-category-case'
import { problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { CategorySelect } from '@/shared/ui/category-select'

/** Accept moves the dish to the category the shop asked for (or another one, explained in the reason); reject keeps the system's. The shop reads the reason. */
export function DecideDialog({ kase, decision, onClose }: { kase: CategoryCase | null; decision: 'ACCEPT' | 'REJECT'; onClose: () => void }) {
  const tree = useCategoryTree()
  const options = useMemo(() => leaves(tree.data ?? []), [tree.data])
  const decide = useDecideAppeal()
  const [reason, setReason] = useState('')
  const [other, setOther] = useState('')
  const [error, setError] = useState<string | null>(null)
  const accept = decision === 'ACCEPT'

  return (
    <Dialog open={kase !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{accept ? t('Chấp nhận kháng nghị') : t('Từ chối kháng nghị')}</DialogTitle>
          <DialogDescription>
            {kase?.dishName} · {kase?.shopName}.{' '}
            {accept ? t('Món chuyển sang ngành "{v0}" và chỉ áp dụng cho đơn đặt từ giờ.', { v0: kase?.requestedCategory?.name }) : t('Món giữ ngành "{v0}" do hệ thống đặt.', { v0: kase?.finalCategory?.name })}
          </DialogDescription>
        </DialogHeader>
        {kase?.appealNote ? (
          <p className="rounded-sm bg-muted px-3 py-2 text-sm">
            <span className="font-medium">{t('Quán giải thích:')}</span> {kase.appealNote}
          </p>
        ) : null}
        {accept ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="decide-other">{t('Hoặc chuyển sang ngành khác (giải thích trong lý do)')}</Label>
            <CategorySelect id="decide-other" options={options} value={other} onChange={setOther} loading={tree.isPending} />
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="decide-reason">{t('Lý do (quán sẽ thấy)')}</Label>
          <Textarea id="decide-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('Huỷ')}
          </Button>
          <Button
            variant={accept ? 'default' : 'destructive'}
            disabled={reason.trim() === '' || decide.isPending}
            onClick={() => {
              setError(null)
              decide.mutate(
                { id: kase?.id ?? '', decision, reason: reason.trim(), categoryId: accept && other ? other : undefined },
                {
                  onSuccess: () => {
                    toast.success(accept ? t('Đã chấp nhận kháng nghị. Quán đã được báo.') : t('Đã từ chối kháng nghị. Quán đã được báo.'))
                    setReason('')
                    setOther('')
                    onClose()
                  },
                  onError: (e) => setError(problemMessage(e)),
                },
              )
            }}
          >
            {accept ? t('Chấp nhận') : t('Từ chối')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
