import { t } from '@/shared/i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'
import { SHOP_QUERY_KEY, type ShopApplication } from '@/entities/shop'
import { api, problemCode, problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { FormError } from '@/widgets/auth-shell'
import { StepCard } from './step-kit'
import { FIELD_LABEL, STEPS } from './step-logic'

/** Step 5 · Xác nhận và gửi duyệt: what is still missing in each step, and the button that sends the application. */
export function ReviewStep({ shop, goTo }: { shop: ShopApplication; goTo: (step: number) => void }) {
  const queryClient = useQueryClient()
  const submit = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/merchant/shop/submit')
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      toast.success(t('Đã gửi hồ sơ. Bạn sẽ nhận email khi có kết quả.'))
    },
    onError: (e) => {
      if (problemCode(e) === 'SHOP_APPLICATION_INCOMPLETE') {
        void queryClient.invalidateQueries({ queryKey: SHOP_QUERY_KEY })
      }
    },
  })
  const incomplete = (shop.steps ?? []).filter((s) => !s.complete)

  return (
    <StepCard
      title={t('5 · Xác nhận & gửi duyệt')}
      description={t('Quản trị viên xem hồ sơ và bạn nhận email khi có kết quả. Trong lúc chờ, hồ sơ không sửa được.')}
      footer={
        <Button disabled={incomplete.length > 0 || submit.isPending} onClick={() => submit.mutate()}>
          {shop.status === 'REJECTED' ? t('Gửi lại hồ sơ') : t('Gửi duyệt')}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {(shop.steps ?? []).map((s) => (
          <li key={s.step} className="flex flex-wrap items-center gap-2 rounded-sm border px-3 py-2 text-sm">
            <span className={cn('flex size-6 items-center justify-center rounded-full', s.complete ? 'bg-success text-white' : 'bg-warning-subtle text-warning-fg')}>
              {s.complete ? <CheckIcon className="size-4" /> : '!'}
            </span>
            <span className="font-medium">{STEPS[(s.step ?? 1) - 1]}</span>
            {!s.complete ? (
              <span className="text-muted-foreground">{t('Còn thiếu: ')}{(s.missing ?? []).map((f) => FIELD_LABEL[f] ?? f).join(', ')}</span>
            ) : null}
            <Button variant="link" size="sm" className="ml-auto" onClick={() => goTo(s.step ?? 1)}>
              {s.complete ? t('Xem lại') : t('Bổ sung')}
            </Button>
          </li>
        ))}
      </ul>
      {submit.isError ? <FormError message={problemMessage(submit.error)} /> : null}
    </StepCard>
  )
}
