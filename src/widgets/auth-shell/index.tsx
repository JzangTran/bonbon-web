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
    <header className="border-b bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-baseline gap-3">
          <span className="text-2xl font-extrabold tracking-tight text-primary">bonbon</span>
          <span className="text-xl text-foreground">{title}</span>
        </Link>
        {SUPPORT_EMAIL ? (
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm text-primary hover:underline">
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
        <div className="flex w-full max-w-sm flex-col gap-5 rounded-sm bg-card p-6 shadow-md">
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-xl font-semibold">{title}</h1>
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
export function AuthHero({ heading, eyebrow, headline, points, cardTitle, children, footer }: {
  heading: string
  eyebrow: string
  headline: string
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
              <p className="text-lg text-primary">{eyebrow}</p>
              <h2 className="mt-1 max-w-md text-4xl leading-tight font-semibold text-primary">{headline}</h2>
            </div>
            <ul className="flex max-w-md flex-col gap-4">
              {points.map((point) => (
                <li key={point.text} className="flex items-start gap-3 text-foreground">
                  <span className="mt-0.5 shrink-0 text-primary [&_svg]:size-6">{point.icon}</span>
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="order-1 flex w-full max-w-sm flex-col gap-5 justify-self-center rounded-sm bg-card p-6 shadow-lg md:order-2 md:max-w-none">
            <h1 className="text-xl font-medium">{cardTitle}</h1>
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
        <div className="relative flex w-full flex-col gap-5 rounded-sm bg-card p-6 shadow-md">
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
            <h1 className="text-xl font-medium">{title}</h1>
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
