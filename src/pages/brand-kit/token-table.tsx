import type { Row } from './tokens'

function Chip({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>
  return (
    <span className="flex items-center gap-2">
      <span className="size-5 shrink-0 rounded-xs ring-1 ring-grey-300" style={{ background: value }} aria-hidden="true" />
      <span className="font-mono text-small">{value}</span>
    </span>
  )
}

export function TokenTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-grey-200">
      <table className="w-full min-w-[40rem] text-left text-ui">
        <thead className="bg-beige-50">
          <tr>
            {['Token', 'Light', 'Dark', 'Tailwind'].map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-t border-grey-200">
              <td className="px-4 py-2.5 font-mono text-small">--{r.name}</td>
              <td className="px-4 py-2.5">
                <Chip value={r.light} />
              </td>
              <td className="px-4 py-2.5">
                <Chip value={r.dark} />
              </td>
              <td className="px-4 py-2.5 font-mono text-small text-muted-foreground">{r.utility ? `bg-${r.utility} · text-${r.utility}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
