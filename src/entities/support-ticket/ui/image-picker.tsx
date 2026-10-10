import { ImageIcon, XIcon } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/shared/ui/button'

const MAX = 3

/** Up to three images to attach; the files are uploaded when the form is sent. */
export function ImagePicker({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col gap-2">
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          onChange([...files, ...Array.from(e.target.files ?? [])].slice(0, MAX))
          e.target.value = ''
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={files.length >= MAX} onClick={() => input.current?.click()}>
          <ImageIcon /> Đính kèm ảnh ({files.length}/{MAX})
        </Button>
        {files.map((f, i) => (
          <span key={`${f.name}-${i}`} className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-1 text-xs">
            {f.name}
            <button type="button" aria-label={`Bỏ ${f.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))}>
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
