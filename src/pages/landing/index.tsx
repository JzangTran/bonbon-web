import type { ReactNode } from 'react'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CompassIcon,
  MapPinIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TruckIcon,
  WalletIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SiteFooter, SiteHeader } from '@/widgets/site-chrome'
import { siteButton, siteButtonSolid } from '@/widgets/site-chrome/buttons'
import { siteUrl } from '@/shared/config/sites'
import { OrangeRibbon } from '@/shared/ui/orange-ribbon'
import { Reveal } from '@/shared/ui/reveal'
import { BearScene, type BearKind } from './bear-scene'
import { NeighbourhoodScene } from './neighbourhood-scene'
import { t } from '@/shared/i18n'


const btn = siteButton
const btnSolid = siteButtonSolid
const btnPale = cn(btn, 'bg-pill-pale text-ink hover:bg-grey-200')


/** Public landing page at "/": brings customers to the app and local shops to seller sign-up (look: Landing v3 on the design canvas). */
export function LandingPage() {
  return (
    <div className="bg-background text-ink">
      <title>{t('bonbon — Đặt món từ quán ăn ngay trong khu của bạn')}</title>
      <meta
        name="description"
        content={t('Đặt cơm, bún, đồ uống từ các quán ngay trong chung cư và khu công nghiệp của bạn. Quán tự giao trong khu, phí giao thấp. Chủ quán trả hoa hồng thấp hơn các ứng dụng lớn.')}
      />
      <SiteHeader />
      <main>
        <Hero />
        <NearbyShops />
        <OrderSteps />
        <TrustRow />
        <SellerBand />
        <Faq />
      </main>
      <SiteFooter />
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

/** Fixed-size image slot. The photos in public/mock are temporary stand-ins (see CREDITS.md there); swap the files or the `src` later. */
function ImageSlot({ label, className, src }: { label: string; className?: string; src?: string }) {
  if (src) return <img src={src} alt={label} loading="lazy" decoding="async" className={cn('bg-image-slot object-cover', className)} />
  return <div role="img" aria-label={label} className={cn('bg-image-slot', className)} />
}

/** The black round badge that carries an icon next to a short point. */
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center text-primary [&_svg]:size-6" aria-hidden="true">
      {children}
    </span>
  )
}

function Hero() {
  return (
    <section id="dat-mon" className="relative scroll-mt-20 overflow-hidden">
      <Wrap className="flex flex-col items-center pt-14 pb-24 text-center lg:pt-20 lg:pb-40">
        <Reveal className="flex flex-col items-center gap-6">
          <a
            href={siteUrl('merchant', '/register')}
            className="inline-flex items-center gap-2 rounded-full bg-muted py-1 pr-3 pl-1 text-sm font-medium text-ink transition-colors hover:bg-border"
          >
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{t('Mới')}</span>
            {t('Mở quán trên bonbon chỉ trong vài bước')}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </a>
          <h1 className="max-w-4xl text-[2.5rem] leading-[1.1] font-semibold tracking-[-0.025em] sm:text-[3.5rem] lg:text-[4rem]">
            {t('Đặt món từ quán ngay dưới sảnh, ')}<span className="text-primary">{t('giao tận cửa.')}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-[1.75rem] text-muted-foreground">
            {t('Các quán ăn trong chung cư và khu công nghiệp của bạn, trong một ứng dụng. Quán tự mang món tới, phí giao thấp, theo dõi từng bước.')}
          </p>
          <div id="get-app" className="flex scroll-mt-24 flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <span aria-disabled="true" className={cn(btnSolid, 'cursor-default')}>
                <SmartphoneIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                {t('Tải app đặt món')}
              </span>
              <a href="#quan" className={btnPale}>
                <CompassIcon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                {t('Xem quán trong khu')}
              </a>
            </div>
            <p className="text-sm text-muted-foreground">{t('Ứng dụng sắp có trên App Store và Google Play.')}</p>
          </div>
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            <li className="flex items-center gap-2">
              <TruckIcon className="size-[18px] text-primary" strokeWidth={1.75} aria-hidden="true" />
              <b>{t('Quán tự giao')}</b>
              <span className="text-muted-foreground">{t('trong cùng toà, vài phút là tới')}</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-[18px] text-primary" strokeWidth={1.75} aria-hidden="true" />
              <b>{t('Theo dõi từng bước')}</b>
              <span className="text-muted-foreground">{t('cập nhật ngay khi quán làm')}</span>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="relative mt-14 w-full max-w-5xl">
          <OrangeRibbon className="absolute -bottom-[12%] -left-[30%] w-[58%]" />
          <OrangeRibbon className="absolute -right-[28%] -bottom-[18%] w-[54%] -scale-x-100" />
          <div className="relative rounded-2xl bg-white p-2 text-left shadow-[0_30px_80px_rgb(0_0_0/0.10)]">
            <NeighbourhoodScene />
          </div>
        </Reveal>
      </Wrap>
    </section>
  )
}

