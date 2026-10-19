import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ShopApplication } from '@/entities/shop'
import { api, problemMessage } from '@/shared/api'
import { BANK_ACCOUNT, TAX_CODE, isEmail, requiredText, type Errors } from '@/shared/lib/validate'
import { Button } from '@/shared/ui/button'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { FormError } from '@/widgets/auth-shell'
import { Field, SaveButtons, StepCard, UploadField } from './step-kit'
import { str, useStep } from './step-logic'

type Body = {
  businessType?: 'INDIVIDUAL' | 'HOUSEHOLD'
  businessName?: string
  businessAddress?: string
  taxCode?: string
  invoiceEmails: string[]
  bankName?: string
  accountNumber?: string
  accountHolderName?: string
}

/** Step 3 · Thuế & nhận tiền: business type, tax code, invoice emails, licence for a household, payout account. */
export function TaxStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const t = shop.tax
  const [type, setType] = useState<'INDIVIDUAL' | 'HOUSEHOLD' | undefined>(t?.businessType as 'INDIVIDUAL' | 'HOUSEHOLD' | undefined)
  const [businessName, setBusinessName] = useState(t?.businessName ?? '')
  const [businessAddress, setBusinessAddress] = useState(t?.businessAddress ?? '')
  const [taxCode, setTaxCode] = useState(t?.taxCode ?? '')
  const [emails, setEmails] = useState<string[]>(t?.invoiceEmails?.length ? t.invoiceEmails : [''])
  const [bankName, setBankName] = useState(t?.payout?.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState('')
  const [holder, setHolder] = useState(t?.payout?.accountHolderName ?? '')
  const save = useStep((body: Body) => api.PUT('/api/merchant/shop/steps/3', { body }))
  const accountSaved = !!t?.payout?.accountLast4

  const problems = (strict: boolean): Errors => {
    const e: Errors = {}
    if (strict && type === undefined) e.businessType = 'Hãy chọn loại hình kinh doanh.'
    if (type === 'HOUSEHOLD' && (strict || businessName.trim() !== '')) requiredText(e, 'businessName', businessName, 'tên hộ kinh doanh', 200)
    if (strict || businessAddress.trim() !== '') requiredText(e, 'businessAddress', businessAddress, 'địa chỉ đăng ký kinh doanh', 300)
    const code = taxCode.trim()
    if (strict && code === '') e.taxCode = 'Hãy nhập mã số thuế.'
    else if (code !== '' && !TAX_CODE.test(code)) e.taxCode = 'Mã số thuế gồm 10 số, 10 số kèm -001 hoặc 12 số.'
    const typed = emails.map((x) => x.trim()).filter(Boolean)
    if (strict && typed.length === 0) e.invoiceEmails = 'Hãy nhập ít nhất một email nhận hoá đơn.'
    emails.forEach((x, i) => {
      if (x.trim() !== '' && !isEmail(x.trim())) e[`invoiceEmails[${i}]`] = 'Email không hợp lệ.'
    })
    if (strict || bankName.trim() !== '') requiredText(e, 'bankName', bankName, 'tên ngân hàng', 100)
    const account = accountNumber.replace(/\s/g, '')
    if (strict && account === '' && !accountSaved) e.accountNumber = 'Hãy nhập số tài khoản.'
    else if (account !== '' && !BANK_ACCOUNT.test(account)) e.accountNumber = 'Số tài khoản gồm 6–19 chữ số.'
    if (strict || holder.trim() !== '') requiredText(e, 'accountHolderName', holder, 'tên chủ tài khoản', 100)
    if (strict && type === 'HOUSEHOLD' && !t?.businessLicenseUrl) e.businessLicense = 'Hãy tải giấy phép kinh doanh.'
    return e
  }

  const submit = (andNext: boolean) => {
    if (!save.check(problems(andNext))) return
    save.mutate(
      {
        businessType: type,
        businessName: type === 'HOUSEHOLD' ? str(businessName) : undefined,
        businessAddress: str(businessAddress),
        taxCode: str(taxCode),
        invoiceEmails: emails.map((x) => x.trim()).filter(Boolean),
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
  }
  const mismatch = t?.payout?.holderMatchesIdentity === false

  return (
    <StepCard title="3 · Thuế & tài khoản nhận tiền" footer={<SaveButtons pending={save.isPending} onSave={submit} />}>
      <FormRow label="Loại hình kinh doanh" error={save.errors.businessType}>
        <div role="radiogroup" aria-label="Loại hình kinh doanh" className="flex flex-wrap gap-4">
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
      </FormRow>
      {type === 'HOUSEHOLD' ? (
        <Field id="tax-bname" label="Tên hộ kinh doanh" error={save.errors.businessName}>
          <Input id="tax-bname" maxLength={200} value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </Field>
      ) : null}
      <Field id="tax-address" label="Địa chỉ đăng ký kinh doanh" error={save.errors.businessAddress}>
        <Input id="tax-address" maxLength={300} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
      </Field>
      <Field id="tax-code" label="Mã số thuế" hint="10 số, 10 số kèm mã chi nhánh (-001), hoặc 12 số CCCD." error={save.errors.taxCode}>
        <Input id="tax-code" inputMode="numeric" maxLength={14} value={taxCode} onChange={(e) => setTaxCode(e.target.value)} />
      </Field>
      <FormRow label="Email nhận hoá đơn điện tử (tối đa 5)" error={save.errors.invoiceEmails}>
        {emails.map((value, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex gap-2">
              <Input
                type="email"
                aria-label={`Email hoá đơn ${i + 1}`}
                aria-invalid={!!save.errors[`invoiceEmails[${i}]`]}
                value={value}
                onChange={(e) => setEmails(emails.map((x, j) => (j === i ? e.target.value : x)))}
              />
              {emails.length > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setEmails(emails.filter((_, j) => j !== i))}>
                  Xoá
                </Button>
              ) : null}
            </div>
            {save.errors[`invoiceEmails[${i}]`] ? (
              <p role="alert" className="text-sm text-destructive">
                {save.errors[`invoiceEmails[${i}]`]}
              </p>
            ) : null}
          </div>
        ))}
        {emails.length < 5 ? (
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setEmails([...emails, ''])}>
            Thêm email
          </Button>
        ) : null}
      </FormRow>
      {type === 'HOUSEHOLD' ? (
        <UploadField
          label="Giấy phép kinh doanh"
          hint="Ảnh hoặc PDF, tối đa 10 MB."
          kind="business-license"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          maxMb={10}
          previewUrl={t?.businessLicenseUrl}
          error={save.errors.businessLicense}
        />
      ) : null}
      <p className="border-t pt-4 text-sm font-medium">Tài khoản nhận tiền</p>
      <Field id="pay-bank" label="Ngân hàng" error={save.errors.bankName}>
        <Input id="pay-bank" maxLength={100} value={bankName} onChange={(e) => setBankName(e.target.value)} />
      </Field>
      <Field
        id="pay-number"
        label="Số tài khoản"
        hint={t?.payout?.accountLast4 ? `Đã lưu ••••${t.payout.accountLast4}; để trống để giữ nguyên.` : undefined}
        error={save.errors.accountNumber}
      >
        <Input id="pay-number" inputMode="numeric" autoComplete="off" maxLength={24} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
      </Field>
      <Field id="pay-holder" label="Chủ tài khoản" hint="Phải là chủ cửa hàng, trùng tên trên giấy tờ ở bước 4." error={save.errors.accountHolderName}>
        <Input id="pay-holder" maxLength={100} value={holder} onChange={(e) => setHolder(e.target.value)} />
      </Field>
      {mismatch ? (
        <p className="flex items-center gap-2 rounded-sm bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
          <TriangleAlertIcon className="size-4 shrink-0" /> Tên chủ tài khoản khác tên trên giấy tờ; quản trị viên sẽ kiểm tra kỹ hơn.
        </p>
      ) : null}
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}
