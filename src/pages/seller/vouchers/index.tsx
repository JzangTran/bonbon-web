import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { t } from '@/shared/i18n'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type Voucher = components['schemas']['ShopVoucher']

const KEY = ['merchant', 'vouchers']

/** The local time of a date field, in the form the browser's datetime-local input uses. */
function toLocalInput(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

const whole = (value: string) => {
  const n = Number(value.trim())
  return value.trim() !== '' && Number.isInteger(n) && n >= 0 ? n : undefined
}

function describe(v: Voucher) {
  const amount = v.discountType === 'PERCENT' ? `${v.discountValue}%` : formatVnd(v.discountValue)
  return v.maxDiscount ? t('Giảm {v0}, tối đa {v1}', { v0: amount, v1: formatVnd(v.maxDiscount) }) : t('Giảm {v0}', { v0: amount })
}

/** The shop's vouchers (manage-vouchers.md). The shop funds them; a voucher already used is switched off, never deleted. */
export function SellerVouchersPage() {
  const queryClient = useQueryClient()
  const [adding, setAdding] = useState(false)
  const [now] = useState(() => Date.now())
  const list = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/vouchers')
      if (error || !data) throw error
      return data
    },
  })
  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACTIVE' | 'DISABLED' }) => {
      const { error } = await api.PATCH('/api/merchant/vouchers/{id}/status', { params: { path: { id } }, body: { status } })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    onError: (e) => toast.error(problemMessage(e)),
  })

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('Voucher của quán')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('Khách chọn voucher ở trang quán hoặc giỏ hàng. Quán chịu khoản giảm, và hoa hồng được tính trên tiền món sau giảm.')}
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <PlusIcon />
          {t('Tạo voucher')}
        </Button>
      </div>

      {adding ? <VoucherForm onDone={() => setAdding(false)} /> : null}
      {list.isPending ? <Skeleton className="h-32" /> : null}
      <FormError message={list.isError ? problemMessage(list.error) : null} />
      {list.data && list.data.length === 0 ? <p className="text-muted-foreground">{t('Quán chưa có voucher nào.')}</p> : null}

      <ul className="flex flex-col gap-3">
        {(list.data ?? []).map((v) => {
          const on = v.status === 'ACTIVE'
          const ended = new Date(v.validTo!).getTime() < now
          return (
            <li key={v.id}>
              <Card className="flex-row flex-wrap items-center gap-4 p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold">{v.code}</span>
                    {!on ? <Badge variant="secondary">{t('Đã tắt')}</Badge> : ended ? <Badge variant="secondary">{t('Hết hạn')}</Badge> : null}
                  </div>
                  <p className="text-sm">
                    {describe(v)}
                    {v.minOrderValue ? ` · ${t('đơn từ {v0}', { v0: formatVnd(v.minOrderValue) })}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(v.validFrom)} – {formatDateTime(v.validTo)} · {t('Đã dùng {v0}', { v0: `${v.usedCount}${v.usageLimit ? `/${v.usageLimit}` : ''}` })}
                    {v.maxPerCustomer ? ` · ${t('mỗi khách {v0} lần', { v0: v.maxPerCustomer })}` : ''}
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: v.id!, status: on ? 'DISABLED' : 'ACTIVE' })}>
                  {on ? t('Tắt voucher') : t('Bật lại voucher')}
                </Button>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function VoucherForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT')
  const [value, setValue] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [minOrder, setMinOrder] = useState('')
  const [from, setFrom] = useState(() => toLocalInput(new Date()))
  const [to, setTo] = useState(() => toLocalInput(new Date(Date.now() + 7 * 24 * 3600_000)))
  const [limit, setLimit] = useState('')
  const [perCustomer, setPerCustomer] = useState('')
  const [problem, setProblem] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await api.POST('/api/merchant/vouchers', {
        body: {
          code: code.trim(),
          discountType: type,
          discountValue: whole(value) ?? 0,
          validFrom: new Date(from).toISOString(),
          validTo: new Date(to).toISOString(),
          ...(type === 'PERCENT' && whole(maxDiscount) ? { maxDiscount: whole(maxDiscount) } : {}),
          ...(whole(minOrder) ? { minOrderValue: whole(minOrder) } : {}),
          ...(whole(limit) ? { usageLimit: whole(limit) } : {}),
          ...(whole(perCustomer) ? { maxPerCustomer: whole(perCustomer) } : {}),
        },
      })
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success(t('Đã tạo voucher.'))
      await queryClient.invalidateQueries({ queryKey: KEY })
      onDone()
    },
    onError: (e) => setProblem(problemMessage(e)),
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setProblem(null)
    if (!/^[A-Za-z0-9_-]{3,20}$/.test(code.trim())) return setProblem(t('Mã gồm 3 đến 20 chữ, số, gạch ngang hoặc gạch dưới.'))
    const amount = whole(value)
    if (!amount) return setProblem(t('Mức giảm phải là số nguyên lớn hơn 0.'))
    if (type === 'PERCENT' && amount > 100) return setProblem(t('Mức giảm phần trăm tối đa là 100%.'))
    if (new Date(to) <= new Date(from)) return setProblem(t('Ngày kết thúc phải sau ngày bắt đầu.'))
    save.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Tạo voucher')}</CardTitle>
        <CardDescription>{t('Sau khi tạo, mã không đổi được. Muốn ngừng, hãy tắt voucher.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field id="voucher-code" label={t('Mã voucher')}>
            <Input id="voucher-code" className="uppercase" maxLength={20} placeholder="SALE20" value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
          <Field id="voucher-type" label={t('Loại giảm')}>
            <select
              id="voucher-type"
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as 'PERCENT' | 'FIXED')}
            >
              <option value="PERCENT">{t('Phần trăm (%)')}</option>
              <option value="FIXED">{t('Số tiền (₫)')}</option>
            </select>
          </Field>
          <Field id="voucher-value" label={type === 'PERCENT' ? t('Mức giảm (%)') : t('Mức giảm (₫)')}>
            <Input id="voucher-value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
          {type === 'PERCENT' ? (
            <Field id="voucher-max" label={t('Giảm tối đa (₫, không bắt buộc)')}>
              <Input id="voucher-max" inputMode="numeric" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
            </Field>
          ) : null}
          <Field id="voucher-min" label={t('Đơn tối thiểu (₫, không bắt buộc)')}>
            <Input id="voucher-min" inputMode="numeric" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
          </Field>
          <Field id="voucher-from" label={t('Bắt đầu')}>
            <Input id="voucher-from" type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field id="voucher-to" label={t('Kết thúc')}>
            <Input id="voucher-to" type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
          <Field id="voucher-limit" label={t('Tổng lượt dùng (bỏ trống là không giới hạn)')}>
            <Input id="voucher-limit" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </Field>
          <Field id="voucher-per-customer" label={t('Lượt mỗi khách (bỏ trống là không giới hạn)')}>
            <Input id="voucher-per-customer" inputMode="numeric" value={perCustomer} onChange={(e) => setPerCustomer(e.target.value)} />
          </Field>
          <div className="flex flex-col gap-3 sm:col-span-2">
            <FormError message={problem} />
            <div className="flex gap-2">
              <Button type="submit" disabled={save.isPending}>
                {t('Tạo voucher')}
              </Button>
              <Button type="button" variant="ghost" onClick={onDone}>
                {t('Huỷ')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