const SHOPS = [
  { name: t('Cơm tấm Cô Ba'), minutes: 12, meta: t('120 m · phí giao 5.000 ₫'), free: true, image: '/mock/com.jpg' },
  { name: t('Bún chả Hà Thành'), minutes: 20, meta: t('350 m · phí giao 8.000 ₫'), image: '/mock/bun.jpg' },
  { name: t('Bánh mì Nắng'), minutes: 15, meta: t('210 m · phí giao 3.000 ₫'), image: '/mock/banh-mi.jpg' },
  { name: t('Trà chanh Góc Sân'), minutes: 10, meta: t('90 m · phí giao 3.000 ₫'), image: '/mock/tra-chanh.jpg' },
]

function NearbyShops() {
  return (
    <section id="quan" className="relative scroll-mt-4 bg-card py-12 lg:py-20">
      <Reveal>
      <Wrap className="flex flex-col gap-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-[620px] text-[2rem] leading-10 font-semibold tracking-[-0.02em] lg:text-[2.75rem] lg:leading-[3.125rem]">
            {t('Quán ngay trong khu, ')}<Soft>{t('giao được tới địa chỉ của bạn')}</Soft>
          </h2>
          <span className="text-[0.8125rem] text-muted-foreground">{t('Ví dụ minh hoạ')}</span>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {SHOPS.map((shop) => (
            <li key={shop.name} className="flex flex-col gap-2.5 rounded-card bg-background p-2.5">
              <div className="relative h-[170px]">
                <ImageSlot src={shop.image} label={t('Món của {v0} (ảnh minh hoạ)', { v0: shop.name })} className="size-full rounded-media bg-grey-100" />
                <span className="absolute top-2.5 left-2.5 rounded-sm bg-ink px-2.5 py-1.5 text-xs font-semibold text-white">{shop.minutes}{t(' phút')}</span>
                {shop.free ? <span className="absolute top-2.5 right-2.5 rounded-sm bg-white px-2.5 py-1.5 text-xs font-semibold text-brand-700">{t('Miễn phí giao')}</span> : null}
              </div>
              <div className="px-1.5 pb-1.5">
                <b className="text-[1.0625rem]">{shop.name}</b>
                <div className="text-sm text-muted-foreground tabular-nums">{shop.meta}</div>
              </div>
            </li>
          ))}
        </ul>
      </Wrap>
      </Reveal>
    </section>
  )
}

const STEPS = [
  {
    bear: 'order' as BearKind,
    chip: t('Chờ quán xác nhận'),
    title: t('Chọn món và đặt'),
    body: t('Thấy phí giao và tổng tiền trước khi đặt. Trả tiền mặt hoặc qua MoMo.'),
  },
  {
    bear: 'cook' as BearKind,
    chip: t('Đang chuẩn bị'),
    title: t('Quán nhận đơn và nấu'),
    body: t('Quán xác nhận trên điện thoại; bạn được báo khi món bắt đầu nấu.'),
  },
  {
    bear: 'deliver' as BearKind,
    chip: t('Đang giao'),
    title: t('Quán tự mang tới'),
    body: t('Không qua tài xế trung gian: cùng toà, cùng khu, món còn nóng.'),
  },
  {
    bear: 'done' as BearKind,
    chip: t('Đã giao'),
    title: t('Nhận món, đánh giá quán'),
    body: t('Có vấn đề với đơn? Báo ngay trong app, bonbon cùng quán giải quyết.'),
  },
]

function OrderSteps() {
  return (
    <div className="relative">
    <Wrap className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8 py-12 lg:py-20">
      <h2 className="col-span-full max-w-[640px] text-[2rem] leading-10 font-semibold tracking-[-0.02em] lg:text-[2.75rem] lg:leading-[3.125rem]">
        {t('Một đơn hàng, ')}<Soft>{t('bốn bước rõ ràng')}</Soft>
      </h2>
      {STEPS.map(({ bear, chip, title, body }, i) => (
        <div key={title} className="flex flex-col gap-3">
          <div className="mb-2 overflow-hidden rounded-2xl bg-accent px-6 pt-6">
            <BearScene kind={bear} />
          </div>
          <span className="text-caption font-medium tracking-wide text-primary uppercase">
            {t('Bước ')}{i + 1} · {chip}
          </span>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="leading-6 text-muted-foreground">{body}</p>
        </div>
      ))}
    </Wrap>
    </div>
  )
}

const TRUST = [
  { icon: ShieldCheckIcon, title: t('Quán đã xác minh'), body: t('Mỗi quán gửi giấy tờ và được bonbon duyệt trước khi bán.') },
  { icon: WalletIcon, title: t('Tiền mặt hoặc MoMo'), body: t('Trả khi nhận món, hoặc thanh toán trước qua ví MoMo.') },
  { icon: MessageCircleIcon, title: t('Có người lo khi đơn trục trặc'), body: t('Báo vấn đề ngay trong app; bonbon theo dõi tới khi xong.') },
]

function TrustRow() {
  return (
    <section className="relative bg-card py-12 lg:py-16">
      <Wrap className="grid gap-8 sm:grid-cols-3">
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4">
            <Badge>
              <Icon strokeWidth={1.75} />
            </Badge>
            <div>
              <h3 className="mb-1 text-[1.0625rem] font-semibold">{title}</h3>
              <p className="leading-6 text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </Wrap>
    </section>
  )
}

