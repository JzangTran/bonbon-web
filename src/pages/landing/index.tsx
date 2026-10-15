import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  BikeIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CompassIcon,
  CookingPotIcon,
  MapPinIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TruckIcon,
  WalletIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import { useSession } from '@/entities/session'
import { cn } from '@/shared/lib/utils'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

const btn = 'inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-base font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:min-h-[52px] sm:px-[26px]'
const btnGreen = cn(btn, 'bg-primary text-primary-foreground hover:bg-primary-hover')
const btnPale = cn(btn, 'bg-pill-pale text-ink hover:bg-[#e3e8e5]')

/** Public landing page at "/": brings customers to the app and local shops to seller sign-up (look: Landing v3 on the design canvas). */
export function LandingPage() {
  return (
    <div className="bg-background text-ink">
      <title>bonbon — Đặt món từ quán ăn ngay trong khu của bạn</title>
      <meta
        name="description"
        content="Đặt cơm, bún, đồ uống từ các quán ngay trong chung cư và khu công nghiệp của bạn. Quán tự giao trong khu, phí giao thấp. Chủ quán trả hoa hồng thấp hơn các ứng dụng lớn."
      />
      <Header />
      <main>
        <Hero />
        <NearbyShops />
        <OrderSteps />
        <TrustRow />
        <SellerBand />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}

function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-4 sm:px-6', className)}>{children}</div>
}

/** A headline in two tones: the first part in ink, the rest in the soft gray (text of 24px and up only). */
function Soft({ children }: { children: ReactNode }) {
  return <span className="text-headline-soft">{children}</span>
}

/** Empty, fixed-size image slot: real photos are added later (no layout shift meanwhile). */
function ImageSlot({ label, className }: { label: string; className?: string }) {
  return <div role="img" aria-label={label} className={cn('bg-image-slot', className)} />
}

/** The black round badge that carries an icon next to a short point. */
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white [&_svg]:size-[22px]" aria-hidden="true">
      {children}
    </span>
  )
}

const SECTIONS = ['dat-mon', 'quan', 'mo-quan', 'hoi-dap'] as const

/** The section nearest the top of the screen, to mark its link in the bar. */
function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0])
  useEffect(() => {
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id)
          else visible.delete(e.target.id)
        }
        const first = SECTIONS.find((id) => visible.has(id))
        if (first) setActive(first)
      },
      { rootMargin: '-20% 0px -60% 0px' },
    )
    for (const id of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])
  return active
}

function Header() {
  const { session } = useSession()
  const active = useActiveSection()
  const area =
    session?.role === 'SELLER' ? { to: '/seller', label: 'Vào trang người bán' }
    : session?.role === 'ADMIN' ? { to: '/admin', label: 'Vào trang quản trị' }
    : null
  const links = [
    ['dat-mon', 'Đặt món'],
    ['quan', 'Quán trong khu'],
    ['mo-quan', 'Mở quán'],
    ['hoi-dap', 'Hỏi đáp'],
  ] as const

  return (
    <header className="pt-4 sm:pt-6">
      <Wrap>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[28px] bg-ink py-2.5 pr-2.5 pl-5 shadow-[0_8px_24px_rgb(20_32_26/0.18)] sm:rounded-full sm:pl-[30px]">
          <Link to="/" className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-white">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
              <circle cx="13" cy="13" r="12" fill="#00a44a" />
              <path d="M8 14c0-4 2-6 5-6M18 12c0 4-2 6-5 6" stroke="#14201a" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            bonbon
          </Link>
          <nav aria-label="Trang chủ" className="order-3 flex w-full flex-wrap gap-1 sm:order-none sm:w-auto">
            {links.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? 'location' : undefined}
                className={cn(
                  'rounded-full px-4 py-2.5 text-[15px] font-medium text-white outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:px-[18px]',
                  active === id && 'bg-white font-semibold text-ink hover:bg-white',
                )}
              >
                {label}
              </a>
            ))}
          </nav>
          {area ? (
            <Link to={area.to} className={cn(btnGreen, 'min-h-12 px-[22px]')}>
              {area.label}
            </Link>
          ) : (
            <a href="#tai-app" className={cn(btnGreen, 'min-h-12 px-[22px]')}>
              <SmartphoneIcon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
              Tải app
            </a>
          )}
        </div>
      </Wrap>
    </header>
  )
}

