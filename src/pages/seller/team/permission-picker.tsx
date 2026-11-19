import { t } from '@/shared/i18n'
import { grouped, usePermissions } from './api'

/**
 * Permissions as grouped checkboxes, none ticked by default (create-seller-role.md). Ticking "write" in a group also ticks "read",
 * since editing what you cannot see is never useful: the same nudge Shopify and Seller Center give in their staff permissions.
 */
export function PermissionPicker({ value, onChange, idPrefix }: { value: string[]; onChange: (next: string[]) => void; idPrefix: string }) {
  const permissions = usePermissions()
  if (!permissions.data) return <p className="text-body-sm text-muted-foreground">{t('Đang tải quyền…')}</p>
  const toggle = (code: string, on: boolean) => {
    const next = new Set(value)
    if (on) {
      next.add(code)
      if (code.endsWith(':write')) next.add(code.replace(':write', ':read'))
    } else {
      next.delete(code)
      if (code.endsWith(':read')) next.delete(code.replace(':read', ':write'))
    }
    onChange([...next])
  }
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="sr-only">{t('Quyền')}</legend>
      {grouped(permissions.data).map(([group, items]) => (
        <div key={group} className="flex flex-col gap-2">
          <p className="text-caption font-semibold uppercase tracking-wide text-muted-foreground">{t(group)}</p>
          {items.map((p) => {
            const id = `${idPrefix}-${p.code}`
            return (
              <label key={p.code} htmlFor={id} className="flex items-center gap-3 text-body-sm">
                <input
                  id={id}
                  type="checkbox"
                  className="size-4 accent-[var(--color-primary)]"
                  checked={value.includes(p.code ?? '')}
                  onChange={(e) => toggle(p.code ?? '', e.target.checked)}
                />
                <span>{t(p.label ?? '')}</span>
              </label>
            )
          })}
        </div>
      ))}
      <p className="text-caption text-muted-foreground">
        {value.length ? t('Đã chọn {n} quyền.').replace('{n}', String(value.length)) : t('Chưa chọn quyền nào: thành viên sẽ không làm được gì.')}
      </p>
    </fieldset>
  )
}

/** A short, readable list of what a set of permissions allows. */
export function PermissionSummary({ codes }: { codes: string[] }) {
  const permissions = usePermissions()
  if (!codes.length) return <span className="text-muted-foreground">{t('Không có quyền')}</span>
  const labels = codes.map((c) => permissions.data?.find((p) => p.code === c)?.label ?? c)
  return <span>{labels.map((l) => t(l)).join(', ')}</span>
}
