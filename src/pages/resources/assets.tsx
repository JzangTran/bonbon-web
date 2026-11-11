import { CheckIcon, CopyIcon, DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { t } from '@/shared/i18n'
import { TagList } from '@/widgets/article/parts'
import type { SwatchColor } from './colors'

type Asset = { file: string; name: string; tags: string[]; ground: 'light' | 'dark' | 'brand'; note: string }

const LOGOS: Asset[] = [
  { file: 'bonbon-lockup-color.svg', name: t('Logo ngang, bản màu'), tags: ['Logo', 'SVG', t('Nền sáng')], ground: 'light', note: t('Dùng trên nền trắng hoặc nền sáng.') },
  { file: 'bonbon-lockup-white.svg', name: t('Logo ngang, bản trắng'), tags: ['Logo', 'SVG', t('Nền tối')], ground: 'dark', note: t('Dùng trên nền đen mực hoặc xanh đậm.') },
  { file: 'bonbon-logo-color.svg', name: t('Logo đứng, bản màu'), tags: ['Logo', 'SVG', t('Nền sáng')], ground: 'light', note: t('Khi cần logo vuông hơn, ví dụ ảnh đại diện.') },
  { file: 'bonbon-logo-white.svg', name: t('Logo đứng, bản trắng'), tags: ['Logo', 'SVG', t('Nền tối')], ground: 'dark', note: t('Bản trắng của logo đứng.') },
  { file: 'bonbon-mark-color.svg', name: t('Biểu tượng, bản màu'), tags: [t('Biểu tượng'), 'SVG'], ground: 'light', note: t('Chỉ khuôn mặt, không có chữ: dùng ở chỗ rất nhỏ.') },
  { file: 'bonbon-mark-white.svg', name: t('Biểu tượng, bản trắng'), tags: [t('Biểu tượng'), 'SVG'], ground: 'dark', note: t('Bản trắng của biểu tượng.') },
  { file: 'bonbon-mark-bg.svg', name: t('Biểu tượng trên nền vuông'), tags: [t('Biểu tượng'), 'SVG', t('Có nền')], ground: 'brand', note: t('Dùng làm biểu tượng ứng dụng; nền vuông chưa bo góc.') },
]

const groundClass: Record<Asset['ground'], string> = { light: 'bg-card', dark: 'bg-ink', brand: 'bg-grey-50' }

/** Every logo file as a card with its download button. */
export function LogoGrid() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {LOGOS.map((asset) => {
        const href = `/brand/${asset.file}`
        return (
          <li key={asset.file} className="flex min-w-0 flex-col gap-3 rounded-xl bg-card p-2.5">
            <div className={cn('flex aspect-[16/10] items-center justify-center rounded-lg p-8 ring-1 ring-border', groundClass[asset.ground])}>
              <img src={href} alt={asset.name} className="max-h-full max-w-full object-contain" />
            </div>
            <TagList tags={asset.tags} oneLine />
            <h3 className="px-0.5 text-[1.0625rem] leading-6 font-semibold">{asset.name}</h3>
            <p className="px-0.5 text-sm leading-6 text-muted-foreground">{asset.note}</p>
            <a
              href={href}
              download
              className="mt-auto flex h-10 items-center justify-center gap-2 rounded-full bg-button px-4 text-ui font-medium text-button-foreground outline-none hover:bg-button-hover focus-visible:ring-2 focus-visible:ring-ring"
            >
              <DownloadIcon className="size-4" aria-hidden="true" />
              {t('Tải xuống SVG')}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** A colour to copy: the sample, its name, code and token, and what it is for. */
export function SwatchGrid({ colors }: { colors: SwatchColor[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {colors.map((c) => (
        <Swatch key={c.token + c.hex} color={c} />
      ))}
    </ul>
  )
}

function Swatch({ color }: { color: SwatchColor }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // The code stays on screen to copy by hand.
    }
  }
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-xl bg-card p-2.5">
      <div className="h-24 rounded-lg ring-1 ring-border" style={{ backgroundColor: color.hex }} aria-hidden="true" />
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-6 font-semibold">{color.name}</h3>
          <p className="text-sm tabular-nums text-muted-foreground">
            {color.hex} · <code className="font-mono text-[0.8125rem]">{color.token}</code>
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={t('Sao chép mã màu {v0}', { v0: color.hex })}
          className="flex size-10 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <CheckIcon className="size-5 text-primary" /> : <CopyIcon className="size-5" />}
        </button>
      </div>
      <p className="px-0.5 pb-1 text-sm leading-6 text-muted-foreground">{color.use}</p>
      <span aria-live="polite" className="sr-only">
        {copied ? t('Đã sao chép {v0}', { v0: color.hex }) : ''}
      </span>
    </li>
  )
}