function Hero() {
  return (
    <section id="dat-mon" className="relative scroll-mt-4 overflow-hidden">
      <Wrap className="flex flex-wrap items-center gap-6 py-12 lg:min-h-[640px] lg:py-[88px]">
        <div className="relative z-10 flex min-w-0 flex-[1_1_30rem] flex-col gap-7">
          <h1 className="text-[40px] leading-[46px] font-extrabold tracking-[-0.03em] sm:text-[56px] sm:leading-[62px] lg:text-[68px] lg:leading-[74px]">
            Đặt món
            <br />
            <Soft>từ quán ngay dưới sảnh</Soft>
            <svg width="44" height="40" viewBox="0 0 44 40" fill="none" aria-hidden="true" className="ml-1 inline-block align-top">
              <path d="M6 30 16 20M20 34l8-14M32 30l9-8" stroke="#00a44a" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <br />
            giao tận cửa
          </h1>
          <p className="max-w-[30rem] text-lg leading-[30px] text-muted-foreground">
            Các quán ăn trong chung cư và khu công nghiệp của bạn, trong một ứng dụng. Quán tự mang món tới, phí giao thấp, theo dõi từng bước.
          </p>
          <div id="tai-app" className="flex scroll-mt-6 flex-col gap-3">
            <div className="flex flex-wrap gap-3">
              <span aria-disabled="true" className={cn(btnGreen, 'cursor-default opacity-90 hover:bg-primary')}>
                <SmartphoneIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                Tải app đặt món
              </span>
              <a href="#quan" className={btnPale}>
                <CompassIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                Xem quán trong khu
              </a>
            </div>
            <p className="text-sm text-muted-foreground">Ứng dụng sắp có trên App Store và Google Play.</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <Badge>
                <TruckIcon strokeWidth={1.75} />
              </Badge>
              <span className="flex flex-col">
                <b className="text-[15px]">Quán tự giao</b>
                <span className="text-[13px] text-muted-foreground">Trong cùng toà, vài phút là tới</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge>
                <MapPinIcon strokeWidth={1.75} />
              </Badge>
              <span className="flex flex-col">
                <b className="text-[15px]">Theo dõi từng bước</b>
                <span className="text-[13px] text-muted-foreground">Cập nhật ngay khi quán làm</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative hidden h-[620px] min-w-0 flex-[1_1_28rem] md:block">
          <ImageSlot label="Ảnh món ăn (bổ sung sau)" className="absolute top-5 -right-[220px] size-[620px] rounded-full" />
          <PhoneMock />
        </div>
      </Wrap>
    </section>
  )
}

/** A drawn stand-in for a screenshot of the customer app's home screen (the slot stays empty until real screenshots exist). */
function PhoneMock() {
  return (
    <div
      role="img"
      aria-label="Minh hoạ màn hình trang chủ của ứng dụng bonbon"
      className="absolute top-0 left-10 h-[600px] w-[300px] overflow-hidden rounded-device border-8 border-ink bg-background shadow-[0_24px_48px_rgb(20_32_26/0.22)]"
    >
      <div aria-hidden="true" className="flex flex-col gap-3 px-4 pt-[18px]">
        <div className="flex items-center justify-between">
          <span className="flex flex-col">
            <small className="text-[10px] text-muted-foreground">Giao tới</small>
            <b className="text-xs">Toà S2 · căn 1508 ▾</b>
          </span>
          <span className="flex gap-1.5">
            <span className="size-7 rounded-full bg-white" />
            <span className="size-7 rounded-full bg-white" />
          </span>
        </div>
        <div className="text-xl leading-6 font-extrabold tracking-[-0.02em]">
          Hôm nay bạn <Soft>muốn ăn gì?</Soft>
        </div>
        <div className="flex gap-1.5">
          <span className="h-8 flex-1 rounded-full bg-white" />
          <span className="size-8 rounded-full bg-ink" />
        </div>
        <div className="flex gap-1.5 text-[11px] font-semibold">
          <span className="rounded-full bg-primary px-2.5 py-1.5 text-primary-foreground">Tất cả</span>
          <span className="rounded-full bg-white px-2.5 py-1.5">Cơm</span>
          <span className="rounded-full bg-white px-2.5 py-1.5">Bún &amp; phở</span>
        </div>
        <div className="flex flex-col gap-2 rounded-media bg-white p-2">
          <div className="relative h-[110px] rounded-xl bg-image-slot">
            <span className="absolute top-2 left-2 rounded-full bg-ink px-2 py-1 text-[10px] font-semibold text-white">12 phút</span>
            <span className="absolute top-2 right-2 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-brand-700">Miễn phí giao</span>
          </div>
          <div className="px-1 pb-0.5">
            <b className="text-[13px]">Cơm tấm Cô Ba</b>
            <div className="text-[11px] text-muted-foreground tabular-nums">120 m · Sảnh toà S1</div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute right-4 bottom-3.5 left-4 flex h-12 items-center justify-around rounded-full bg-ink">
        <span className="size-[34px] rounded-full bg-primary" />
        <span className="size-[34px] rounded-full bg-white/15" />
        <span className="size-[34px] rounded-full bg-white/15" />
        <span className="size-[34px] rounded-full bg-white/15" />
      </div>
    </div>
  )
}

