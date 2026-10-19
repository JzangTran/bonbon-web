import * as React from "react"
import { cn } from "cn"

const DEFAULT_MAX_LENGTH = 2000

/** `showCount` puts "typed/max" at the bottom right inside the field; it needs a controlled `value`. */
function Textarea({ className, showCount, ...props }: React.ComponentProps<"textarea"> & { showCount?: boolean }) {
  const maxLength = props.maxLength ?? DEFAULT_MAX_LENGTH
  const counted = showCount && typeof props.value === "string"
  const area = (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-card px-3 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
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
