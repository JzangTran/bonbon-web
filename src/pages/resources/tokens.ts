import tokensCss from '@/shared/ui/tokens.css?raw'
import { tx } from '@/shared/i18n'

// ---------------------------------------------------------------- read the tokens from the stylesheet itself, so this page cannot drift

function block(selector: string): Map<string, string> {
  const at = tokensCss.indexOf(`${selector} {`)
  const body = at < 0 ? '' : tokensCss.slice(at, tokensCss.indexOf('\n}', at))
  return new Map([...body.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]))
}
const LIGHT = block(':root')
const DARK = block('.dark')
const THEME = block('@theme inline')
const COLOR = /^(#|rgb|var\(--)/

function resolve(value: string | undefined, scheme: Map<string, string>, depth = 0): string | undefined {
  const ref = value?.match(/^var\(--([\w-]+)\)$/)
  if (!ref || depth > 5) return value
  return resolve(scheme.get(ref[1]) ?? LIGHT.get(ref[1]), scheme, depth + 1)
}

export type Row = { name: string; light: string; dark?: string; utility?: string }
export const ROWS: Row[] = [...LIGHT.entries()]
  .filter(([, v]) => COLOR.test(v))
  .map(([name, v]) => ({
    name,
    light: resolve(v, LIGHT)!,
    dark: DARK.has(name) ? resolve(DARK.get(name), DARK) : undefined,
    utility: THEME.has(`color-${name}`) ? name : undefined,
  }))

export const TOKEN_GROUPS: { id: string; title: string; test: (n: string) => boolean }[] = [
  { id: 'palette', title: tx('Bảng màu', 'Palette'), test: (n) => /^(orange|grey|amber|beige|ink$|image-slot)/.test(n) },
  { id: 'surface-and-text', title: tx('Bề mặt và chữ', 'Surface and text'), test: (n) => /^(background|foreground|card|popover|primary|button|secondary|muted|accent|destructive|border|input|ring|headline-soft|pill-pale)/.test(n) },
  { id: 'states', title: tx('Trạng thái', 'States'), test: (n) => /^(success|warning|info|danger|highlight)/.test(n) },
  { id: 'charts', title: tx('Biểu đồ', 'Charts'), test: (n) => n.startsWith('chart-') },
  { id: 'workspace', title: tx('Khu làm việc', 'Workspace'), test: (n) => n.startsWith('ws-') },
]
