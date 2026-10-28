import { FileTextIcon, LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { useId, type ChangeEvent } from 'react'
import { cn } from '@/shared/lib/utils'

/**
 * The button for a picture: a square with a plus in the middle. When a file is already there the square shows it (a picture,
 * or a document icon for a PDF) and picking again replaces it. The checks and the upload are the caller's (`onPick`).
 */
export function ImageUpload({
  label,
  accept,
  previewUrl,
  pdf,
  pending,
  invalid,
  onPick,
  describedBy,
}: {
  label: string
  accept: string
  previewUrl?: string
  /** The stored file is a document, not a picture. */
  pdf?: boolean
  pending?: boolean
  invalid?: boolean
  onPick: (file: File) => void
  describedBy?: string
}) {
  const id = useId()
  const change = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onPick(file)
  }
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={id}
        className={cn(
          'relative flex size-28 cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-dashed bg-card text-muted-foreground transition-colors hover:bg-ws-fill focus-within:ring-3 focus-within:ring-ring/50',
          invalid ? 'border-destructive' : 'border-input',
        )}
      >
        {previewUrl && !pdf ? <img src={previewUrl} alt={label} className="absolute inset-0 size-full object-cover" /> : null}
        {previewUrl && pdf ? <FileTextIcon className="size-8 text-primary" aria-hidden="true" /> : null}
        {!previewUrl ? <PlusIcon className="size-8" aria-hidden="true" /> : null}
        {pending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-card/70">
            <LoaderCircleIcon className="size-6 animate-spin" aria-hidden="true" />
          </span>
        ) : null}
        <input id={id} type="file" accept={accept} aria-label={label} aria-describedby={describedBy} className="sr-only" onChange={change} />
      </label>
      {previewUrl ? (
        <a className="text-link text-sm" href={previewUrl} target="_blank" rel="noreferrer">
          {pdf ? 'Xem tệp đã tải' : 'Xem ảnh'}
        </a>
      ) : null}
    </div>
  )
}
