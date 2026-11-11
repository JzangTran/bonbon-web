import { ArrowLeftIcon, CheckIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { pictureOf, type MascotPose } from '@/shared/assets/mascot-pictures'
import { siteUrl } from '@/shared/config/sites'
import { Lockup, Mark } from '@/shared/ui/brand'
import { MascotArt } from '@/shared/ui/illustrations'
import { Stepper, type StepperStep } from '@/shared/ui/stepper'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { t } from '@/shared/i18n'

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL

/**
 * The right half of the sign-in pages, after the GitBook sign-up art: pages of the seller site as tilted cards, stepping down to the left
 * and running off the top right, over a soft blurred halo of warm colours.
 */
function AuthArt() {
  const shots = ['/images/guides/tong-quan.jpg', '/images/guides/don-hang.jpg', '/images/guides/thuc-don.jpg']
  return (
    <div aria-hidden="true" className="relative hidden overflow-hidden lg:block">
      <div className="absolute top-[60%] left-[2%] aspect-square w-[72%] -translate-y-1/2 rounded-full blur-2xl [background:radial-gradient(circle,transparent_40%,rgb(255_150_110/0.55)_50%,rgb(255_196_170/0.6)_57%,rgb(200_190_225/0.55)_65%,transparent_74%)]" />
      <div className="absolute top-[8%] left-[26%] w-[105%] [perspective:2000px]">
        <div className="relative [transform:rotateX(26deg)_rotateY(-6deg)_rotateZ(-30deg)] [transform-style:preserve-3d]">
          {shots.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="absolute top-0 left-0 w-full rounded-2xl border border-black/5 bg-white shadow-[-20px_36px_70px_rgb(0_0_0/0.13)]"
              style={{ transform: `translate(${-i * 18}%, ${i * 40}%)`, zIndex: shots.length - i }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * The frame of every sign-in and sign-up page, after app.gitbook.com/join: the form in a narrow column on the left of a white page, the
 * logo above it, the orange rings with pictures of the product on the right half (from 1024px). Buttons and fields inside get the
 * squarer app shape (6px) through the .bb-auth class in index.css.
 */
function AuthFrame({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="bb-auth grid min-h-svh bg-white lg:grid-cols-2">
      <div className="flex min-h-svh flex-col px-6 sm:px-12 xl:pl-[8.5rem]">
        <header className="flex h-20 items-center justify-between gap-4">
          <a href={siteUrl('public')} aria-label={t('bonbon, trang chủ')} className="flex items-center">
            <Lockup className="h-7" />
          </a>
          <LanguageSwitch compact />
        </header>
        <main className="flex w-full max-w-[30rem] flex-1 flex-col justify-center gap-6 py-10">{children}</main>
        <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 pb-8 text-small text-muted-foreground">
          {footer}
          {SUPPORT_EMAIL ? (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-ink">
              {t('Bạn cần giúp đỡ?')}
            </a>
          ) : null}
        </footer>
      </div>
      <AuthArt />
    </div>
  )
}

/** Two lines in the style of the GitBook sign-up: the first in a soft grey, the second in ink. */
function Heading({ first, second, as = 'h1' }: { first: string; second?: string; as?: 'h1' | 'h2' }) {
  const Tag = as
  return (
    <Tag className="text-[1.875rem] leading-9 font-medium tracking-[-0.015em]">
      {second ? (
        <>
          <span className="block text-ink/60">{first}</span>
          <span className="block text-ink">{second}</span>
        </>
      ) : (
        <span className="block text-ink">{first}</span>
      )}
    </Tag>
  )
}

/** A sign-in help page (forgot password, verify email, admin sign-in): the title, an optional line under it, the form. */
export function AuthShell({ title, description, children, footer, bare = false }: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  /** Kept for the pages that still pass it; the frame no longer shows a page name beside the logo. */
  heading?: string
  /** Pages reached from outside (a payment provider) that only say goodbye: no pictures, just the message. */
  bare?: boolean
}) {
  const body = (
    <>
      <div className="flex flex-col gap-2">
        <Heading first={title} />
        {description ? <p className="text-ui text-muted-foreground">{description}</p> : null}
      </div>
      {children}
      {footer ? <div className="text-ui text-muted-foreground">{footer}</div> : null}
    </>
  )
  if (bare) {
    return (
      <div className="bb-auth flex min-h-svh flex-col items-center justify-center gap-6 bg-white px-6">
        <div className="flex w-full max-w-[30rem] flex-col gap-6">{body}</div>
      </div>
    )
  }
  return <AuthFrame>{body}</AuthFrame>
}

/**
 * The sign-in and sign-up entry: a two-line heading (`headline` soft, `headlineSoft` in ink), the form, and a line under it
 * ("Bạn mới biết đến bonbon? Đăng ký"). `cardTitle` names the form for assistive tech; `eyebrow` sits above the heading.
 */
export function AuthHero({ eyebrow, headline, headlineSoft, cardTitle, children, footer }: {
  heading: string
  eyebrow: string
  headline: string
  headlineSoft?: string
  points?: { icon: ReactNode; text: string }[]
  cardTitle: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <AuthFrame>
      <div className="flex flex-col gap-3">
        <Mark className="h-9 self-start" />
        <p className="text-small font-medium text-primary">{eyebrow}</p>
        <Heading as="h2" first={headline} second={headlineSoft} />
      </div>
      <section aria-label={cardTitle} className="flex flex-col gap-4">
        <h1 className="sr-only">{cardTitle}</h1>
        {children}
      </section>
      <p className="text-ui text-muted-foreground">{footer}</p>
    </AuthFrame>
  )
}

/** The pages after the entry: the steps, a back arrow, the title and the form, in the same frame. */
export function AuthStepPage({ steps, current, title, description, onBack, children }: {
  heading: string
  steps: StepperStep[]
  current: number
  title: string
  description?: string
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <AuthFrame>
      <Stepper steps={steps} current={current} className="max-w-md" />
      <div className="flex items-start gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('Quay lại')}
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-grey-100 hover:text-ink"
          >
            <ArrowLeftIcon className="size-5" />
          </button>
        ) : null}
        <div className="flex flex-col gap-2">
          <Heading first={title} />
          {description ? <p className="text-ui text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {children}
    </AuthFrame>
  )
}

/**
 * The end of a finished flow: the bonbon bear for the moment (`mascot`, e.g. the envelope for "check your inbox"), or the big outlined
 * check when no picture fits.
 */
export function SuccessMark({ mascot }: { mascot?: MascotPose }) {
  if (mascot && pictureOf(mascot)) return <MascotArt pose={mascot} fallback="success" className="mx-auto w-44" />
  return (
    <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
      <CheckIcon className="size-6" />
    </span>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-md bg-danger-subtle px-3 py-2 text-ui text-danger-fg">
      {message}
    </p>
  )
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <p role="status" className="rounded-md bg-success-subtle px-3 py-2 text-ui text-success-fg">
      {message}
    </p>
  )
}
