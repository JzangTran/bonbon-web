import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, ClockIcon, TriangleAlertIcon, UploadIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, Navigate } from 'react-router'
import { toast } from 'sonner'
import { SHOP_QUERY_KEY, shopStatus, useShop, type ShopApplication } from '@/entities/shop'
import { AddressPicker } from '@/features/address-picker'
import { OpeningHoursEditor, toEditorWindows, type OpeningWindow } from '@/features/opening-hours-editor'
import { api, problemCode, problemFieldErrors, problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const STEPS = ['Thông tin quán', 'Giao hàng & giờ', 'Thuế & nhận tiền', 'Định danh', 'Xác nhận'] as const

const FIELD_LABEL: Record<string, string> = {
  name: 'Tên cửa hàng',
  phone: 'Số điện thoại',
  email: 'Email',
  address: 'Địa chỉ',
  openingHours: 'Giờ mở cửa',
  deliveryRadiusKm: 'Bán kính giao',
  deliveryFee: 'Phí giao hàng',
  businessType: 'Loại hình kinh doanh',
  businessAddress: 'Địa chỉ kinh doanh',
  taxCode: 'Mã số thuế',
  invoiceEmails: 'Email nhận hoá đơn',
  businessName: 'Tên hộ kinh doanh',
  businessLicense: 'Giấy phép kinh doanh',
  bankName: 'Ngân hàng',
  accountNumber: 'Số tài khoản',
  accountHolderName: 'Chủ tài khoản',
  docType: 'Loại giấy tờ',
  docNumber: 'Số giấy tờ',
  fullName: 'Họ tên trên giấy tờ',
  frontPhoto: 'Ảnh mặt trước',
  selfiePhoto: 'Ảnh cầm giấy tờ',
  accuracyConfirmed: 'Cam kết thông tin chính xác',
  sellerTerms: 'Điều khoản người bán',
  identityConsent: 'Đồng ý xử lý dữ liệu định danh',
}

/**
 * Where a seller lands until the shop is approved (open-shop.md): the five-step wizard for a new, draft or
 * rejected application, a read-only page while it is under review.
 */
export function OpenShopPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  const status = shopStatus(shop.data)
  if (status === 'APPROVED') return <Navigate to="/seller" replace />
  if (status === 'PENDING') return <UnderReview shop={shop.data} />
  if (status === 'SUSPENDED' || status === 'CLOSED') {
    return <p className="text-muted-foreground">Cửa hàng đang bị khoá hoặc đã đóng. Hãy liên hệ bộ phận hỗ trợ.</p>
  }
  return <Wizard key={shop.data.submittedAt ?? 'new'} shop={shop.data} />
}

function UnderReview({ shop }: { shop: ShopApplication }) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Hồ sơ đang chờ duyệt</h1>
      <Card>
        <CardContent className="flex items-start gap-3">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-warning" />
          <div className="flex flex-col gap-1 text-sm">
            <p>
              Hồ sơ cửa hàng <b>{shop.shop?.name}</b> đã gửi lúc {formatDateTime(shop.submittedAt)}. Quản trị viên sẽ xem và
              bạn nhận email khi có kết quả.
            </p>
            <p className="text-muted-foreground">Trong lúc chờ, hồ sơ không sửa được.</p>
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
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Mở cửa hàng</h1>
        <p className="text-sm text-muted-foreground">Điền 5 bước rồi gửi duyệt. Mỗi bước được lưu nháp, bạn có thể quay lại sau.</p>
      </div>
      {shop.status === 'REJECTED' ? (
        <p role="alert" className="flex items-start gap-2 rounded-md bg-danger-subtle px-3 py-2 text-sm text-danger-fg">
          <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            <b>Hồ sơ chưa được duyệt.</b> Lý do: {shop.rejectionReason} Hãy sửa thông tin rồi gửi lại ở bước 5.
          </span>
        </p>
      ) : null}
      <ol className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => {
          const n = i + 1
          const done = n < 5 && complete(n)
          return (
            <li key={n} className="flex-[1_1_9rem]">
              <button
                type="button"
                onClick={() => setStep(n)}
                aria-current={step === n ? 'step' : undefined}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm',
                  step === n ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold',
                    done && 'border-success bg-success text-white',
                    step === n && !done && 'border-primary bg-primary text-primary-foreground',
                  )}
                >
                  {done ? <CheckIcon className="size-4" /> : n}
                </span>
                {label}
              </button>
            </li>
          )
        })}
      </ol>
      {step === 1 ? <ShopInfoStep shop={shop} onNext={next} /> : null}
      {step === 2 ? <ShippingStep shop={shop} onNext={next} /> : null}
      {step === 3 ? <TaxStep shop={shop} onNext={next} /> : null}
      {step === 4 ? <IdentityStep shop={shop} onNext={next} /> : null}
      {step === 5 ? <ReviewStep shop={shop} goTo={setStep} /> : null}
    </div>
  )
}

