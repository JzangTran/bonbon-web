import { ClockIcon, TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router'
import { shopStatus, useShop, type ShopApplication } from '@/entities/shop'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Card, CardContent } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Stepper } from '@/shared/ui/stepper'
import { FormError } from '@/widgets/auth-shell'
import { FocusFrame } from '@/widgets/focus-frame'
import { IdentityStep } from './identity-step'
import { ReviewStep } from './review-step'
import { ShippingStep } from './shipping-step'
import { ShopInfoStep } from './shop-step'
import { STEPS } from './step-logic'
import { TaxStep } from './tax-step'
import { merchantPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/**
 * The open-shop flow on a page of its own (open-shop.md): the person is leaving the workspace behind until the shop is
 * approved. The five-step form for a new, draft or rejected application, a read-only page while it is under review.
 * The form has no title or description of its own: the bar above already says what this is.
 */
export function OpenShopFocusPage() {
  return (
    <FocusFrame title={t('Mở cửa hàng')} width="lg">
      <OpenShopPage />
    </FocusFrame>
  )
}

function OpenShopPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  const status = shopStatus(shop.data)
  if (status === 'APPROVED') return <Navigate to={merchantPath()} replace />
  if (status === 'PENDING') return <UnderReview shop={shop.data} />
  if (status === 'SUSPENDED' || status === 'CLOSED') {
    return <p className="text-muted-foreground">{t('Cửa hàng đang bị khoá hoặc đã đóng. Hãy liên hệ bộ phận hỗ trợ.')}</p>
  }
  return <Wizard key={shop.data.submittedAt ?? 'new'} shop={shop.data} />
}

function UnderReview({ shop }: { shop: ShopApplication }) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">{t('Hồ sơ đang chờ duyệt')}</h1>
      <Card>
        <CardContent className="flex items-start gap-3">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="flex flex-col gap-1 text-sm">
            <p>
              {t('Hồ sơ cửa hàng ')}<b>{shop.shop?.name}</b>{t(' đã gửi lúc ')}{formatDateTime(shop.submittedAt)}{t('. Quản trị viên sẽ xem và bạn nhận email khi có kết quả.')}
            </p>
            <p className="text-muted-foreground">{t('Trong lúc chờ, hồ sơ không sửa được.')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Wizard({ shop }: { shop: ShopApplication }) {
  const [step, setStep] = useState(shop.firstIncompleteStep ?? 5)
  const complete = (n: number) => shop.steps?.find((s) => s.step === n)?.complete ?? false
  const next = () => setStep((s) => Math.min(5, s + 1))

  return (
    <div className="flex flex-col gap-10">
      <h1 className="sr-only">{t('Mở cửa hàng')}</h1>
      {shop.status === 'REJECTED' ? (
        <p role="alert" className="flex items-start gap-2 rounded-sm bg-danger-subtle px-3 py-2 text-sm text-danger-fg">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            <b>{t('Hồ sơ chưa được duyệt.')}</b>{t(' Lý do: ')}{shop.rejectionReason}{t(' Hãy sửa thông tin rồi gửi lại ở bước 5.')}
          </span>
        </p>
      ) : null}
      <Stepper steps={STEPS.map((label, i) => ({ label, done: i + 1 < 5 && complete(i + 1) }))} current={step} onSelect={setStep} />
      <div className="border-t pt-6">
        {step === 1 ? <ShopInfoStep shop={shop} onNext={next} /> : null}
        {step === 2 ? <ShippingStep shop={shop} onNext={next} /> : null}
        {step === 3 ? <TaxStep shop={shop} onNext={next} /> : null}
        {step === 4 ? <IdentityStep shop={shop} onNext={next} /> : null}
        {step === 5 ? <ReviewStep shop={shop} goTo={setStep} /> : null}
      </div>
    </div>
  )
}
