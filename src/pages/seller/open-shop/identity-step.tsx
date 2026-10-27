import { useQuery } from '@tanstack/react-query'
import { CheckIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ShopApplication } from '@/entities/shop'
import { api, problemMessage } from '@/shared/api'
import { requiredText, type Errors } from '@/shared/lib/validate'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { FormError } from '@/widgets/auth-shell'
import { Field, SaveButtons, StepCard, UploadField } from './step-kit'
import { str, useStep } from './step-logic'
import { legalUrl } from '@/shared/config/sites'

type Body = {
  docType?: 'CCCD' | 'CMND'
  docNumber?: string
  fullName?: string
  accuracyConfirmed?: boolean
  sellerTermsDocumentId?: string
  privacyPolicyDocumentId?: string
}

function useLegalDocument(type: 'SELLER_TERMS' | 'PRIVACY_POLICY') {
  return useQuery({
    queryKey: ['legal-document', type],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/legal/documents/{type}', { params: { path: { type } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** Step 4 · Định danh chủ cửa hàng: document, its number, name, the two photos and the consents. */
export function IdentityStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const id = shop.identity
  const terms = useLegalDocument('SELLER_TERMS')
  const privacy = useLegalDocument('PRIVACY_POLICY')
  const [docType, setDocType] = useState<'CCCD' | 'CMND' | undefined>((id?.docType as 'CCCD' | 'CMND' | undefined) ?? 'CCCD')
  const [docNumber, setDocNumber] = useState('')
  const [fullName, setFullName] = useState(id?.fullName ?? '')
  const [accurate, setAccurate] = useState(id?.accuracyConfirmed ?? false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [consent, setConsent] = useState(false)
  const save = useStep((body: Body) => api.PUT('/api/merchant/shop/steps/4', { body }))
  const numberSaved = !!id?.docNumberLast4

  const problems = (strict: boolean): Errors => {
    const e: Errors = {}
    const n = docNumber.replace(/\s/g, '')
    const valid = docType === 'CCCD' ? /^\d{12}$/.test(n) : /^(\d{9}|\d{12})$/.test(n)
    if (strict && n === '' && !numberSaved) e.docNumber = 'Hãy nhập số giấy tờ.'
    else if (n !== '' && !valid) e.docNumber = docType === 'CCCD' ? 'CCCD gồm 12 chữ số.' : 'CMND gồm 9 hoặc 12 chữ số.'
    if (strict || fullName.trim() !== '') requiredText(e, 'fullName', fullName, 'họ tên như trên giấy tờ', 100)
    if (strict && !id?.frontPhotoUrl) e.frontPhoto = 'Hãy tải ảnh mặt trước giấy tờ.'
    if (strict && !id?.selfiePhotoUrl) e.selfiePhoto = 'Hãy tải ảnh bạn cầm giấy tờ.'
    if (strict && !accurate) e.accuracyConfirmed = 'Hãy xác nhận cam kết thông tin chính xác.'
    if (strict && !id?.sellerTermsAccepted && !acceptTerms) e.sellerTerms = 'Hãy đồng ý Điều khoản dành cho người bán.'
    if (strict && !id?.identityConsentGiven && !consent) e.identityConsent = 'Hãy đồng ý để bonbon xử lý dữ liệu định danh.'
    return e
  }

  const submit = (andNext: boolean) => {
    if (!save.check(problems(andNext))) return
    save.mutate(
      {
        docType,
        docNumber: str(docNumber.replace(/\s/g, '')),
        fullName: str(fullName),
        accuracyConfirmed: accurate,
        sellerTermsDocumentId: acceptTerms ? terms.data?.id : undefined,
        privacyPolicyDocumentId: consent ? privacy.data?.id : undefined,
      },
      {
        onSuccess: () => {
          setDocNumber('')
          if (andNext) onNext()
          else toast.success('Đã lưu nháp.')
        },
      },
    )
  }

  return (
    <StepCard
      title="4 · Định danh chủ cửa hàng"
      description="Giấy tờ được mã hoá; chỉ quản trị viên có quyền riêng mới xem được và mỗi lần xem đều được ghi lại."
      footer={<SaveButtons pending={save.isPending || terms.isPending || privacy.isPending} onSave={submit} />}
    >
      <FormRow label="Loại giấy tờ" required>
        <div role="radiogroup" aria-label="Loại giấy tờ" className="flex gap-4">
          {(['CCCD', 'CMND'] as const).map((value) => (
            <label key={value} className="flex min-h-9 items-center gap-2 text-sm">
              <input type="radio" name="doc-type" checked={docType === value} onChange={() => setDocType(value)} /> {value}
            </label>
          ))}
        </div>
      </FormRow>
      <Field
        id="id-number"
        label="Số giấy tờ"
        required
        hint={id?.docNumberLast4 ? `Đã lưu ••••${id.docNumberLast4}; để trống để giữ nguyên.` : 'CCCD 12 số, CMND 9 hoặc 12 số.'}
        error={save.errors.docNumber}
      >
        <Input id="id-number" inputMode="numeric" autoComplete="off" maxLength={14} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
      </Field>
      <Field id="id-name" label="Họ tên như trên giấy tờ" required error={save.errors.fullName}>
        <Input id="id-name" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>
      <UploadField
        label="Ảnh mặt trước giấy tờ"
        required
        hint="JPG, PNG hoặc WebP, tối đa 8 MB."
        kind="identity-front"
        accept="image/jpeg,image/png,image/webp"
        previewUrl={id?.frontPhotoUrl}
        error={save.errors.frontPhoto}
      />
      <UploadField
        label="Ảnh bạn cầm giấy tờ"
        required
        hint="Thấy rõ mặt và giấy tờ. JPG, PNG hoặc WebP, tối đa 8 MB."
        kind="identity-selfie"
        accept="image/jpeg,image/png,image/webp"
        previewUrl={id?.selfiePhotoUrl}
        error={save.errors.selfiePhoto}
      />
      <div className="flex flex-col gap-3 border-t pt-4 text-sm">
        <Consent error={save.errors.accuracyConfirmed}>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 size-4" checked={accurate} onChange={(e) => setAccurate(e.target.checked)} />
            Tôi cam kết mọi thông tin đã cung cấp là chính xác và trung thực.
          </label>
        </Consent>
        {id?.sellerTermsAccepted ? (
          <p className="flex items-center gap-2 text-success-fg">
            <CheckIcon className="size-4" /> Đã đồng ý Điều khoản dành cho người bán.
          </p>
        ) : (
          <Consent error={save.errors.sellerTerms}>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 size-4" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              <span>
                Tôi đồng ý với{' '}
                <a href={legalUrl('SELLER_TERMS')} target="_blank" rel="noreferrer" className="text-primary underline">
                  {terms.data?.title ?? 'Điều khoản dành cho người bán'}
                </a>
                .
              </span>
            </label>
          </Consent>
        )}
        {id?.identityConsentGiven ? (
          <p className="flex items-center gap-2 text-success-fg">
            <CheckIcon className="size-4" /> Đã đồng ý xử lý dữ liệu định danh.
          </p>
        ) : (
          <Consent error={save.errors.identityConsent}>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-0.5 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                Tôi đồng ý để bonbon xử lý dữ liệu định danh nhằm xác minh cửa hàng — xem{' '}
                <a href={legalUrl('PRIVACY_POLICY')} target="_blank" rel="noreferrer" className="text-primary underline">
                  {privacy.data?.title ?? 'Chính sách quyền riêng tư'}
                </a>
                .
              </span>
            </label>
          </Consent>
        )}
      </div>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}

/** A checkbox line with its error under it. */
function Consent({ error, children }: { error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