// --- shared step plumbing

function useSaveStep<T>(save: (body: T) => Promise<{ data?: ShopApplication; error?: unknown }>) {
  const queryClient = useQueryClient()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const mutation = useMutation({
    mutationFn: async (body: T) => {
      const { data, error } = await save(body)
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      setErrors({})
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
    },
    onError: (e) => setErrors(problemFieldErrors(e)),
  })
  return { ...mutation, fieldErrors: errors }
}

function StepCard({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {children}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">{footer}</div>
      </CardContent>
    </Card>
  )
}

function Field({ id, label, error, hint, children }: { id?: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function SaveButtons({ pending, onSave }: { pending: boolean; onSave: (andNext: boolean) => void }) {
  return (
    <>
      <Button type="button" variant="outline" disabled={pending} onClick={() => onSave(false)}>
        Lưu nháp
      </Button>
      <Button type="button" disabled={pending} onClick={() => onSave(true)}>
        Lưu & tiếp tục
      </Button>
    </>
  )
}

const num = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/\./g, '').replace(',', '.')))
const str = (s: string) => (s.trim() === '' ? undefined : s.trim())

// --- step 1

function ShopInfoStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const [name, setName] = useState(shop.shop?.name ?? '')
  const [phone, setPhone] = useState(shop.shop?.phone ?? '')
  const [email, setEmail] = useState(shop.shop?.email ?? '')
  const [placeId, setPlaceId] = useState(shop.shop?.address?.placeId)
  const [detail, setDetail] = useState(shop.shop?.address?.detail ?? '')
  const save = useSaveStep((body: { name?: string; phone?: string; email?: string; placeId?: string; addressDetail?: string }) =>
    api.PUT('/api/merchant/shop/steps/1', { body }),
  )
  const submit = (andNext: boolean) =>
    save.mutate(
      { name: str(name), phone: str(phone), email: str(email), placeId, addressDetail: str(detail) },
      { onSuccess: () => (andNext ? onNext() : toast.success('Đã lưu nháp.')) },
    )

  return (
    <StepCard title="1 · Thông tin cửa hàng" footer={<SaveButtons pending={save.isPending} onSave={submit} />}>
      <Field id="shop-name" label="Tên cửa hàng" error={save.fieldErrors.name}>
        <Input id="shop-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <AddressPicker
        label="Địa chỉ cửa hàng"
        current={shop.shop?.address?.formattedAddress}
        onPick={(p) => setPlaceId(p.placeId)}
      />
      <Field id="shop-detail" label="Địa chỉ chi tiết" hint="Số nhà, tầng, kiot… (tuỳ chọn)" error={save.fieldErrors.addressDetail}>
        <Input id="shop-detail" maxLength={200} value={detail} onChange={(e) => setDetail(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-4">
        <Field id="shop-phone" label="Số điện thoại cửa hàng" error={save.fieldErrors.phone}>
          <Input id="shop-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field id="shop-email" label="Email cửa hàng" error={save.fieldErrors.email}>
          <Input id="shop-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}

// --- step 2

function ShippingStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const s = shop.shipping
  const [hours, setHours] = useState<OpeningWindow[]>(toEditorWindows(s?.openingHours))
  const [radius, setRadius] = useState(s?.deliveryRadiusKm?.toString() ?? '')
  const [fee, setFee] = useState(s?.deliveryFee?.toString() ?? '')
  const [free, setFree] = useState(s?.freeDeliveryThreshold?.toString() ?? '')
  const [min, setMin] = useState(s?.minOrderValue?.toString() ?? '')
  const save = useSaveStep(
    (body: {
      openingHours: OpeningWindow[]
      deliveryRadiusKm?: number
      deliveryFee?: number
      freeDeliveryThreshold?: number
      minOrderValue?: number
    }) => api.PUT('/api/merchant/shop/steps/2', { body }),
  )
  const submit = (andNext: boolean) =>
    save.mutate(
      { openingHours: hours, deliveryRadiusKm: num(radius), deliveryFee: num(fee), freeDeliveryThreshold: num(free), minOrderValue: num(min) },
      { onSuccess: () => (andNext ? onNext() : toast.success('Đã lưu nháp.')) },
    )

  return (
    <StepCard
      title="2 · Giao hàng & giờ mở cửa"
      description="Giờ Việt Nam. Phí giao hàng là doanh thu của cửa hàng (không có tài xế riêng)."
      footer={<SaveButtons pending={save.isPending} onSave={submit} />}
    >
      <div className="flex flex-col gap-2">
        <Label>Giờ mở cửa</Label>
        <OpeningHoursEditor value={hours} onChange={setHours} />
      </div>
      <div className="flex flex-wrap gap-4">
        <Field
          id="ship-radius"
          label="Bán kính giao (km)"
          hint={`Tối đa ${shop.maxDeliveryRadiusKm} km, tính đường chim bay từ cửa hàng.`}
          error={save.fieldErrors.deliveryRadiusKm}
        >
          <Input id="ship-radius" inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value)} />
        </Field>
        <Field id="ship-fee" label="Phí giao hàng (₫)" hint="0 = miễn phí." error={save.fieldErrors.deliveryFee}>
          <Input id="ship-fee" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-4">
        <Field id="ship-free" label="Miễn phí giao từ (₫, tuỳ chọn)" error={save.fieldErrors.freeDeliveryThreshold}>
          <Input id="ship-free" inputMode="numeric" value={free} onChange={(e) => setFree(e.target.value)} />
        </Field>
        <Field id="ship-min" label="Đơn tối thiểu (₫, tuỳ chọn)" error={save.fieldErrors.minOrderValue}>
          <Input id="ship-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
        </Field>
      </div>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}

// --- uploads

function useUpload(kind: 'business-license' | 'identity-front' | 'identity-selfie') {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data, error } = await api.POST('/api/merchant/shop/files/{kind}', {
        params: { path: { kind } },
        body: form as unknown as { file: string },
        bodySerializer: (body) => body as unknown as FormData,
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      toast.success('Đã tải tệp lên.')
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
}

function UploadBox({
  label,
  hint,
  kind,
  accept,
  previewUrl,
}: {
  label: string
  hint: string
  kind: 'business-license' | 'identity-front' | 'identity-selfie'
  accept: string
  previewUrl?: string
}) {
  const upload = useUpload(kind)
  const id = `upload-${kind}`
  return (
    <div className="flex flex-1 basis-60 flex-col gap-2 rounded-lg border border-dashed p-4">
      <span className="text-sm font-medium">{label}</span>
      {previewUrl ? (
        kind === 'business-license' ? (
          <a className="text-sm text-primary hover:underline" href={previewUrl} target="_blank" rel="noreferrer">
            Xem tệp đã tải
          </a>
        ) : (
          <img src={previewUrl} alt={label} className="h-32 w-full rounded-md object-cover" />
        )
      ) : (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
      <label
        htmlFor={id}
        className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-semibold hover:bg-muted"
      >
        <UploadIcon className="size-4" /> {upload.isPending ? 'Đang tải…' : previewUrl ? 'Chọn tệp khác' : 'Chọn tệp'}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload.mutate(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// --- step 3

function TaxStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const t = shop.tax
  const [type, setType] = useState<'INDIVIDUAL' | 'HOUSEHOLD' | undefined>(t?.businessType as 'INDIVIDUAL' | 'HOUSEHOLD' | undefined)
  const [businessName, setBusinessName] = useState(t?.businessName ?? '')
  const [businessAddress, setBusinessAddress] = useState(t?.businessAddress ?? '')
  const [taxCode, setTaxCode] = useState(t?.taxCode ?? '')
  const [emails, setEmails] = useState<string[]>(t?.invoiceEmails?.length ? t.invoiceEmails : [''])
  const [bankName, setBankName] = useState(t?.payout?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState('')
  const [holder, setHolder] = useState(t?.payout?.accountHolderName ?? '')
  const save = useSaveStep(
    (body: {
      businessType?: 'INDIVIDUAL' | 'HOUSEHOLD'
      businessName?: string
      businessAddress?: string
      taxCode?: string
      invoiceEmails: string[]
      bankName?: string
      accountNumber?: string
      accountHolderName?: string
    }) => api.PUT('/api/merchant/shop/steps/3', { body }),
  )
  const submit = (andNext: boolean) =>
    save.mutate(
      {
        businessType: type,
        businessName: type === 'HOUSEHOLD' ? str(businessName) : undefined,
        businessAddress: str(businessAddress),
        taxCode: str(taxCode),
        invoiceEmails: emails.map((e) => e.trim()).filter(Boolean),
        bankName: str(bankName),
        accountNumber: str(accountNumber.replace(/\s/g, '')),
        accountHolderName: str(holder),
      },
      {
        onSuccess: () => {
          setAccountNumber('')
          if (andNext) onNext()
          else toast.success('Đã lưu nháp.')
        },
      },
    )
  const mismatch = t?.payout?.holderMatchesIdentity === false

  return (
    <StepCard title="3 · Thuế & tài khoản nhận tiền" footer={<SaveButtons pending={save.isPending} onSave={submit} />}>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Loại hình kinh doanh</legend>
        <div className="flex flex-wrap gap-4">
          {(
            [
              ['INDIVIDUAL', 'Cá nhân'],
              ['HOUSEHOLD', 'Hộ kinh doanh'],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex min-h-9 items-center gap-2 text-sm">
              <input type="radio" name="business-type" checked={type === value} onChange={() => setType(value)} /> {label}
            </label>
          ))}
        </div>
      </fieldset>
      {type === 'HOUSEHOLD' ? (
        <Field id="tax-bname" label="Tên hộ kinh doanh" error={save.fieldErrors.businessName}>
          <Input id="tax-bname" maxLength={200} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </Field>
      ) : null}
      <Field id="tax-address" label="Địa chỉ đăng ký kinh doanh" error={save.fieldErrors.businessAddress}>
        <Input id="tax-address" maxLength={300} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
      </Field>
      <Field id="tax-code" label="Mã số thuế" hint="10 số, 10 số kèm mã chi nhánh (-001), hoặc 12 số CCCD." error={save.fieldErrors.taxCode}>
        <Input id="tax-code" value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
      </Field>
      <div className="flex flex-col gap-2">
        <Label>Email nhận hoá đơn điện tử (tối đa 5)</Label>
        {emails.map((value, i) => (
          <div key={i} className="flex gap-2">
            <Input
              type="email"
              aria-label={`Email hoá đơn ${i + 1}`}
              aria-invalid={!!save.fieldErrors[`invoiceEmails[${i}]`]}
              value={value}
              onChange={(e) => setEmails(emails.map((x, j) => (j === i ? e.target.value : x)))}
            />
            {emails.length > 1 ? (
              <Button type="button" variant="ghost" onClick={() => setEmails(emails.filter((_, j) => j !== i))}>
                Xoá
              </Button>
            ) : null}
          </div>
        ))}
        {emails.length < 5 ? (
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setEmails([...emails, ''])}>
            Thêm email
          </Button>
        ) : null}
      </div>
      {type === 'HOUSEHOLD' ? (
        <UploadBox
          label="Giấy phép kinh doanh"
          hint="Ảnh hoặc PDF, tối đa 10 MB."
          kind="business-license"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          previewUrl={t?.businessLicenseUrl}
        />
      ) : null}
      <div className="flex flex-col gap-4 border-t pt-4">
        <p className="text-sm font-medium">Tài khoản nhận tiền</p>
        <div className="flex flex-wrap gap-4">
          <Field id="pay-bank" label="Ngân hàng" error={save.fieldErrors.bankName}>
            <Input id="pay-bank" maxLength={100} value={bankName} onChange={(e) => setBankName(e.target.value)} />
          </Field>
          <Field
            id="pay-number"
            label="Số tài khoản"
            hint={t?.payout?.accountLast4 ? `Đã lưu ••••${t.payout.accountLast4}; để trống để giữ nguyên.` : undefined}
            error={save.fieldErrors.accountNumber}
          >
            <Input id="pay-number" inputMode="numeric" autoComplete="off" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          </Field>
        </div>
        <Field
          id="pay-holder"
          label="Chủ tài khoản"
          hint="Phải là chủ cửa hàng, trùng tên trên giấy tờ ở bước 4."
          error={save.fieldErrors.accountHolderName}
        >
          <Input id="pay-holder" maxLength={100} value={holder} onChange={(e) => setHolder(e.target.value)} />
        </Field>
        {mismatch ? (
          <p className="flex items-center gap-2 rounded-md bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
            <TriangleAlertIcon className="size-4 shrink-0" /> Tên chủ tài khoản khác tên trên giấy tờ; quản trị viên sẽ kiểm tra kỹ hơn.
          </p>
        ) : null}
      </div>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}

// --- step 4

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

function IdentityStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const id = shop.identity
  const terms = useLegalDocument('SELLER_TERMS')
  const privacy = useLegalDocument('PRIVACY_POLICY')
  const [docType, setDocType] = useState<'CCCD' | 'CMND' | undefined>((id?.docType as 'CCCD' | 'CMND' | undefined) ?? 'CCCD')
  const [docNumber, setDocNumber] = useState('')
  const [fullName, setFullName] = useState(id?.fullName ?? '')
  const [accurate, setAccurate] = useState(id?.accuracyConfirmed ?? false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [consent, setConsent] = useState(false)
  const save = useSaveStep(
    (body: {
      docType?: 'CCCD' | 'CMND'
      docNumber?: string
      fullName?: string
      accuracyConfirmed?: boolean
      sellerTermsDocumentId?: string
      privacyPolicyDocumentId?: string
    }) => api.PUT('/api/merchant/shop/steps/4', { body }),
  )
  const submit = (andNext: boolean) =>
    save.mutate(
      {
        docType,
        docNumber: str(docNumber),
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

  return (
    <StepCard
      title="4 · Định danh chủ cửa hàng"
      description="Giấy tờ được mã hoá; chỉ quản trị viên có quyền riêng mới xem được và mỗi lần xem đều được ghi lại."
      footer={<SaveButtons pending={save.isPending || terms.isPending || privacy.isPending} onSave={submit} />}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Loại giấy tờ</legend>
        <div className="flex gap-4">
          {(['CCCD', 'CMND'] as const).map((value) => (
            <label key={value} className="flex min-h-9 items-center gap-2 text-sm">
              <input type="radio" name="doc-type" checked={docType === value} onChange={() => setDocType(value)} /> {value}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-4">
        <Field
          id="id-number"
          label="Số giấy tờ"
          hint={id?.docNumberLast4 ? `Đã lưu ••••${id.docNumberLast4}; để trống để giữ nguyên.` : 'CCCD 12 số, CMND 9 hoặc 12 số.'}
          error={save.fieldErrors.docNumber}
        >
          <Input id="id-number" inputMode="numeric" autoComplete="off" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
        </Field>
        <Field id="id-name" label="Họ tên như trên giấy tờ" error={save.fieldErrors.fullName}>
          <Input id="id-name" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
      </div>
      <div className="flex flex-wrap gap-4">
        <UploadBox label="Ảnh mặt trước giấy tờ" hint="JPG/PNG/WebP, tối đa 8 MB." kind="identity-front" accept="image/jpeg,image/png,image/webp" previewUrl={id?.frontPhotoUrl} />
        <UploadBox label="Ảnh bạn cầm giấy tờ" hint="Thấy rõ mặt và giấy tờ." kind="identity-selfie" accept="image/jpeg,image/png,image/webp" previewUrl={id?.selfiePhotoUrl} />
      </div>
      <div className="flex flex-col gap-3 border-t pt-4 text-sm">
        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-0.5 size-4" checked={accurate} onChange={(e) => setAccurate(e.target.checked)} />
          Tôi cam kết mọi thông tin đã cung cấp là chính xác và trung thực.
        </label>
        {id?.sellerTermsAccepted ? (
          <p className="flex items-center gap-2 text-success-fg">
            <CheckIcon className="size-4" /> Đã đồng ý Điều khoản dành cho người bán.
          </p>
        ) : (
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 size-4" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span>
              Tôi đồng ý với{' '}
              <Link to="/legal/SELLER_TERMS" target="_blank" className="text-primary underline">
                {terms.data?.title ?? 'Điều khoản dành cho người bán'}
              </Link>
              .
            </span>
          </label>
        )}
        {id?.identityConsentGiven ? (
          <p className="flex items-center gap-2 text-success-fg">
            <CheckIcon className="size-4" /> Đã đồng ý xử lý dữ liệu định danh.
          </p>
        ) : (
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-0.5 size-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              Tôi đồng ý để bonbon xử lý dữ liệu định danh nhằm xác minh cửa hàng — xem{' '}
              <Link to="/legal/PRIVACY_POLICY" target="_blank" className="text-primary underline">
                {privacy.data?.title ?? 'Chính sách quyền riêng tư'}
              </Link>
              .
            </span>
          </label>
        )}
      </div>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}

// --- step 5

function ReviewStep({ shop, goTo }: { shop: ShopApplication; goTo: (step: number) => void }) {
  const queryClient = useQueryClient()
  const submit = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/merchant/shop/submit')
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      toast.success('Đã gửi hồ sơ. Bạn sẽ nhận email khi có kết quả.')
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
      title="5 · Xác nhận & gửi duyệt"
      description="Quản trị viên xem hồ sơ và bạn nhận email khi có kết quả. Trong lúc chờ, hồ sơ không sửa được."
      footer={
        <Button disabled={incomplete.length > 0 || submit.isPending} onClick={() => submit.mutate()}>
          {shop.status === 'REJECTED' ? 'Gửi lại hồ sơ' : 'Gửi duyệt'}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {(shop.steps ?? []).map((s) => (
          <li key={s.step} className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <span className={cn('flex size-6 items-center justify-center rounded-full', s.complete ? 'bg-success text-white' : 'bg-warning-subtle text-warning-fg')}>
              {s.complete ? <CheckIcon className="size-4" /> : '!'}
            </span>
            <span className="font-medium">{STEPS[(s.step ?? 1) - 1]}</span>
            {!s.complete ? (
              <span className="text-muted-foreground">Còn thiếu: {(s.missing ?? []).map((f) => FIELD_LABEL[f] ?? f).join(', ')}</span>
            ) : null}
            <Button variant="link" size="sm" className="ml-auto" onClick={() => goTo(s.step ?? 1)}>
              {s.complete ? 'Xem lại' : 'Bổ sung'}
            </Button>
          </li>
        ))}
      </ul>
      {submit.isError ? <FormError message={problemMessage(submit.error)} /> : null}
    </StepCard>
  )
}
