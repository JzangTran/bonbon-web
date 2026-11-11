import { t } from '@/shared/i18n'
/** A native select of leaf categories ("Đồ uống › Cà phê"), which is plenty for a list this long and works with a keyboard and a screen reader. */
export function CategorySelect({
  id,
  options,
  value,
  onChange,
  loading,
}: {
  id: string
  options: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
  loading?: boolean
}) {
  return (
    <select
      id={id}
      value={value}
      disabled={loading}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full rounded-lg bg-grey-100 hover:bg-grey-200/70 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <option value="">{loading ? t('Đang tải…') : t('Chọn ngành')}</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
