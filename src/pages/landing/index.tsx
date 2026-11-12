import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  WalletIcon,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SiteFooter, SiteHeader } from '@/widgets/site-chrome'
import { siteButton, siteButtonSolid } from '@/widgets/site-chrome/buttons'
import { siteUrl } from '@/shared/config/sites'
import { OrangeKnot, OrangeRibbon } from '@/shared/ui/orange-ribbon'
import { Reveal } from '@/shared/ui/reveal'
import { BearScene, type BearKind } from './bear-scene'
import { HeroPoster } from './hero-poster'
import { Mascot } from './mascot'
import { pictureOf } from '@/shared/assets/mascot-pictures'
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
        <OrderSteps />
        <TrustRow />
        <SellerBand />
        <Faq />
      </main>
      <SiteFooter />
      <MobileActionBar />
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

/** The black round badge that carries an icon next to a short point. */
function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-primary [&_svg]:size-5 sm:size-10 sm:bg-transparent sm:[&_svg]:size-6" aria-hidden="true">
      {children}
    </span>
  )
}

function Hero() {
  return (
    <section id="order" className="relative scroll-mt-20 overflow-hidden">
      <Wrap className="flex flex-col items-center pt-8 pb-14 text-center sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-36">
        {/* compact, after gitbook.com: a pill, a two-line headline, one line under it, two buttons */}
        <Reveal className="flex flex-col items-center gap-5">
          <a
            href={siteUrl('merchant', '/register')}
            className="inline-flex items-center gap-2 rounded-full border border-grey-200 bg-white py-1 pr-3 pl-1 text-sm text-muted-foreground transition-colors hover:bg-grey-100 hover:text-ink"
          >
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{t('Mới')}</span>
            {t('Mở quán trên bonbon chỉ trong vài bước')}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </a>
          <h1 className="max-w-[56rem] text-[2.5rem] leading-[1.08] font-medium tracking-[-0.03em] text-balance sm:text-[3.5rem]">
            {t('Đặt món từ quán dưới sảnh. ')}<span className="text-primary">{t('Giao tận cửa.')}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-[1.75rem] text-muted-foreground">{t('Quán ăn trong toà và trong khu của bạn, trong một ứng dụng.')}</p>
          <div id="get-app" className="flex scroll-mt-24 flex-wrap justify-center gap-3">
            <span aria-disabled="true" title={t('Ứng dụng sắp có trên App Store và Google Play.')} className={cn(btnSolid, 'cursor-default')}>
              {t('Tải app đặt món')}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </span>
            <a href="#how-it-works" className={btnPale}>
              {t('Xem quán trong khu')}
            </a>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mt-10 w-full max-w-5xl sm:mt-14">
          {/* the one 3D ribbon of the page, sweeping across behind the bear */}
          <OrangeKnot className="absolute top-[58%] left-1/2 w-[100%] max-w-none -translate-x-1/2 -translate-y-1/2" />
          <HeroPoster />
        </Reveal>
      </Wrap>
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
    <div id="how-it-works" className="relative scroll-mt-20">
    <StepCarousel />
    <Wrap className="hidden grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-8 py-12 sm:grid lg:py-20">
      <h2 className="col-span-full max-w-[640px] text-[2rem] leading-10 font-semibold tracking-[-0.02em] lg:text-[2.75rem] lg:leading-[3.125rem]">
        {t('Một đơn hàng, ')}<Soft>{t('bốn bước rõ ràng')}</Soft>
      </h2>
      {STEPS.map(({ bear, chip, title, body }, i) => (
        <div key={title} className="flex flex-col gap-3">
          {/* the same frame for every step, white like the rendered pictures' own ground, so the four line up */}
          <div className="mb-2 flex aspect-[5/4] items-end justify-center overflow-hidden rounded-2xl bg-white px-4 pt-4 ring-1 ring-grey-200">
            <BearScene kind={bear} className="max-h-full w-auto max-w-full" />
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

/**
 * On a phone the four steps are one swipe each instead of four screens of scrolling: a card that leaves the next one peeking in,
 * a tinted ground per step, and dots that follow the swipe (tapping one goes there).
 */
function StepCarousel() {
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const onScroll = () => {
    const el = track.current
    const card = el?.firstElementChild as HTMLElement | null | undefined
    if (!el || !card) return
    setActive(Math.min(STEPS.length - 1, Math.round(el.scrollLeft / (card.offsetWidth + 12))))
  }
  const go = (i: number) => {
    const el = track.current
    const card = el?.children[i] as HTMLElement | undefined
    if (el && card) el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' })
  }
  const grounds = ['bg-[#fff3ea]', 'bg-[#fff8e6]', 'bg-[#eef6f0]', 'bg-[#f1f0fb]']

  return (
    <section className="pt-2 pb-12 sm:hidden" aria-label={t('Một đơn hàng, bốn bước rõ ràng')}>
      <Wrap>
        <h2 className="text-[1.75rem] leading-9 font-semibold tracking-[-0.02em]">
          {t('Một đơn hàng, ')}<Soft>{t('bốn bước rõ ràng')}</Soft>
        </h2>
      </Wrap>
      <div
        ref={track}
        onScroll={onScroll}
        className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {STEPS.map(({ bear, chip, title, body }, i) => (
          <article key={title} className={cn('flex w-[82%] shrink-0 snap-start scroll-ml-4 flex-col overflow-hidden rounded-3xl', grounds[i])}>
            <div className="relative flex aspect-[4/3] items-end justify-center px-6 pt-12">
              <span className="absolute top-4 left-4 flex size-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink shadow-sm">
                {i + 1}
              </span>
              <span className="absolute top-5 right-4 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-primary">{chip}</span>
              <BearScene kind={bear} className="max-h-full w-auto max-w-full mix-blend-multiply" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5 bg-white/70 p-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-ui leading-6 text-muted-foreground">{body}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            aria-label={t('Bước ') + (i + 1)}
            aria-current={active === i}
            onClick={() => go(i)}
            className={cn('h-2 rounded-full transition-all', active === i ? 'w-6 bg-primary' : 'w-2 bg-grey-300')}
          />
        ))}
      </div>
    </section>
  )
}

const TRUST = [
  { icon: ShieldCheckIcon, title: t('Quán đã xác minh'), body: t('Mỗi quán gửi giấy tờ và được bonbon duyệt trước khi bán.') },
  { icon: WalletIcon, title: t('Tiền mặt hoặc MoMo'), body: t('Trả khi nhận món, hoặc thanh toán trước qua ví MoMo.') },
  { icon: MessageCircleIcon, title: t('Có người lo khi đơn trục trặc'), body: t('Báo vấn đề ngay trong app; bonbon theo dõi tới khi xong.') },
]

function TrustRow() {
  return (
    <section className="relative bg-card py-10 sm:py-12 lg:py-16">
      <Wrap className="grid gap-3 sm:grid-cols-3 sm:gap-8">
        {TRUST.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-grey-200 sm:rounded-none sm:bg-transparent sm:p-0 sm:ring-0">
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
    <section id="open-a-shop" className="relative scroll-mt-20 bg-grey-50 py-14 sm:py-20 lg:py-28">
      <Reveal>
      <Wrap className="flex flex-wrap items-center gap-10 sm:gap-14">
        <div className="flex min-w-0 flex-[1_1_30rem] flex-col gap-6">
          <h2 className="text-[2.125rem] leading-[2.5rem] font-semibold tracking-[-0.03em] lg:text-[3.25rem] lg:leading-[3.625rem]">
            {t('Bán cho hàng xóm, ')}<span className="text-primary">{t('giữ lại nhiều hơn từ mỗi đơn')}</span>
          </h2>
          <p className="text-lead text-muted-foreground">
            {t('Hoa hồng thấp hơn các ứng dụng giao đồ ăn lớn. Bạn tự đặt bán kính giao, phí giao và giờ mở cửa; tự giao trong khu, không phụ thuộc tài xế.')}
          </p>
          <ol className="grid pt-2 sm:grid-cols-3 sm:gap-6">
            {SELLER_STEPS.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0 sm:flex-col sm:gap-1 sm:pb-0">
                {/* on a phone: a numbered timeline, a line joining one step to the next */}
                {i < SELLER_STEPS.length - 1 ? <span className="absolute top-9 bottom-0 left-[17px] w-0.5 bg-primary/20 sm:hidden" aria-hidden="true" /> : null}
                <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground sm:hidden" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1 pt-1.5 sm:pt-0">
                  <span className="hidden text-caption font-medium tracking-wide text-primary uppercase sm:block">{t('Bước ')}{i + 1}</span>
                  <b className="text-body font-medium">{step.title}</b>
                  <span className="text-ui text-muted-foreground">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <a href={siteUrl('merchant', '/register')} className={btnSolid}>
              {t('Mở quán trên bonbon')}
            </a>
            <a href="#faq" className={btnPale}>
              {t('Hồ sơ cần những gì?')}
            </a>
          </div>
          <a href={siteUrl('merchant', '/login')} className="text-link self-start text-ui font-medium text-ink">
            {t('Đã có tài khoản? Đăng nhập')}
          </a>
        </div>
        <div className="flex min-w-0 flex-[1_1_22rem] justify-center">
          {pictureOf('wave') ? (
            // the rendered scene already has its own shop and counter: show it whole
            <div className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-[#fff6ef] shadow-[0_24px_60px_rgb(0_0_0/0.10)]">
              <Mascot pose="wave" className="w-full" />
            </div>
          ) : (
            <div className="relative w-full max-w-[460px] overflow-hidden rounded-2xl bg-primary px-8 pt-10">
              <OrangeRibbon variant="sweep" className="absolute -top-1/4 -right-1/4 w-[90%] opacity-40" />
              <BearScene kind="shop" className="relative" />
            </div>
          )}
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
    <section id="faq" className="relative scroll-mt-4 bg-background py-12 lg:py-20">
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
                <details key={item.q} className="group rounded-panel bg-card px-4 py-4 sm:px-6">
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

/**
 * On a phone the two actions stay in reach once the hero has scrolled away: a bar at the bottom of the screen, gone again by the
 * footer (which has its own) and never on a wide screen.
 */
function MobileActionBar() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('footer')
      const nearEnd = footer ? footer.getBoundingClientRect().top < window.innerHeight : false
      setShown(window.scrollY > 560 && !nearEnd)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-grey-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 sm:hidden',
        shown ? 'translate-y-0' : 'translate-y-full',
      )}
      aria-hidden={!shown}
    >
      <div className="grid grid-cols-2 gap-2">
        <a href={siteUrl('merchant', '/register')} tabIndex={shown ? 0 : -1} className={btnPale}>
          {t('Mở quán')}
        </a>
        <a href="#get-app" tabIndex={shown ? 0 : -1} className={btnSolid}>
          {t('Tải app')}
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