const SELLER_STEPS = [
  { title: t('Gửi hồ sơ'), body: t('Thông tin quán, giờ mở cửa, tài khoản nhận tiền. Lưu nháp, điền dần được.') },
  { title: t('Được duyệt'), body: t('bonbon xem hồ sơ và báo kết quả qua email.') },
  { title: t('Nhận đơn'), body: t('Thêm thực đơn, bật nhận đơn và bắt đầu bán cho hàng xóm.') },
]

function SellerBand() {
  return (
    <section id="mo-quan" className="relative scroll-mt-20 bg-grey-50 py-20 lg:py-28">
      <Reveal>
      <Wrap className="flex flex-wrap items-center gap-14">
        <div className="flex min-w-0 flex-[1_1_30rem] flex-col gap-6">
          <h2 className="text-[2.125rem] leading-[2.5rem] font-semibold tracking-[-0.03em] lg:text-[3.25rem] lg:leading-[3.625rem]">
            {t('Bán cho hàng xóm, ')}<span className="text-primary">{t('giữ lại nhiều hơn từ mỗi đơn')}</span>
          </h2>
          <p className="text-lead text-muted-foreground">
            {t('Hoa hồng thấp hơn các ứng dụng giao đồ ăn lớn. Bạn tự đặt bán kính giao, phí giao và giờ mở cửa; tự giao trong khu, không phụ thuộc tài xế.')}
          </p>
          <ol className="grid gap-6 pt-2 sm:grid-cols-3">
            {SELLER_STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-1">
                <span className="text-caption font-medium tracking-wide text-primary uppercase">{t('Bước ')}{i + 1}</span>
                <b className="text-body font-medium">{step.title}</b>
                <span className="text-ui text-muted-foreground">{step.body}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-3">
            <a href={siteUrl('merchant', '/register')} className={btnSolid}>
              {t('Mở quán trên bonbon')}
            </a>
            <a href="#hoi-dap" className={btnPale}>
              {t('Hồ sơ cần những gì?')}
            </a>
          </div>
          <a href={siteUrl('merchant', '/login')} className="text-link self-start text-ui font-medium text-ink">
            {t('Đã có tài khoản? Đăng nhập')}
          </a>
        </div>
        <div className="flex min-w-0 flex-[1_1_22rem] justify-center">
          <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl bg-primary px-8 pt-10">
            <OrangeRibbon className="absolute -top-1/3 -right-1/3 w-[110%] opacity-40" />
            <BearScene kind="shop" className="relative" />
          </div>
        </div>
      </Wrap>
      </Reveal>
    </section>
  )
}

const FAQ: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: t('Cho người đặt món'),
    items: [
      { q: t('bonbon giao tới đâu?'), a: t('Mỗi quán tự đặt bán kính giao quanh quán. App chỉ hiện những quán giao được tới địa chỉ bạn đã lưu.') },
      { q: t('Phí giao bao nhiêu?'), a: t('Do từng quán đặt và hiện rõ trước khi đặt; nhiều quán miễn phí giao khi đơn đủ một mức nhất định.') },
      { q: t('Đơn bị sai hoặc không tới thì sao?'), a: t('Báo vấn đề trong mục Đơn hàng. Đơn trả trước qua MoMo được hoàn tiền khi lỗi thuộc về quán.') },
    ],
  },
  {
    group: t('Cho chủ quán'),
    items: [
      { q: t('Mở quán cần những gì?'), a: t('Thông tin quán và địa chỉ, giờ mở cửa, thông tin thuế, tài khoản nhận tiền và giấy tờ tuỳ thân của chủ quán. Hồ sơ lưu nháp, điền dần được.') },
      { q: t('Bao lâu thì được duyệt?'), a: t('Quản trị viên xem hồ sơ theo thứ tự gửi; bạn nhận email khi có kết quả, kèm lý do nếu cần bổ sung.') },
      { q: t('Tôi có phải thuê người giao không?'), a: t('Không bắt buộc. Quán tự giao trong khu, thường chỉ vài tầng hoặc vài toà; bạn đặt bán kính phù hợp với mình.') },
    ],
  },
]

function Faq() {
  return (
    <section id="hoi-dap" className="relative scroll-mt-4 bg-background py-12 lg:py-20">
      <Reveal>
      <Wrap className="flex flex-col gap-8">
        <h2 className="text-[2rem] leading-10 font-semibold tracking-[-0.02em] lg:text-[2.75rem] lg:leading-[3.125rem]">
          {t('Câu hỏi ')}<Soft>{t('thường gặp')}</Soft>
        </h2>
        <div className="grid gap-10 md:grid-cols-2 md:gap-12">
          {FAQ.map((group) => (
            <div key={group.group} className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-primary">{group.group}</h3>
              {group.items.map((item) => (
                <details key={item.q} className="group rounded-panel bg-card px-6 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.0625rem] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-pill-pale" aria-hidden="true">
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
      </Reveal>
    </section>
  )
}
