import { Loader2Icon } from 'lucide-react'
import { t } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'

/**
 * Work in progress that takes 1–10 s, shown where the result will appear. Under 1 s show nothing; over 10 s say what is happening
 * (design v5 feedback rules). `label` is announced; it defaults to "Đang tải".
 */
export function Spinner({ label, size = 'md', className }: { label?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <span role="status" data-slot="spinner" className={cn('inline-flex items-center gap-2 text-text-secondary', className)}>
      <Loader2Icon aria-hidden="true" className={cn('animate-spin motion-reduce:animate-none', size === 'sm' ? 'size-4' : size === 'lg' ? 'size-8' : 'size-5')} />
      <span className="sr-only">{label ?? t('Đang tải')}</span>
    </span>
  )
}
