import { CheckIcon, CopyIcon, DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { DocsRail } from '@/shared/ui/docs-frame'
import { Toc } from '@/widgets/article/article-view'
import { BRAND_PATH, BrandFrame, BrandSection } from './frame'
import { Breadcrumb, TagList } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'

const PATH = BRAND_PATH
const SECTIONS = [
  { id: 'logo', text: 'Logo và biểu tượng' },
  { id: 'mau-sac', text: 'Màu sắc' },
  { id: 'chu', text: 'Font chữ' },
  { id: 'quy-tac', text: 'Quy tắc sử dụng logo' },
]
const HEADINGS = SECTIONS.map((x) => ({ ...x, level: 2 as const }))
const GROUPS = [{ title: 'Nhận diện', items: SECTIONS.map((x) => ({ label: x.text, to: `${PATH}#${x.id}` })) }]
const TRAIL = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Tài nguyên', path: PATH },
  { name: 'Thương hiệu', path: PATH },
]

type Asset = { file: string; name: string; tags: string[]; ground: 'light' | 'dark' | 'brand'; note: string }

const LOGOS: Asset[] = [
  { file: 'bonbon-lockup-color.svg', name: 'Logo ngang, bản màu', tags: ['Logo', 'SVG', 'Nền sáng'], ground: 'light', note: 'Dùng trên nền trắng hoặc nền sáng.' },
  { file: 'bonbon-lockup-white.svg', name: 'Logo ngang, bản trắng', tags: ['Logo', 'SVG', 'Nền tối'], ground: 'dark', note: 'Dùng trên nền đen mực hoặc xanh đậm.' },
  { file: 'bonbon-logo-color.svg', name: 'Logo đứng, bản màu', tags: ['Logo', 'SVG', 'Nền sáng'], ground: 'light', note: 'Khi cần logo vuông hơn, ví dụ ảnh đại diện.' },
  { file: 'bonbon-logo-white.svg', name: 'Logo đứng, bản trắng', tags: ['Logo', 'SVG', 'Nền tối'], ground: 'dark', note: 'Bản trắng của logo đứng.' },
  { file: 'bonbon-mark-color.svg', name: 'Biểu tượng, bản màu', tags: ['Biểu tượng', 'SVG'], ground: 'light', note: 'Chỉ khuôn mặt, không có chữ: dùng ở chỗ rất nhỏ.' },
  { file: 'bonbon-mark-white.svg', name: 'Biểu tượng, bản trắng', tags: ['Biểu tượng', 'SVG'], ground: 'dark', note: 'Bản trắng của biểu tượng.' },
  { file: 'bonbon-mark-bg.svg', name: 'Biểu tượng trên nền vuông', tags: ['Biểu tượng', 'SVG', 'Có nền'], ground: 'brand', note: 'Dùng làm biểu tượng ứng dụng; nền vuông chưa bo góc.' },
]

const COLORS = [
  { name: 'Cam bonbon', hex: '#FE551B', use: 'Màu thương hiệu: logo, mục đang chọn, gạch chân liên kết, hình minh hoạ, chuỗi số liệu đầu tiên.' },
  { name: 'Cam nhạt', hex: '#FFF4EE', use: 'Nền ghi chú và thẻ nhấn rất nhẹ.' },
  { name: 'Mực', hex: '#1D1D1D', use: 'Chữ nội dung và nút chính.' },
  { name: 'Xám chữ', hex: '#6E6E6E', use: 'Chữ điều hướng, mô tả, nhãn và mục chưa chọn.' },
  { name: 'Be', hex: '#FAFAF9', use: 'Nền khối số liệu, biểu đồ và chân trang.' },
  { name: 'Xám nền', hex: '#F5F5F5', use: 'Nền ô nhập, nút phụ và nền khi rê chuột.' },
  { name: 'Xám kẻ', hex: '#EDEDED', use: 'Đường kẻ mảnh, chỉ khi thật cần.' },
  { name: 'Xanh dương', hex: '#2A78D6', use: 'Chuỗi số liệu thứ hai trên biểu đồ.' },
  { name: 'Xanh ngọc', hex: '#1BAF7A', use: 'Chuỗi số liệu thứ ba trên biểu đồ.' },
]

const WEIGHTS = [
  { weight: 400, name: 'Thường' },
  { weight: 500, name: 'Vừa' },
  { weight: 600, name: 'Bán đậm' },
  { weight: 700, name: 'Đậm' },
  { weight: 800, name: 'Rất đậm' },
]

