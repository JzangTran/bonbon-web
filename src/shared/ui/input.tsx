import * as React from "react"
import { cn } from "cn"

/**
 * A ceiling for what can be typed when the field names none: the backend limits every field, so nothing the person types
 * past these could be accepted anyway. A field with its own limit passes `maxLength` and wins.
 */
const DEFAULT_MAX_LENGTH: Record<string, number> = { text: 255, search: 100, email: 255, tel: 30, url: 500, password: 100 }

/** Input types a person types text into; only these can show how many characters are left. */
const COUNTED_TYPES = new Set(["text", "search", "email", "tel", "url"])

const FIELD_CLASS =
  "h-10 w-full min-w-0 rounded-sm border border-input bg-card px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"

/**
 * `showCount` puts "typed/max" (for example 12/100) at the right inside the field. It needs a controlled `value`; a form row turns
 * it on for the fields it holds.
 */
function Input({ className, type, showCount, ...props }: React.ComponentProps<"input"> & { showCount?: boolean }) {
  const maxLength = props.maxLength ?? DEFAULT_MAX_LENGTH[type ?? "text"]
  const counted = showCount && COUNTED_TYPES.has(type ?? "text") && typeof props.value === "string" && maxLength !== undefined
  const input = (
    <input
      type={type}
      data-slot="input"
      className={cn(FIELD_CLASS, counted && "pr-16", className)}
      {...props}
      maxLength={maxLength}
    />
  )
  if (!counted) return input
  return (
    <div className="relative w-full">
      {input}
      <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground tabular-nums">
        {(props.value as string).length}/{maxLength}
      </span>
    </div>
  )
}

export { Input }
