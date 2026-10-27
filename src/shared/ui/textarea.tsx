import * as React from "react"
import { cn } from "@/shared/lib/utils"

const DEFAULT_MAX_LENGTH = 2000

/** `showCount` puts "typed/max" at the bottom right inside the field; it needs a controlled `value`. */
function Textarea({ className, showCount, ...props }: React.ComponentProps<"textarea"> & { showCount?: boolean }) {
  const maxLength = props.maxLength ?? DEFAULT_MAX_LENGTH
  const counted = showCount && typeof props.value === "string"
  const area = (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg bg-grey-100 px-3 py-2.5 text-ui text-ink transition-colors outline-none placeholder:text-grey-600/70 hover:bg-grey-200/70 focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-danger-subtle aria-invalid:outline-2 aria-invalid:outline-destructive",
        counted && "pb-7",
        className
      )}
      {...props}
      maxLength={maxLength}
    />
  )
  if (!counted) return area
  return (
    <div className="relative w-full">
      {area}
      <span aria-hidden="true" className="pointer-events-none absolute right-3 bottom-2 text-xs text-muted-foreground tabular-nums">
        {(props.value as string).length}/{maxLength}
      </span>
    </div>
  )
}

export { Textarea }
