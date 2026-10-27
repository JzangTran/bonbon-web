import * as React from "react"
import { cn } from "@/shared/lib/utils"

/**
 * A ceiling for what can be typed when the field names none: the backend limits every field, so nothing the person types
 * past these could be accepted anyway. A field with its own limit passes `maxLength` and wins.
 */
const DEFAULT_MAX_LENGTH: Record<string, number> = { text: 255, search: 100, email: 255, tel: 30, url: 500, password: 100 }

/** Input types a person types text into; only these can show how many characters are left. */
const COUNTED_TYPES = new Set(["text", "search", "email", "tel", "url"])

const FIELD_CLASS =
  "h-10 w-full min-w-0 rounded-lg bg-grey-100 px-3 py-1 text-ui text-ink transition-colors outline-none placeholder:text-grey-600/70 hover:bg-grey-200/70 focus-visible:bg-white focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-ui file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:bg-danger-subtle aria-invalid:outline-2 aria-invalid:outline-destructive"

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