const RULES_DO = ['Giữ khoảng trống quanh logo bằng ít nhất chiều cao của chữ “b”.', 'Dùng bản màu trên nền sáng, bản trắng trên nền tối.', 'Giữ logo ngang không nhỏ hơn 96 px chiều rộng, biểu tượng không nhỏ hơn 24 px.']
const RULES_DONT = ['Không kéo giãn, xoay hoặc đổi tỷ lệ logo.', 'Không đổi màu logo sang màu khác ngoài hai bản màu và trắng.', 'Không thêm bóng đổ, viền hay hiệu ứng lên logo.', 'Không đặt logo lên nền ảnh rối khiến khó nhìn.']

const groundClass: Record<Asset['ground'], string> = { light: 'bg-card', dark: 'bg-ink', brand: 'bg-grey-50' }

function LogoCard({ asset }: { asset: Asset }) {
  const href = `/brand/${asset.file}`
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-xl bg-card p-2.5">
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
        Tải xuống SVG
      </a>
    </li>
  )
}

function Swatch({ color }: { color: (typeof COLORS)[number] }) {
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
          <p className="text-sm tabular-nums text-muted-foreground">{color.hex}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={`Sao chép mã màu ${color.hex}`}
          className="flex size-10 shrink-0 items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <CheckIcon className="size-5 text-primary" /> : <CopyIcon className="size-5" />}
        </button>
      </div>
      <p className="px-0.5 pb-1 text-sm leading-6 text-muted-foreground">{color.use}</p>
      <span aria-live="polite" className="sr-only">
        {copied ? `Đã sao chép ${color.hex}` : ''}
      </span>
    </li>
  )
}

/** Logos to download, colours, type and the rules for using them. */
export function BrandKitPage() {
  return (
    <BrandFrame tab="identity" sidebar={<DocsRail groups={GROUPS} label="Nhận diện" />} aside={<Toc headings={HEADINGS} />}>
      <PageSeo
        title="Thương hiệu"
        description="Logo, biểu tượng, màu sắc và font chữ của bonbon, kèm quy tắc sử dụng, để đối tác và báo chí dùng đúng."
        path={PATH}
        trail={TRAIL}
      />
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-3">
          <Breadcrumb trail={TRAIL} />
          <h1 className="text-h1 font-semibold">Nhận diện thương hiệu</h1>
          <p className="text-lead text-ink">Logo, màu sắc và font chữ của bonbon. Tải về và dùng theo quy tắc bên dưới để mọi nơi nhìn bonbon đều giống nhau.</p>
        </div>
            <BrandSection id="logo" title="Logo và biểu tượng" intro="Tất cả là SVG, phóng to không vỡ. Chọn bản màu cho nền sáng và bản trắng cho nền tối.">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {LOGOS.map((asset) => (
                  <LogoCard key={asset.file} asset={asset} />
                ))}
              </ul>
            </BrandSection>

            <BrandSection id="mau-sac" title="Màu sắc" intro="Bấm biểu tượng sao chép để lấy mã màu. Các màu chữ và nền đã được kiểm tra độ tương phản.">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {COLORS.map((c) => (
                  <Swatch key={c.hex} color={c} />
                ))}
              </ul>
            </BrandSection>

            <BrandSection id="chu" title="Font chữ" intro="bonbon dùng Inter, hỗ trợ đầy đủ tiếng Việt. Font miễn phí, có trên Google Fonts.">
              <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-8">
                <div className="flex flex-col gap-2">
                  <p className="text-[4rem] leading-none font-semibold tracking-[-0.03em]">Aa</p>
                  <p className="text-xl font-semibold">Inter</p>
                  <a
                    href="https://fonts.google.com/specimen/Inter"
                    target="_blank"
                    rel="noreferrer"
                    className="text-link w-fit"
                  >
                    Tải font trên Google Fonts
                  </a>
                </div>
                <ul className="flex flex-col gap-2">
                  {WEIGHTS.map((w) => (
                    <li key={w.weight} className="flex items-baseline justify-between gap-4 border-b pb-2 last:border-none">
                      <span className="text-xl" style={{ fontWeight: w.weight }}>
                        Đặt món ngay trong khu
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {w.name} {w.weight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </BrandSection>

            <BrandSection id="quy-tac" title="Quy tắc sử dụng logo" intro="Vài nguyên tắc đơn giản để logo luôn rõ ràng.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-lg bg-grey-50 p-6">
                  <h3 className="text-h3 text-ink">Nên</h3>
                  <ul className="flex list-disc flex-col gap-2 pl-5 leading-7 marker:text-primary">
                    {RULES_DO.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 rounded-lg bg-danger-subtle p-6">
                  <h3 className="text-[1.125rem] font-semibold text-danger-fg">Không nên</h3>
                  <ul className="flex list-disc flex-col gap-2 pl-5 leading-7 marker:text-danger-fg">
                    {RULES_DONT.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </BrandSection>
      </div>
    </BrandFrame>
  )
}
