import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Illustration } from '@/shared/ui/illustrations'

/** A still picture of each component for the overview cards: the real component where it is small enough, a sketch of it otherwise. */
export function ComponentPreview({ slug }: { slug: string }) {
  return (
    <div inert className="pointer-events-none flex h-full w-full items-center justify-center">
      {PREVIEWS[slug] ?? null}
    </div>
  )
}

const line = (w: string, cls = 'bg-grey-200') => <span className={cn('block h-2 rounded-full', w, cls)} />

const PREVIEWS: Record<string, ReactNode> = {
  button: (
    <div className="flex gap-2">
      <Button>Button</Button>
      <Button variant="secondary">Button</Button>
    </div>
  ),
  'text-link': (
    <p className="text-body text-ink">
      A <span className="text-link">link</span> in a sentence
    </p>
  ),
  input: (
    <div className="flex w-48 flex-col gap-1.5">
      <span className="text-ui font-medium">Label</span>
      <span className="flex h-9 items-center rounded-md border border-input bg-grey-100 px-3 text-ui text-muted-foreground">Placeholder</span>
    </div>
  ),
  segmented: (
    <div className="inline-flex gap-0.5 rounded-full bg-grey-100 p-0.5 text-small">
      <span className="rounded-full bg-white px-3 py-1 font-medium text-primary shadow-sm">Option 1</span>
      <span className="rounded-full px-3 py-1 text-muted-foreground">Option 2</span>
      <span className="rounded-full px-3 py-1 text-muted-foreground">Option 3</span>
    </div>
  ),
  'page-tabs': (
    <div className="flex w-56 gap-1 border-b border-grey-200 text-ui">
      <span className="-mb-px border-b-2 border-primary px-3 py-2 font-medium text-primary">Tab 1</span>
      <span className="px-3 py-2 text-muted-foreground">Tab 2</span>
      <span className="px-3 py-2 text-muted-foreground">Tab 3</span>
    </div>
  ),
  pagination: (
    <div className="flex items-center gap-1 text-ui">
      <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground">
        <ChevronLeftIcon className="size-4" />
      </span>
      <span className="flex size-8 items-center justify-center rounded-md bg-ink text-white">1</span>
      <span className="flex size-8 items-center justify-center rounded-md">2</span>
      <span className="flex size-8 items-center justify-center rounded-md">3</span>
      <span className="flex size-8 items-center justify-center rounded-md text-muted-foreground">
        <ChevronRightIcon className="size-4" />
      </span>
    </div>
  ),
  badge: (
    <div className="flex gap-2">
      <Badge>Badge</Badge>
      <Badge variant="secondary">Badge</Badge>
      <Badge variant="destructive">Badge</Badge>
    </div>
  ),
  table: (
    <div className="flex w-56 flex-col rounded-lg bg-white text-small">
      {[0, 1, 2].map((i) => (
        <div key={i} className={cn('flex items-center justify-between gap-3 px-3 py-2', i > 0 && 'border-t border-grey-200')}>
          {line('w-16', i === 0 ? 'bg-grey-300' : 'bg-grey-200')}
          {i === 0 ? line('w-10', 'bg-grey-300') : <Badge>Badge</Badge>}
          {line('w-12', i === 0 ? 'bg-grey-300' : 'bg-grey-200')}
        </div>
      ))}
    </div>
  ),
  'stat-tile': (
    <div className="flex gap-5 rounded-xl bg-beige-50 px-5 py-4">
      <div className="flex flex-col">
        <span className="text-small text-muted-foreground">Label</span>
        <span className="text-h2 font-semibold">1,234</span>
      </div>
      <div className="flex flex-col border-l border-grey-200 pl-5">
        <span className="text-small text-muted-foreground">Label</span>
        <span className="text-h2 font-semibold">56%</span>
      </div>
    </div>
  ),
  'chart-panel': (
    <div className="flex h-24 items-end gap-2 rounded-xl bg-beige-50 px-4 pt-4 pb-3">
      {[38, 52, 44, 66, 58, 84, 74].map((h, i) => (
        <span key={i} className="w-4 rounded-t-xs bg-chart-1" style={{ height: `${h}%` }} />
      ))}
    </div>
  ),
  card: (
    <div className="flex w-52 flex-col gap-2 rounded-xl bg-white p-4">
      <span className="text-ui font-semibold">Card title</span>
      {line('w-full')}
      {line('w-2/3')}
    </div>
  ),
  sheet: (
    <div className="flex h-28 w-56 overflow-hidden rounded-lg bg-grey-300/60">
      <div className="flex-1" />
      <div className="flex w-24 flex-col gap-2 bg-white p-3">
        <span className="text-small font-semibold">Sheet</span>
        {line('w-full')}
        {line('w-2/3')}
      </div>
    </div>
  ),
  'empty-state': (
    <div className="flex flex-col items-center gap-1">
      <Illustration name="empty" className="w-20" />
      <span className="text-ui font-semibold">Title</span>
    </div>
  ),
}
