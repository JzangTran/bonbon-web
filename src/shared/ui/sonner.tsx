import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from 'lucide-react'

/**
 * The snackbar host (design v5): bottom-left, one at a time, in the overlay style (surface, hairline, overlay shadow, 12 px corners).
 * New code calls showSnackbar() for undoable actions only; the old toast calls still render here until they move to the feedback
 * ladder.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      position="bottom-left"
      visibleToasts={1}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-success" />,
        info: <InfoIcon className="size-4 text-info" />,
        warning: <TriangleAlertIcon className="size-4 text-warning" />,
        error: <OctagonXIcon className="size-4 text-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--bb-surface)',
          '--normal-text': 'var(--bb-text)',
          '--normal-border': 'var(--bb-border)',
          '--border-radius': 'var(--bb-radius-card)',
          fontFamily: 'var(--bb-font-sans)',
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 6000,
        classNames: {
          toast: 'cn-toast shadow-overlay',
          actionButton: '!bg-transparent !text-link !font-semibold',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
