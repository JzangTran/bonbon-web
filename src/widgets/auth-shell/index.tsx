import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

/** Centered card used by every sign-in, sign-up and password page. */
export function AuthShell({ title, description, children, footer }: {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 p-6">
      <p className="text-center text-3xl font-extrabold tracking-tight text-primary">bonbon</p>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
      {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
    </main>
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
