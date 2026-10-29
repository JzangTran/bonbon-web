import { GlobeIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { locale, setLocale, t, type Locale } from '@/shared/i18n'

// each language is named in itself, so it can be found whichever one is showing
const LANGUAGES: { id: Locale; short: string; name: string }[] = [
  { id: 'vi', short: 'VI', name: 'Tiếng Việt' },
  { id: 'en', short: 'EN', name: 'English' },
]

/** "Ngôn ngữ": Vietnamese or English, remembered on this device. `compact` is one globe button that switches to the other language. */
export function LanguageSwitch({ className, tone = 'default', compact = false }: { className?: string; tone?: 'default' | 'light'; compact?: boolean }) {
  if (compact) {
    const other = LANGUAGES.find((l) => l.id !== locale)!
    return (
      <button
        type="button"
        lang={other.id}
        onClick={() => setLocale(other.id)}
        aria-label={other.name}
        title={other.name}
        className={cn('flex min-h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring', className)}
      >
        <GlobeIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
        {other.short}
      </button>
    )
  }
  return (
    <div role="group" aria-label={t('Ngôn ngữ')} className={cn('flex items-center gap-2', className)}>
      <span className={cn('text-sm', tone === 'light' ? 'text-white/70' : 'text-muted-foreground')}>{t('Ngôn ngữ')}</span>
      <div className="flex gap-0.5">
        {LANGUAGES.map((l) => {
          const selected = locale === l.id
          return (
            <button
              key={l.id}
              type="button"
              lang={l.id}
              aria-pressed={selected}
              aria-label={l.name}
              title={l.name}
              onClick={() => setLocale(l.id)}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                tone === 'light'
                  ? selected ? 'bg-white text-ink' : 'text-white hover:bg-white/10'
                  : selected ? 'text-primary ring-1 ring-primary/40' : 'text-muted-foreground hover:text-ink',
              )}
            >
              {l.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}
