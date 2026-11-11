import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ActionGroup } from '@/shared/ui/section'
import { t } from '@/shared/i18n'

/** The platform-wide delivery radius cap (set-delivery-radius-cap.md); applies to saves from now on. */
export function RadiusCapForm() {
  const queryClient = useQueryClient()
  const cap = useQuery({
    queryKey: ['admin', 'radius-cap'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/settings/delivery-radius-cap')
      if (error || !data) throw error
      return data
    },
  })
  const [value, setValue] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: async (maxRadiusKm: number) => {
      const { data, error } = await api.PUT('/api/admin/settings/delivery-radius-cap', { body: { maxRadiusKm } })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['admin', 'radius-cap'], data)
      setValue(null)
      toast.success(t('Đã cập nhật bán kính tối đa.'))
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
  const shown = value ?? (cap.data ? String(cap.data.maxRadiusKm) : '')

  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate(Number(shown.replace(',', '.')))
      }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 font-medium">{t('Bán kính giao tối đa của mọi quán')}</h2>
        <p className="text-ui text-muted-foreground">{t('Áp dụng cho lần lưu sau của các quán; quán đã duyệt giữ bán kính hiện tại. Mỗi khu vực có thể đặt mức thấp hơn.')}</p>
      </div>
      <Label htmlFor="radius-cap">Km</Label>
      <ActionGroup>
        <Input id="radius-cap" inputMode="decimal" className="w-32" value={shown} onChange={(e) => setValue(e.target.value)} />
        <Button type="submit" disabled={save.isPending || value === null}>
          {t('Lưu')}
        </Button>
      </ActionGroup>
    </form>
  )
}
