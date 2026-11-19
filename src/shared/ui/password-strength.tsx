import { passwordProblem, passwordStrength } from '@/shared/lib/validate'
import { cn } from '@/shared/lib/utils'
import { t } from '@/shared/i18n'

const LABELS = ['', 'Yếu', 'Tạm được', 'Mạnh', 'Rất mạnh'] as const
const COLORS = ['bg-grey-200', 'bg-destructive', 'bg-warning', 'bg-success', 'bg-success'] as const

/**
 * A four-step bar under a new password, with the reason when the server would refuse it (too common, contains the email, a run like
 * 12345678). Updates as the person types, so the rule is learnt before pressing the button.
 */
export function PasswordStrength({ password, email, name, className }: { password: string; email?: string; name?: string; className?: string }) {
  if (!password) return null
  const score = passwordStrength(password, email, name)
  const problem = passwordProblem(password, email, name)
  return (
    <div className={cn('flex flex-col gap-1', className)} aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full', i <= score ? COLORS[score] : 'bg-grey-200')} />
        ))}
      </div>
      <p className={cn('text-caption', problem ? 'text-destructive' : 'text-muted-foreground')}>
        {problem ?? t('Độ mạnh: {v0}', { v0: t(LABELS[score]) })}
      </p>
    </div>
  )
}
