import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  MENU_QUERY_KEY,
  OPTIONS_QUERY_KEY,
  useCategoryLeaves,
  type Menu,
  type MenuItem,
  type OptionGroups,
} from '@/entities/menu'
import { api, problemFieldErrors, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

const NATIVE_SELECT =
  'h-10 w-full rounded-sm border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

/** "45.000" or "45000" to 45000; empty or unreadable to undefined. */
function parseInteger(text: string): number | undefined {
  const cleaned = text.trim().replace(/\./g, '').replace(/\s/g, '')
  if (cleaned === '' || !/^\d+$/.test(cleaned)) return undefined
  return Number(cleaned)
}

/** Create or edit one dish: details, platform category, stock, photo and the option groups it offers. */
export function DishSheet({
  menu,
  groups,
  item,
  sectionId,
  onClose,
}: {
  menu: Menu
  groups: OptionGroups
  item: MenuItem | null
  sectionId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const leaves = useCategoryLeaves()
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [price, setPrice] = useState(item ? String(item.price ?? '') : '')
  const [section, setSection] = useState(item?.sectionId ?? sectionId)
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '')
  const [stock, setStock] = useState(item?.stockQuantity === undefined || item?.stockQuantity === null ? '' : String(item.stockQuantity))
  const [groupIds, setGroupIds] = useState<string[]>(item?.optionGroupIds ?? [])
  const [photo, setPhoto] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const sections = menu.sections ?? []
  const groupList = groups.groups ?? []
  const byParent = new Map<string, { id: string; name: string }[]>()
  for (const leaf of leaves.data ?? []) {
    byParent.set(leaf.group, [...(byParent.get(leaf.group) ?? []), leaf])
  }

  async function save() {
    const priceValue = parseInteger(price)
    if (priceValue === undefined) return setError('Giá món phải là số nguyên, ví dụ 45000.')
    const stockValue = parseInteger(stock)
    if (stock.trim() !== '' && stockValue === undefined) return setError('Số phần còn lại phải là số nguyên.')
    if (!categoryId) return setError('Hãy chọn ngành hàng cho món.')

    setPending(true)
    setError(null)
    setFieldErrors({})
    try {
      let id = item?.id
      if (!item) {
        const { data, error: problem } = await api.POST('/api/merchant/menu-items', {
          body: {
            sectionId: section,
            categoryId,
            name: name.trim(),
            price: priceValue,
            ...(description.trim() ? { description: description.trim() } : {}),
            ...(stockValue !== undefined ? { stockQuantity: stockValue } : {}),
          },
        })
        if (problem || !data) throw problem
        const before = new Set(sections.flatMap((s) => (s.items ?? []).map((i) => i.id)))
        // The response is the whole menu; the new dish is the one that was not there before.
        id = data.sections?.flatMap((s) => s.items ?? []).find((i) => !before.has(i.id))?.id
      } else {
        const { error: problem } = await api.PATCH('/api/merchant/menu-items/{id}', {
          params: { path: { id: item.id! } },
          body: {
            name: name.trim(),
            price: priceValue,
            categoryId,
            ...(section !== item.sectionId ? { sectionId: section } : {}),
            ...(description.trim() ? { description: description.trim() } : { clearDescription: true }),
            ...(stockValue !== undefined ? { stockQuantity: stockValue } : { clearStock: true }),
          },
        })
        if (problem) throw problem
      }
      // Order is part of the answer (it is the display order), so compare as lists.
      if (id && groupIds.join() !== (item?.optionGroupIds ?? []).join()) {
        const { error: problem } = await api.PUT('/api/merchant/menu-items/{id}/option-groups', {
          params: { path: { id } },
          body: { groupIds },
        })
        if (problem) throw problem
      }
      if (id && photo) {
        const form = new FormData()
        form.append('file', photo)
        const { error: problem } = await api.PUT('/api/merchant/menu-items/{id}/photo', {
          params: { path: { id } },
          body: form as unknown as { file: string },
          bodySerializer: (body) => body as unknown as FormData,
        })
        if (problem) throw problem
      } else if (id && removePhoto && item?.photoUrl) {
        const { error: problem } = await api.DELETE('/api/merchant/menu-items/{id}/photo', { params: { path: { id } } })
        if (problem) throw problem
      }
      toast.success(item ? 'Đã lưu món.' : 'Đã thêm món.')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: OPTIONS_QUERY_KEY }),
      ])
      onClose()
    } catch (e) {
      setError(problemMessage(e))
      setFieldErrors(problemFieldErrors(e))
      // Part of the work may have gone through (e.g. the dish exists but the photo failed), so show what is saved.
      void queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEY })
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{item ? 'Sửa món' : 'Thêm món'}</SheetTitle>
          <SheetDescription>Khách thấy tên, mô tả, giá và ảnh. Ngành hàng quyết định tỷ lệ hoa hồng của món.</SheetDescription>
        </SheetHeader>
        <form
          className="flex flex-1 flex-col gap-4 px-4"
          id="dish-form"
          onSubmit={(e) => {
            e.preventDefault()
            void save()
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="dish-name">Tên món</Label>
            <Input id="dish-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(fieldErrors.name)} />
            {fieldErrors.name ? <p className="text-sm text-destructive">{fieldErrors.name}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dish-desc">Mô tả (không bắt buộc)</Label>
            <Textarea id="dish-desc" maxLength={500} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dish-price">Giá (₫)</Label>
              <Input id="dish-price" required inputMode="numeric" className="tabular-nums" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dish-stock">Số phần còn lại</Label>
              <Input
                id="dish-stock"
                inputMode="numeric"
                className="tabular-nums"
                placeholder="Không giới hạn"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dish-section">Mục thực đơn</Label>
            <select id="dish-section" className={NATIVE_SELECT} value={section} onChange={(e) => setSection(e.target.value)}>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dish-category">Ngành hàng</Label>
            <select
              id="dish-category"
              required
              className={NATIVE_SELECT}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={leaves.isPending}
            >
              <option value="" disabled>
                Chọn ngành hàng…
              </option>
              {[...byParent.entries()].map(([parent, list]) => (
                <optgroup key={parent} label={parent}>
                  {list.map((leaf) => (
                    <option key={leaf.id} value={leaf.id}>
                      {leaf.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">Chọn sai ngành có thể làm món bị ẩn khỏi tìm kiếm.</p>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Nhóm lựa chọn của món</legend>
            {groupList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có nhóm lựa chọn. Tạo ở tab “Nhóm lựa chọn”.</p>
            ) : (
              groupList.map((g) => (
                <label key={g.id} className="flex min-h-10 items-center gap-3 rounded-sm border px-3 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={groupIds.includes(g.id!)}
                    onChange={(e) => setGroupIds((prev) => (e.target.checked ? [...prev, g.id!] : prev.filter((x) => x !== g.id)))}
                  />
                  <span className="flex-1">{g.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {g.min === 0 ? 'tuỳ chọn' : 'bắt buộc'}, chọn {g.min === g.max ? g.max : `${g.min}–${g.max}`}
                  </span>
                </label>
              ))
            )}
          </fieldset>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dish-photo">Ảnh món</Label>
            {item?.photoUrl && !removePhoto && !photo ? (
              <div className="flex items-center gap-3">
                <img src={item.photoUrl} alt="" className="size-16 object-cover" />
                <Button type="button" variant="outline" size="sm" onClick={() => setRemovePhoto(true)}>
                  Gỡ ảnh
                </Button>
              </div>
            ) : null}
            <Input
              id="dish-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                setPhoto(e.target.files?.[0] ?? null)
                setRemovePhoto(false)
              }}
            />
            <p className="text-xs text-muted-foreground">JPG, PNG hoặc WebP, tối đa 5 MB.</p>
          </div>
          <FormError message={error} />
        </form>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-4 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" form="dish-form" disabled={pending}>
            {item ? 'Lưu món' : 'Thêm món'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
