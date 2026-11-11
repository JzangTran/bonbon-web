import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { leaves, useCategoryTree, useFlagDish, useShopDishes, type ShopDish } from '@/entities/dish-category-case'
import { useMerchants } from '@/entities/merchant-directory'
import { problemMessage } from '@/shared/api'
import { formatVnd } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { useNavigate, useSearchParams } from 'react-router'
import { consolePath } from '@/shared/config/sites'
import { SubPage } from '@/shared/ui/sub-page'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { CategorySelect } from '@/shared/ui/category-select'
import { intlLocale, t } from '@/shared/i18n'

/**
 * /category-moderation/flag: three steps on a page of their own: find the shop, pick the misfiled dish from its menu (with category path and rate to compare), then say which category it
 * belongs in, why, and how long the shop has to fix it.
 */
export function FlagDishPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialVendorId = params.get('vendorId') ?? ''
  const [vendor, setVendor] = useState<{ id: string; name: string } | null>(initialVendorId ? { id: initialVendorId, name: '' } : null)
  const [dish, setDish] = useState<ShopDish | null>(null)
  const back = consolePath('/category-moderation') + (initialVendorId ? `?vendorId=${initialVendorId}` : '')

  return (
    <SubPage
      back={{ to: back, label: t('Món sai ngành') }}
      title={t('Đánh dấu món sai ngành')}
      description={t('Món bị ẩn khỏi tìm kiếm và lọc ngành đến khi quán sửa; quá hạn hệ thống áp dụng ngành bạn gợi ý. Món vẫn có trên thực đơn và vẫn đặt được.')}
    >
      {!vendor ? <ShopStep onPick={setVendor} /> : !dish ? <DishStep vendor={vendor} onBack={() => setVendor(null)} onPick={setDish} /> : <FlagStep dish={dish} onBack={() => setDish(null)} onDone={() => navigate(back)} />}
    </SubPage>
  )
}

function ShopStep({ onPick }: { onPick: (shop: { id: string; name: string }) => void }) {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const shops = useMerchants('APPROVED', q, 0, true)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{t('1 · Chọn cửa hàng')}</p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setQ(search)
        }}
      >
        <Input type="search" placeholder={t('Tìm theo tên, phường, tỉnh')} aria-label={t('Tìm cửa hàng')} value={search} onChange={(e) => setSearch(e.target.value)} />
        <Button type="submit" variant="outline">
          {t('Tìm')}
        </Button>
      </form>
      {shops.isError ? <FormError message={problemMessage(shops.error)} /> : null}
      {shops.isPending ? <Skeleton className="h-24" /> : null}
      {shops.data && (shops.data.items ?? []).length === 0 ? <p className="text-sm text-muted-foreground">{t('Không có cửa hàng nào khớp.')}</p> : null}
      <ul className="flex max-h-72 flex-col divide-y overflow-y-auto rounded-sm border">
        {(shops.data?.items ?? []).map((s) => (
          <li key={s.vendorId}>
            <button type="button" className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted/50" onClick={() => onPick({ id: s.vendorId ?? '', name: s.name ?? '' })}>
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-muted-foreground">{[s.ward, s.province].filter(Boolean).join(', ')}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DishStep({ vendor, onBack, onPick }: { vendor: { id: string; name: string }; onBack: () => void; onPick: (dish: ShopDish) => void }) {
  const dishes = useShopDishes(vendor.id)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t('2 · Chọn món của ')}{dishes.data?.shopName ?? (vendor.name || t('cửa hàng'))}</p>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {t('Đổi cửa hàng')}
        </Button>
      </div>
      {dishes.isError ? <FormError message={problemMessage(dishes.error)} /> : null}
      {dishes.isPending ? <Skeleton className="h-24" /> : null}
      {dishes.data && (dishes.data.items ?? []).length === 0 ? <p className="text-sm text-muted-foreground">{t('Cửa hàng chưa có món nào.')}</p> : null}
      <ul className="flex max-h-80 flex-col divide-y overflow-y-auto rounded-sm border">
        {(dishes.data?.items ?? []).map((d) => (
          <li key={d.id}>
            <button type="button" disabled={!!d.openCase} className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => onPick(d)}>
              <span className="flex flex-wrap items-center gap-2 font-medium">
                {d.name} <span className="font-normal text-muted-foreground tabular-nums">{formatVnd(d.price)}</span>
                {d.openCase ? <Badge className="bg-warning-subtle text-warning-fg">{t('Đang có vụ chưa đóng')}</Badge> : null}
              </span>
              <span className="text-xs text-muted-foreground">
                {d.categoryPath}{t(' · hoa hồng ')}{d.commissionRate !== undefined && d.commissionRate !== null ? `${d.commissionRate.toLocaleString(intlLocale)}%` : t('mặc định chung')}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FlagStep({ dish, onBack, onDone }: { dish: ShopDish; onBack: () => void; onDone: () => void }) {
  const tree = useCategoryTree()
  const options = useMemo(() => leaves(tree.data ?? []).filter((l) => l.id !== dish.categoryId), [tree.data, dish.categoryId])
  const flag = useFlagDish()
  const [suggested, setSuggested] = useState('')
  const [reason, setReason] = useState('')
  const [hours, setHours] = useState('24')
  const [error, setError] = useState<string | null>(null)
  const hoursValue = Number(hours)
  const hoursValid = Number.isFinite(hoursValue) && hoursValue >= 1 && hoursValue <= 168

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        flag.mutate(
          { dishId: dish.id ?? '', suggestedCategoryId: suggested, reason: reason.trim(), deadlineAt: new Date(Date.now() + hoursValue * 3_600_000).toISOString() },
          {
            onSuccess: () => {
              toast.success(t('Đã đánh dấu "{v0}". Quán đã được báo.', { v0: dish.name }))
              onDone()
            },
            onError: (err) => setError(problemMessage(err)),
          },
        )
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{t('3 · Ngành đúng của “')}{dish.name}”</p>
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {t('Đổi món')}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('Hiện ở: ')}{dish.categoryPath} ({dish.commissionRate !== undefined && dish.commissionRate !== null ? `${dish.commissionRate.toLocaleString(intlLocale)}%` : t('hoa hồng mặc định')})
      </p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="flag-category">{t('Ngành nên thuộc về')}</Label>
        <CategorySelect id="flag-category" options={options} value={suggested} onChange={setSuggested} loading={tree.isPending} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="flag-reason">{t('Lý do (quán sẽ thấy)')}</Label>
        <Textarea id="flag-reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="flag-hours">{t('Thời gian quán được sửa (giờ, tối đa 168)')}</Label>
        <Input id="flag-hours" type="number" min={1} max={168} className="max-w-32" value={hours} onChange={(e) => setHours(e.target.value)} />
        <p className="text-xs text-muted-foreground">{t('Quá hạn hệ thống tự chuyển món sang ngành bạn chọn; quán có 7 ngày để đồng ý hoặc kháng nghị.')}</p>
      </div>
      <FormError message={error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={suggested === '' || reason.trim() === '' || !hoursValid || flag.isPending}>
          {t('Đánh dấu món')}
        </Button>
      </div>
    </form>
  )
}
