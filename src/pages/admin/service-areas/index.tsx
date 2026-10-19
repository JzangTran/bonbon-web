import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, MapPinIcon, PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SERVICE_AREAS_QUERY_KEY, useServiceAreas, type ServiceArea, type ServiceAreaInput } from '@/entities/service-area'
import { useSession } from '@/entities/session'
import { MapDialog } from '@/features/shop-address'
import { api, problemFieldErrors, problemMessage } from '@/shared/api'
import type { Errors } from '@/shared/lib/validate'
import { requiredText } from '@/shared/lib/validate'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { FormError } from '@/widgets/auth-shell'

/** A distance in km as people type it, with a comma or a dot; NaN when it is not a number. */
function km(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text.trim().replace(',', '.'))
}

function kmError(e: Errors, field: string, text: string, label: string) {
  const n = km(text)
  if (Number.isNaN(n)) e[field] = `Hãy nhập ${label[0].toLowerCase()}${label.slice(1)} (km).`
  else if (n < 0.1 || n > 50) e[field] = `${label} từ 0,1 đến 50 km.`
  else if (Math.round(n * 10) !== n * 10) e[field] = `${label} chỉ lấy một chữ số thập phân.`
}

/**
 * The places bonbon serves, curated by administrators: each a circle around a centre, plus the largest delivery radius a shop
 * inside it may set. A shop belongs to the area that contains its map point.
 */