const SHOPS = [
  { name: 'Cơm tấm Cô Ba', minutes: 12, meta: '120 m · phí giao 5.000 ₫', free: true },
  { name: 'Bún chả Hà Thành', minutes: 20, meta: '350 m · phí giao 8.000 ₫' },
  { name: 'Bánh mì Nắng', minutes: 15, meta: '210 m · phí giao 3.000 ₫' },
  { name: 'Trà chanh Góc Sân', minutes: 10, meta: '90 m · phí giao 3.000 ₫' },
]

function NearbyShops() {
  return (
    <section id="quan" className="scroll-mt-4 bg-card py-12 lg:py-20">
      <Wrap className="flex flex-col gap-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-[620px] text-[32px] leading-10 font-extrabold tracking-[-0.02em] lg:text-[44px] lg:leading-[50px]">
            Quán ngay trong khu, <Soft>giao được tới địa chỉ của bạn</Soft>
          </h2>
          <span className="text-[13px] text-muted-foreground">Ví dụ minh hoạ</span>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {SHOPS.map((shop) => (
            <li key={shop.name} className="flex flex-col gap-2.5 rounded-card bg-background p-2.5">
              <div className="relative h-[170px]">
                <ImageSlot label={`Ảnh món của ${shop.name} (bổ sung sau)`} className="size-full rounded-media bg-[#e3e8e5]" />
                <span className="absolute top-2.5 left-2.5 rounded-full bg-ink px-2.5 py-1.5 text-xs font-semibold text-white">{shop.minutes} phút</span>
                {shop.free ? <span className="absolute top-2.5 right-2.5 rounded-full bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700">Miễn phí giao</span> : null}
              </div>
              <div className="px-1.5 pb-1.5">
                <b className="text-[17px]">{shop.name}</b>
                <div className="text-sm text-muted-foreground tabular-nums">{shop.meta}</div>
              </div>
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  )
}

const STEPS = [
  {
    icon: ClockIcon,
    chip: 'Chờ quán xác nhận',
    chipClass: 'bg-info-subtle text-info-fg',
    title: 'Chọn món và đặt',
    body: 'Thấy phí giao và tổng tiền trước khi đặt. Trả tiền mặt hoặc qua MoMo.',
  },
  {
    icon: CookingPotIcon,
    chip: 'Đang chuẩn bị',
    chipClass: 'bg-warning-subtle text-warning-fg',
    title: 'Quán nhận đơn và nấu',
    body: 'Quán xác nhận trên điện thoại; bạn được báo khi món bắt đầu nấu.',
  },
  {
    icon: BikeIcon,
    chip: 'Đang giao',
    chipClass: 'bg-success-subtle text-success-fg',
    title: 'Quán tự mang tới',
    body: 'Không qua tài xế trung gian: cùng toà, cùng khu, món còn nóng.',
  },
  {
    icon: CheckIcon,
    chip: 'Đã giao',
    chipClass: 'bg-success-subtle text-success-fg',
    title: 'Nhận món, đánh giá quán',
    body: 'Có vấn đề với đơn? Báo ngay trong app, bonbon cùng quán giải quyết.',
  },
]

function OrderSteps() {
  return (
    <Wrap className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8 py-12 lg:py-20">
      <h2 className="col-span-full max-w-[640px] text-[32px] leading-10 font-extrabold tracking-[-0.02em] lg:text-[44px] lg:leading-[50px]">
        Một đơn hàng, <Soft>bốn bước rõ ràng</Soft>
      </h2>
      {STEPS.map(({ icon: Icon, chip, chipClass, title, body }) => (
        <div key={title} className="flex flex-col gap-3.5">
          <Badge>
            <Icon strokeWidth={1.75} />
          </Badge>
          <span className={cn('self-start rounded-full px-2.5 py-1.5 text-[13px] font-semibold', chipClass)}>{chip}</span>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="leading-6 text-muted-foreground">{body}</p>
        </div>
      ))}
    </Wrap>
  )
}

const TRUST = [
  { icon: ShieldCheckIcon, title: 'Quán đã xác minh', body: 'Mỗi quán gửi giấy tờ và được bonbon duyệt trước khi bán.' },
  { icon: WalletIcon, title: 'Tiền mặt hoặc MoMo', body: 'Trả khi nhận món, hoặc thanh toán trước qua ví MoMo.' },
  { icon: MessageCircleIcon, title: 'Có người lo khi đơn trục trặc', body: 'Báo vấn đề ngay trong app; bonbon theo dõi tới khi xong.' },
]

function TrustRow() {
  return (
    <section className="bg-card py-12 lg:py-16">
      <Wrap className="grid gap-8 sm:grid-cols-3">
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <Badge>
              <Icon strokeWidth={1.75} />
            </Badge>
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

const SELLER_STEPS = [
  { title: 'Gửi hồ sơ', body: 'Thông tin quán, giờ mở cửa, tài khoản nhận tiền. Lưu nháp, điền dần được.' },
  { title: 'Được duyệt', body: 'bonbon xem hồ sơ và báo kết quả qua email.' },
  { title: 'Nhận đơn', body: 'Thêm thực đơn, bật nhận đơn và bắt đầu bán cho hàng xóm.' },
]

function SellerBand() {
  return (
    <section id="mo-quan" className="scroll-mt-4 bg-brand-900 py-16 text-white lg:py-24">
      <Wrap className="flex flex-wrap items-center gap-14">
        <div className="flex min-w-0 flex-[1_1_30rem] flex-col gap-6">
          <h2 className="text-[34px] leading-[40px] font-extrabold tracking-[-0.03em] lg:text-[52px] lg:leading-[58px]">
            Bán cho hàng xóm, <span className="text-[#8fb5a0]">giữ lại nhiều hơn từ mỗi đơn</span>
          </h2>
          <p className="text-lg leading-[30px] text-brand-100">
            Hoa hồng thấp hơn các ứng dụng giao đồ ăn lớn. Bạn tự đặt bán kính giao, phí giao và giờ mở cửa; tự giao trong khu, không phụ thuộc tài xế.
          </p>
          <ol className="grid gap-4 border-t border-white/15 pt-6 sm:grid-cols-3">
            {SELLER_STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-1">
                <span className="text-sm text-brand-100">Bước {i + 1}</span>
                <b className="text-base">{step.title}</b>
                <span className="text-sm leading-6 text-brand-100">{step.body}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/seller/register" className={cn(btn, 'bg-white text-brand-900 hover:bg-brand-50')}>
              Mở quán trên bonbon
            </Link>
            <a href="#hoi-dap" className={cn(btn, 'bg-white/12 text-white hover:bg-white/20')}>
              Hồ sơ cần những gì?
            </a>
          </div>
          <Link to="/seller/login" className="self-start font-semibold text-white underline-offset-4 hover:underline">
            Đã có tài khoản? Đăng nhập
          </Link>
        </div>
        <div className="flex min-w-0 flex-[1_1_22rem] justify-center">
          <ImageSlot label="Ảnh chủ quán bán hàng trên bonbon (bổ sung sau)" className="aspect-[4/5] w-full max-w-[420px] rounded-[32px] bg-[#164a30]" />
        </div>
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
    <section id="hoi-dap" className="scroll-mt-4 py-12 lg:py-20">
      <Wrap className="flex flex-col gap-8">
        <h2 className="text-[32px] leading-10 font-extrabold tracking-[-0.02em] lg:text-[44px] lg:leading-[50px]">
          Câu hỏi <Soft>thường gặp</Soft>
        </h2>
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {FAQ.map((group) => (
            <div key={group.group} className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-primary">{group.group}</h3>
              {group.items.map((item) => (
                <details key={item.q} className="group rounded-card bg-card px-6 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-pill-pale" aria-hidden="true">
                      <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
                    </span>
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
    <footer className="bg-ink text-brand-100">
      <Wrap className="flex flex-wrap justify-between gap-6 py-10 text-sm">
        <div className="flex flex-col gap-2">
          <span className="text-[22px] font-extrabold tracking-tight text-white">bonbon</span>
          <span>Đặt món từ quán trong khu.</span>
          {SUPPORT_EMAIL ? (
            <span>
              Liên hệ:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </span>
          ) : null}
        </div>
        <nav aria-label="Pháp lý" className="flex flex-wrap items-start gap-x-6 gap-y-2">
          <Link to="/legal/CUSTOMER_TERMS" className="underline-offset-4 hover:text-white hover:underline">Điều khoản sử dụng</Link>
          <Link to="/legal/SELLER_TERMS" className="underline-offset-4 hover:text-white hover:underline">Điều khoản người bán</Link>
          <Link to="/legal/PRIVACY_POLICY" className="underline-offset-4 hover:text-white hover:underline">Chính sách quyền riêng tư</Link>
        </nav>
      </Wrap>
    </footer>
  )
}
