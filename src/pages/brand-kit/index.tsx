import { CheckIcon, CopyIcon, DownloadIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { WaveEdge } from '@/shared/ui/wave'
import { ContentPage } from '@/widgets/article/article-view'
import { Breadcrumb, TagList } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'

const PATH = '/bo-nhan-dien'
const TRAIL = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Thư viện bộ nhận diện', path: PATH },
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
  { name: 'Xanh chính', hex: '#007F3A', use: 'Nút, liên kết, trạng thái đang chọn.' },
  { name: 'Xanh đậm', hex: '#005C2E', use: 'Chữ trên nền xanh nhạt, vùng nhấn mạnh.' },
  { name: 'Xanh sáng', hex: '#00A44A', use: 'Hình lớn; chữ trên nền này phải là màu mực.' },
  { name: 'Xanh logo', hex: '#28A466', use: 'Màu của chính logo bonbon.' },
  { name: 'Xanh nhạt', hex: '#E8F5EE', use: 'Nền khối, thẻ được chọn.' },
  { name: 'Mực', hex: '#14201A', use: 'Chữ chính, thanh điều hướng.' },
  { name: 'Mực nhạt', hex: '#4B5A52', use: 'Chữ phụ, mô tả.' },
  { name: 'Vàng', hex: '#FFB020', use: 'Sao đánh giá, điểm nhấn nhỏ (chữ trên nền này là màu mực).' },
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

const groundClass: Record<Asset['ground'], string> = { light: 'bg-card', dark: 'bg-ink', brand: 'bg-brand-50' }

function LogoCard({ asset }: { asset: Asset }) {
  const href = `/brand/${asset.file}`
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-lg bg-card p-2.5">
      <div className={cn('flex aspect-[16/10] items-center justify-center rounded-lg p-8 ring-1 ring-border', groundClass[asset.ground])}>
        <img src={href} alt={asset.name} className="max-h-full max-w-full object-contain" />
      </div>
      <TagList tags={asset.tags} oneLine />
      <h3 className="px-0.5 text-[1.0625rem] leading-6 font-bold">{asset.name}</h3>
      <p className="px-0.5 text-sm leading-6 text-muted-foreground">{asset.note}</p>
      <a
        href={href}
        download
        className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[0.9375rem] font-semibold text-primary-foreground outline-none hover:bg-primary-hover focus-visible:ring-3 focus-visible:ring-ring/50"
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
    <li className="flex min-w-0 flex-col gap-3 rounded-lg bg-card p-2.5">
      <div className="h-24 rounded-lg ring-1 ring-border" style={{ backgroundColor: color.hex }} aria-hidden="true" />
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] leading-6 font-bold">{color.name}</h3>
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

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 id={id} className="text-[1.75rem] leading-9 font-bold tracking-[-0.01em]">
          {title}
        </h2>
        <p className="leading-7 text-muted-foreground">{intro}</p>
      </div>
      {children}
    </section>
  )
}

/** Logos to download, colours, type and the rules for using them. */
export function BrandKitPage() {
  return (
    <ContentPage>
      <PageSeo
        title="Thư viện bộ nhận diện"
        description="Logo, biểu tượng, màu sắc và font chữ của bonbon, kèm quy tắc sử dụng, để đối tác và báo chí dùng đúng."
        path={PATH}
        trail={TRAIL}
      />
      <main id="main">
        <section className="bg-brand-50">
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-4 pt-8 pb-14 sm:px-6 lg:pt-12 lg:pb-20">
            <Breadcrumb trail={TRAIL} />
            <h1 className="max-w-3xl text-[2rem] leading-[2.5rem] font-extrabold tracking-[-0.02em] sm:text-[2.75rem] sm:leading-[3.25rem]">Thư viện bộ nhận diện</h1>
            <p className="max-w-2xl text-[1.0625rem] leading-7 text-muted-foreground">
              Logo, màu sắc và font chữ của bonbon. Tải về và dùng theo quy tắc bên dưới để mọi nơi nhìn bonbon đều giống nhau.
            </p>
          </div>
        </section>
        <div className="relative bg-background pt-10 pb-16 lg:pt-14 lg:pb-24">
          <WaveEdge className="text-background" />
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-4 sm:px-6">
            <Section id="logo" title="Logo và biểu tượng" intro="Tất cả là SVG, phóng to không vỡ. Chọn bản màu cho nền sáng và bản trắng cho nền tối.">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {LOGOS.map((asset) => (
                  <LogoCard key={asset.file} asset={asset} />
                ))}
              </ul>
            </Section>

            <Section id="mau-sac" title="Màu sắc" intro="Bấm biểu tượng sao chép để lấy mã màu. Các màu chữ và nền đã được kiểm tra độ tương phản.">
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {COLORS.map((c) => (
                  <Swatch key={c.hex} color={c} />
                ))}
              </ul>
            </Section>

            <Section id="chu" title="Font chữ" intro="bonbon dùng Be Vietnam Pro, hỗ trợ đầy đủ tiếng Việt. Font miễn phí, có trên Google Fonts.">
              <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:p-8">
                <div className="flex flex-col gap-2">
                  <p className="text-[4rem] leading-none font-extrabold tracking-[-0.03em]">Aa</p>
                  <p className="text-xl font-semibold">Be Vietnam Pro</p>
                  <a
                    href="https://fonts.google.com/specimen/Be+Vietnam+Pro"
                    target="_blank"
                    rel="noreferrer"
                    className="w-fit text-primary underline underline-offset-4"
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
            </Section>

            <Section id="quy-tac" title="Quy tắc sử dụng logo" intro="Vài nguyên tắc đơn giản để logo luôn rõ ràng.">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-lg bg-brand-50 p-6">
                  <h3 className="text-[1.125rem] font-bold text-brand-900">Nên</h3>
                  <ul className="flex list-disc flex-col gap-2 pl-5 leading-7 marker:text-primary">
                    {RULES_DO.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3 rounded-lg bg-danger-subtle p-6">
                  <h3 className="text-[1.125rem] font-bold text-danger-fg">Không nên</h3>
                  <ul className="flex list-disc flex-col gap-2 pl-5 leading-7 marker:text-danger-fg">
                    {RULES_DONT.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </main>
    </ContentPage>
  )
}