export function AdminServiceAreasPage() {
  const { session } = useSession()
  const areas = useServiceAreas()
  const [editing, setEditing] = useState<ServiceArea | 'new' | null>(null)

  if (!session?.permissions.has('merchant-approval:read')) {
    return <p className="text-muted-foreground">Bạn không có quyền xem khu vực phục vụ.</p>
  }
  const canWrite = session.permissions.has('merchant-approval:write-settings')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold">Khu vực phục vụ</h1>
          <p className="text-sm text-muted-foreground">
            Mỗi khu vực là một hình tròn quanh một tâm (một chung cư, một khu công nghiệp). Quán có vị trí nằm trong hình tròn thuộc khu vực đó
            và không đặt bán kính giao vượt mức tối đa của khu vực. Quán nằm ngoài mọi khu vực không mở được.
          </p>
        </div>
        {canWrite ? (
          <Button onClick={() => setEditing('new')}>
            <PlusIcon /> Thêm khu vực
          </Button>
        ) : null}
      </div>

      {areas.isError ? <FormError message={problemMessage(areas.error)} /> : null}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên khu vực</TableHead>
              <TableHead>Tâm</TableHead>
              <TableHead className="text-right">Bán kính khu vực</TableHead>
              <TableHead className="text-right">Giao tối đa</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Thao tác</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.isPending
              ? Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-6" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {areas.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Chưa có khu vực nào. Khi chưa có khu vực, chưa quán nào đặt được vị trí để mở cửa hàng.
                </TableCell>
              </TableRow>
            ) : null}
            {areas.data?.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell className="tabular-nums">
                  {a.centerLat.toFixed(4)}, {a.centerLng.toFixed(4)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{a.radiusKm.toLocaleString('vi-VN')} km</TableCell>
                <TableCell className="text-right tabular-nums">{a.maxDeliveryRadiusKm.toLocaleString('vi-VN')} km</TableCell>
                <TableCell>{a.active ? <Badge className="bg-success-subtle text-success-fg">Đang hoạt động</Badge> : <Badge variant="outline">Đã tắt</Badge>}</TableCell>
                <TableCell className="text-right">
                  {canWrite ? (
                    <Button variant="link" size="sm" onClick={() => setEditing(a)}>
                      Sửa
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing ? <AreaDialog key={editing === 'new' ? 'new' : editing.id} area={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

/** Adding or editing one area. The centre is chosen on the map; the rest is typed. */
function AreaDialog({ area, onClose }: { area: ServiceArea | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(area?.name ?? '')
  const [centre, setCentre] = useState<{ lat: number; lng: number } | undefined>(area ? { lat: area.centerLat, lng: area.centerLng } : undefined)
  const [radius, setRadius] = useState(area ? String(area.radiusKm) : '')
  const [maxDelivery, setMaxDelivery] = useState(area ? String(area.maxDeliveryRadiusKm) : '')
  const [active, setActive] = useState(area?.active ?? true)
  const [mapOpen, setMapOpen] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const save = useMutation({
    mutationFn: async (body: ServiceAreaInput) => {
      const { data, error } = area
        ? await api.PATCH('/api/admin/service-areas/{id}', { params: { path: { id: area.id } }, body })
        : await api.POST('/api/admin/service-areas', { body })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICE_AREAS_QUERY_KEY })
      toast.success(area ? 'Đã cập nhật khu vực.' : 'Đã thêm khu vực.')
      onClose()
    },
    onError: (e) => setErrors(problemFieldErrors(e)),
  })

  const submit = () => {
    const e: Errors = {}
    requiredText(e, 'name', name, 'tên khu vực', 100, 2)
    if (!centre) e.centerLat = 'Hãy chọn tâm khu vực trên bản đồ.'
    kmError(e, 'radiusKm', radius, 'Bán kính khu vực')
    kmError(e, 'maxDeliveryRadiusKm', maxDelivery, 'Bán kính giao tối đa')
    setErrors(e)
    if (Object.keys(e).length > 0 || !centre) return
    save.mutate({ name: name.trim(), centerLat: centre.lat, centerLng: centre.lng, radiusKm: km(radius), maxDeliveryRadiusKm: km(maxDelivery), active })
  }

  return (
    <>
      <Dialog open onOpenChange={(o) => (o ? null : onClose())}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{area ? 'Sửa khu vực phục vụ' : 'Thêm khu vực phục vụ'}</DialogTitle>
            <DialogDescription>Quán thuộc khu vực có tâm gần nhất khi nhiều khu vực chồng lên nhau.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(ev) => {
              ev.preventDefault()
              submit()
            }}
          >
            <FormRow label="Tên khu vực" required htmlFor="area-name" error={errors.name}>
              <Input id="area-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
            </FormRow>
            <FormRow label="Tâm khu vực" required error={errors.centerLat ?? errors.centerLng}>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setMapOpen(true)}>
                  <MapPinIcon /> {centre ? 'Chọn lại' : 'Chọn trên bản đồ'}
                </Button>
                {centre ? (
                  <span className="flex items-center gap-1.5 text-sm text-success-fg">
                    <CheckIcon className="size-4" aria-hidden="true" />
                    {centre.lat.toFixed(5)}, {centre.lng.toFixed(5)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Chưa chọn</span>
                )}
              </div>
            </FormRow>
            <FormRow label="Bán kính khu vực (km)" required htmlFor="area-radius" hint="Quán cách tâm không quá chừng này thì thuộc khu vực." error={errors.radiusKm}>
              <Input id="area-radius" inputMode="decimal" maxLength={4} value={radius} onChange={(e) => setRadius(e.target.value)} />
            </FormRow>
            <FormRow label="Giao tối đa (km)" required htmlFor="area-max" hint="Bán kính giao lớn nhất quán trong khu vực được đặt." error={errors.maxDeliveryRadiusKm}>
              <Input id="area-max" inputMode="decimal" maxLength={4} value={maxDelivery} onChange={(e) => setMaxDelivery(e.target.value)} />
            </FormRow>
            {area ? (
              <FormRow label="Trạng thái" hint="Khu vực đã tắt không nhận thêm quán mới; quán đang thuộc khu vực giữ nguyên.">
                <label className="flex min-h-9 items-center gap-2 text-sm">
                  <input type="checkbox" className="size-4" checked={active} onChange={(e) => setActive(e.target.checked)} /> Đang hoạt động
                </label>
              </FormRow>
            ) : null}
            {save.isError && Object.keys(errors).length === 0 ? <FormError message={problemMessage(save.error)} /> : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Huỷ
              </Button>
              <Button type="submit" disabled={save.isPending}>
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <MapDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        initial={centre}
        startQuery={name.trim().length >= 3 ? name.trim() : undefined}
        onConfirm={({ lat, lng }) => {
          setCentre({ lat, lng })
          setMapOpen(false)
        }}
      />
    </>
  )
}
