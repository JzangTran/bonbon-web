import { ArrowLeftIcon, CheckIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Stepper, type StepperStep } from '@/shared/ui/stepper'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

/**
 * The bar every sign-in and sign-up page starts with: the logo and the page name side by side on the left, a help
 * link on the right (shown only when a support address is configured).
 */
export function AuthTopBar({ title }: { title: string }) {
  return (
    <header className="px-4 pt-4 sm:pt-6">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 rounded-full bg-ink py-2.5 pr-3 pl-5 shadow-[0_8px_24px_rgb(20_32_26/0.18)] sm:pl-[30px]">
        <Link to="/" className="flex min-w-0 items-center gap-3 text-white">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" className="shrink-0">
            <circle cx="13" cy="13" r="12" fill="#00a44a" />
            <path d="M8 14c0-4 2-6 5-6M18 12c0 4-2 6-5 6" stroke="#14201a" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span className="text-2xl font-extrabold tracking-tight">bonbon</span>
          <span aria-hidden="true" className="hidden h-5 w-px bg-white/20 sm:block" />
          <span className="hidden truncate text-[15px] font-medium text-white/80 sm:block">{title}</span>
        </Link>
        {SUPPORT_EMAIL ? (
          <a href={`mailto:${SUPPORT_EMAIL}`} className="rounded-full px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10">
            Bạn cần giúp đỡ?
          </a>
        ) : null}
      </div>
    </header>
  )
}

/** A centered card under the top bar: sign-in help pages (forgot password, verify email, admin sign-in). */
export function AuthShell({ title, description, children, footer, heading = 'Đăng nhập' }: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** The name shown beside the logo in the top bar. */
  heading?: string
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AuthTopBar title={heading} />
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-10">
        <div className="flex w-full max-w-sm flex-col gap-5 rounded-card bg-card p-8 shadow-float">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {children}
        </div>
        {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
      </main>
    </div>
  )
}

/**
 * Sign-in and sign-up entry: marketing copy on the left, a floating card on the right, a city skyline fading
 * out at the bottom. Below md the copy drops under the card.
 */
export function AuthHero({ heading, eyebrow, headline, headlineSoft, points, cardTitle, children, footer }: {
  heading: string
  eyebrow: string
  headline: string
  /** the rest of the headline, in the soft gray */
  headlineSoft?: string
  points: { icon: ReactNode; text: string }[]
  cardTitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AuthTopBar title={heading} />
      <main className="relative flex flex-1 items-center overflow-hidden">
        <Skyline />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[minmax(0,1fr)_22rem] md:items-center md:gap-16 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="order-2 flex flex-col gap-6 md:order-1">
            <div>
              <p className="text-base font-semibold text-primary">{eyebrow}</p>
              <h2 className="mt-2 max-w-md text-[40px] leading-[46px] font-extrabold tracking-[-0.03em] lg:text-[52px] lg:leading-[58px]">
                {headline}
                {headlineSoft ? (
                  <>
                    <br />
                    <span className="text-headline-soft">{headlineSoft}</span>
                  </>
                ) : null}
              </h2>
            </div>
            <ul className="flex max-w-md flex-col gap-4">
              {points.map((point) => (
                <li key={point.text} className="flex items-start gap-3 text-foreground">
                  <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white [&_svg]:size-[22px]">
                    {point.icon}
                  </span>
                  <span className="pt-2.5">{point.text}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="order-1 flex w-full max-w-sm flex-col gap-5 justify-self-center rounded-card bg-card p-8 shadow-float md:order-2 md:max-w-none">
            <h1 className="text-2xl font-extrabold tracking-tight">{cardTitle}</h1>
            {children}
            <p className="text-center text-sm text-muted-foreground">{footer}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

/** The pages after the entry card: three steps over a centered card with a back arrow. */
export function AuthStepPage({ heading, steps, current, title, description, onBack, children }: {
  heading: string
  steps: StepperStep[]
  current: number
  title: string
  description?: string
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AuthTopBar title={heading} />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-8 px-4 py-10">
        <Stepper steps={steps} current={current} className="max-w-md" />
        <div className="relative flex w-full flex-col gap-5 rounded-card bg-card p-8 shadow-float">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Quay lại"
              className="absolute top-5 left-5 flex size-8 items-center justify-center rounded-sm text-primary hover:bg-muted"
            >
              <ArrowLeftIcon className="size-5" />
            </button>
          ) : null}
          <div className="flex flex-col gap-1.5 px-8 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

/** The big outlined check of a finished flow. */
export function SuccessMark() {
  return (
    <span className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-primary text-primary">
      <CheckIcon className="size-8" />
    </span>
  )
}

/** Light green city silhouettes along the bottom edge of an entry page. */
function Skyline() {
  return (
    <svg aria-hidden viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-brand-100/70 md:h-44">
      <g fill="currentColor">
        <rect x="40" y="120" width="70" height="100" />
        <rect x="120" y="70" width="60" height="150" />
        <rect x="190" y="110" width="80" height="110" />
        <path d="M300 220V90l35-40 35 40v130z" />
        <rect x="390" y="130" width="90" height="90" />
        <rect x="490" y="40" width="50" height="180" />
        <rect x="550" y="100" width="70" height="120" />
        <rect x="640" y="150" width="100" height="70" />
        <rect x="760" y="60" width="64" height="160" />
        <rect x="834" y="110" width="80" height="110" />
        <path d="M930 220V120h110v100z" />
        <path d="M925 120h120l-12-24H937z" opacity="0.7" />
        <rect x="1060" y="80" width="56" height="140" />
        <rect x="1126" y="130" width="60" height="90" />
      </g>
    </svg>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-md bg-danger-subtle px-3 py-2 text-sm text-danger-fg">
      {message}
    </p>
  )
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <p role="status" className="rounded-md bg-success-subtle px-3 py-2 text-sm text-success-fg">
      {message}
    </p>
  )
}
