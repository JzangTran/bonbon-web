/** "HOẶC" between the main form and the other ways in. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground" role="separator">
      <span className="h-px flex-1 bg-border" />
      HOẶC
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
