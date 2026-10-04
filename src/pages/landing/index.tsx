import type { ReactNode } from 'react'
import {
  CheckIcon,
  ChevronDownIcon,
  MapPinIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  WalletIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import { useSession } from '@/entities/session'
import { OrderStatusBadge } from '@/entities/order'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

/** Public landing page at "/": brings customers to the app and local shops to seller sign-up. */
export function LandingPage() {
  return (
    <div className="bg-card text-foreground">
      <title>bonbon — Đặt món từ quán ăn ngay trong khu của bạn</title>
      <meta
        name="description"
        content="Đặt cơm, bún, đồ uống từ các quán ngay trong chung cư và khu công nghiệp của bạn. Quán tự giao trong khu, phí giao thấp. Chủ quán trả hoa hồng thấp hơn các ứng dụng lớn."
      />
      <Header />
      <main>
        <Hero />
        <CustomerSteps />
        <SellerBand />
        <TrustRow />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}

function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>
}

/** Empty, fixed-size image slot: real photos/screenshots are added later (no layout shift meanwhile). */
function ImageSlot({ label, className }: { label: string; className?: string }) {
  return <div role="img" aria-label={label} className={cn('bg-image-slot', className)} />
}

function Header() {
  const { session } = useSession()
  const area =
    session?.role === 'SELLER' ? { to: '/seller', label: 'Vào trang người bán' }
    : session?.role === 'ADMIN' ? { to: '/admin', label: 'Vào trang quản trị' }
    : null

  return (
    <header className="border-b">
      <Wrap className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-primary">
          bonbon
        </Link>
        <nav aria-label="Trang chủ" className="order-3 flex w-full gap-6 text-sm font-medium sm:order-none sm:w-auto">
          <a href="#dat-mon" className="hover:text-primary">Đặt món</a>
          <a href="#mo-quan" className="hover:text-primary">Mở quán</a>
          <a href="#hoi-dap" className="hover:text-primary">Hỏi đáp</a>
        </nav>
        <div className="flex gap-2">
          {area ? (
            <Button asChild>
              <Link to={area.to}>{area.label}</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link to="/seller/login">Đăng nhập người bán</Link>
              </Button>
              <Button asChild>
                <a href="#tai-app">Tải app</a>
              </Button>
            </>
          )}
        </div>
      </Wrap>
    </header>
  )
}

function StoreBadge({ store }: { store: string }) {
  return (
    <span
      aria-disabled="true"
      className="inline-flex min-h-13 items-center gap-3 rounded-full bg-foreground px-5 text-background"
    >
      <SmartphoneIcon className="size-5" aria-hidden="true" />
      <span className="flex flex-col leading-tight">
        <small className="text-[11px] opacity-85">Sắp có trên</small>
        <b className="text-base font-semibold">{store}</b>
      </span>
    </span>
  )
}

function Hero() {
  return (
    <section>
      <Wrap className="flex flex-wrap items-center gap-12 py-14 lg:py-20">
        <div className="flex min-w-0 flex-[1_1_28rem] flex-col gap-6">
          <span className="inline-flex items-center gap-1.5 self-start rounded-sm bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground">
            <MapPinIcon className="size-4" aria-hidden="true" />
            Cho chung cư và khu công nghiệp
          </span>
          <h1 className="text-[34px] leading-10 font-extrabold tracking-tight lg:text-5xl lg:leading-[56px]">
            Cơm trưa từ quán dưới sảnh, giao tận cửa căn hộ.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted-foreground">
            bonbon gom các quán ăn ngay trong chung cư và khu công nghiệp của bạn vào một ứng dụng. Quán tự giao trong
            khu, món tới khi còn nóng, phí giao thấp.
          </p>
          <div id="tai-app" className="flex scroll-mt-6 flex-wrap gap-3">
            <StoreBadge store="App Store" />
            <StoreBadge store="Google Play" />
          </div>
          <a href="#mo-quan" className="self-start font-semibold text-primary hover:underline">
            Bạn có quán ăn trong khu? Mở quán trên bonbon →
          </a>
        </div>
        <div className="flex min-w-0 flex-[1_1_22rem] justify-center">
          <div className="flex w-full max-w-md justify-center bg-accent px-8 py-10">
            <ImageSlot
              label="Ảnh chụp màn hình ứng dụng bonbon"
              className="aspect-[1/2] w-full max-w-[17rem] rounded-[2rem] border-8 border-foreground bg-card"
            />
          </div>
        </div>
      </Wrap>
    </section>
  )
}

const CUSTOMER_STEPS = [
  {
    status: 'PLACED',
    title: 'Chọn quán và đặt món',
    body: 'Chỉ hiện những quán giao được tới địa chỉ của bạn, kèm khoảng cách và phí giao. Trả tiền mặt khi nhận hoặc qua MoMo.',
  },
  {
    status: 'PREPARING',
    title: 'Quán nhận đơn và nấu',
    body: 'Quán xác nhận ngay trên điện thoại; bạn được báo khi món bắt đầu nấu.',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    title: 'Quán tự mang tới cửa',
    body: 'Không qua tài xế trung gian: trong cùng toà, cùng khu, vài phút là tới.',
  },
] as const

function CustomerSteps() {
  return (
    <section id="dat-mon" className="scroll-mt-4 bg-background py-16 lg:py-20">
      <Wrap className="flex flex-col gap-10">
        <div className="max-w-2xl">
          <h2 className="mb-3 text-[28px] leading-9 font-bold tracking-tight lg:text-[34px] lg:leading-[42px]">
            Một đơn hàng trên bonbon
          </h2>
          <p className="text-[17px] leading-7 text-muted-foreground">
            Mỗi quán tự đặt bán kính giao quanh quán. Bạn đặt, quán nấu và tự mang tới; trạng thái đơn cập nhật theo
            đúng những gì quán làm.
          </p>
        </div>
        <ol className="grid gap-8 sm:grid-cols-3">
          {CUSTOMER_STEPS.map((step) => (
            <li key={step.status} className="flex flex-col gap-3 border-t-[3px] border-primary pt-4">
              <OrderStatusBadge status={step.status} className="self-start" />
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="leading-6 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  )
}

const SELLER_POINTS = [
  'Hoa hồng thấp hơn các ứng dụng giao đồ ăn lớn.',
  'Đơn mới báo ngay trên điện thoại, nhận đơn bằng một chạm.',
  'Tự đặt bán kính giao, phí giao, giờ mở cửa; tạm ngưng nhận đơn bất cứ lúc nào.',
  'Đối soát rõ ràng từng đơn, xem doanh thu theo ngày trên web.',
]

const SELLER_STEPS = [
  { title: 'Gửi hồ sơ', body: 'Thông tin quán, giờ mở cửa, tài khoản nhận tiền. Lưu nháp, điền dần được.' },
  { title: 'Được duyệt', body: 'bonbon xem hồ sơ và báo kết quả qua email.' },
  { title: 'Nhận đơn', body: 'Thêm thực đơn, bật nhận đơn và bắt đầu bán cho hàng xóm.' },
]

function SellerBand() {
  return (
    <section id="mo-quan" className="scroll-mt-4 bg-brand-900 py-16 text-white lg:py-24">
      <Wrap className="flex flex-wrap items-center gap-12">
        <div className="flex min-w-0 flex-[1_1_28rem] flex-col gap-6">
          <h2 className="text-[30px] leading-9 font-extrabold tracking-tight lg:text-[40px] lg:leading-[48px]">
            Bán cho hàng xóm, giữ lại nhiều hơn từ mỗi đơn.
          </h2>
          <p className="text-lg leading-8 text-brand-100">
            bonbon dành cho quán cơm, quán bún, tiệm bánh, quầy nước trong chung cư và khu công nghiệp. Bạn tự giao
            trong khu, không phụ thuộc tài xế.
          </p>
          <ul className="flex flex-col gap-3 text-[17px] leading-7">
            {SELLER_POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckIcon className="mt-1 size-5 shrink-0 text-[#3cc77a]" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <ol className="grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
            {SELLER_STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-1">
                <span className="text-sm text-brand-100">Bước {i + 1}</span>
                <b className="text-base">{step.title}</b>
                <span className="text-sm leading-6 text-brand-100">{step.body}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="bg-white text-brand-900 hover:bg-brand-50">
              <Link to="/seller/register">Mở quán trên bonbon</Link>
            </Button>
            <Link to="/seller/login" className="font-semibold text-white underline-offset-4 hover:underline">
              Đã có tài khoản? Đăng nhập
            </Link>
          </div>
        </div>
        <div className="flex min-w-0 flex-[1_1_20rem] justify-center">
          <ImageSlot label="Ảnh chủ quán bán hàng trên bonbon" className="aspect-[4/5] w-full max-w-md bg-[#164a30]" />
        </div>
      </Wrap>
    </section>
  )
}

const TRUST = [
  { icon: ShieldCheckIcon, title: 'Quán đã xác minh', body: 'Mỗi quán gửi giấy tờ và được bonbon duyệt trước khi bán.' },
  { icon: WalletIcon, title: 'Tiền mặt hoặc MoMo', body: 'Trả khi nhận món, hoặc thanh toán trước qua ví MoMo.' },
  { icon: MessageCircleIcon, title: 'Có người lo khi đơn trục trặc', body: 'Báo vấn đề ngay trong app; bonbon theo dõi tới khi xong.' },
]

function TrustRow() {
  return (
    <section>
      <Wrap className="grid gap-8 py-14 sm:grid-cols-3">
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 size-6 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
            <div>
              <h3 className="mb-1 text-[17px] font-bold">{title}</h3>
              <p className="leading-6 text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </Wrap>
    </section>
  )
}

const FAQ: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: 'Cho người đặt món',
    items: [
      { q: 'bonbon giao tới đâu?', a: 'Mỗi quán tự đặt bán kính giao quanh quán. App chỉ hiện những quán giao được tới địa chỉ bạn đã lưu.' },
      { q: 'Phí giao bao nhiêu?', a: 'Do từng quán đặt và hiện rõ trước khi đặt; nhiều quán miễn phí giao khi đơn đủ một mức nhất định.' },
      { q: 'Đơn bị sai hoặc không tới thì sao?', a: 'Báo vấn đề trong mục Đơn hàng. Đơn trả trước qua MoMo được hoàn tiền khi lỗi thuộc về quán.' },
    ],
  },
  {
    group: 'Cho chủ quán',
    items: [
      { q: 'Mở quán cần những gì?', a: 'Thông tin quán và địa chỉ, giờ mở cửa, thông tin thuế, tài khoản nhận tiền và giấy tờ tuỳ thân của chủ quán. Hồ sơ lưu nháp, điền dần được.' },
      { q: 'Bao lâu thì được duyệt?', a: 'Quản trị viên xem hồ sơ theo thứ tự gửi; bạn nhận email khi có kết quả, kèm lý do nếu cần bổ sung.' },
      { q: 'Tôi có phải thuê người giao không?', a: 'Không bắt buộc. Quán tự giao trong khu, thường chỉ vài tầng hoặc vài toà; bạn đặt bán kính phù hợp với mình.' },
    ],
  },
]

function Faq() {
  return (
    <section id="hoi-dap" className="scroll-mt-4 bg-background py-16 lg:py-20">
      <Wrap className="flex flex-col gap-8">
        <h2 className="text-[28px] leading-9 font-bold tracking-tight lg:text-[34px] lg:leading-[42px]">Hỏi đáp</h2>
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {FAQ.map((group) => (
            <div key={group.group}>
              <h3 className="mb-2 text-sm font-bold text-primary">{group.group}</h3>
              {group.items.map((item) => (
                <details key={item.q} className="group border-b py-4">
                  <summary className="flex cursor-pointer list-none justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <ChevronDownIcon className="mt-1 size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 leading-7 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t">
      <Wrap className="flex flex-wrap justify-between gap-6 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-extrabold tracking-tight text-primary">bonbon</span>
          <span>Đặt món từ quán trong khu.</span>
          {SUPPORT_EMAIL ? (
            <span>
              Liên hệ:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </span>
          ) : null}
        </div>
        <nav aria-label="Pháp lý" className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <Link to="/legal/CUSTOMER_TERMS" className="hover:text-foreground hover:underline">Điều khoản sử dụng</Link>
          <Link to="/legal/SELLER_TERMS" className="hover:text-foreground hover:underline">Điều khoản người bán</Link>
          <Link to="/legal/PRIVACY_POLICY" className="hover:text-foreground hover:underline">Chính sách quyền riêng tư</Link>
        </nav>
      </Wrap>
    </footer>
  )
}
