import { toast } from 'sonner'
import { t } from '@/shared/i18n'

/**
 * Rung 4 of the feedback ladder: a background action the user can undo ("Đã xoá món Trà đá" + Hoàn tác). One line, one action,
 * at least 6 s, pausing while hovered or focused (sonner does both). Never for errors and never for something the user must read:
 * those go in place, inline or in a banner (see design/docs/feedback.md).
 */
export function showSnackbar({ message, onUndo, actionLabel }: { message: string; onUndo?: () => void; actionLabel?: string }) {
  return toast(message, {
    duration: 6000,
    action: onUndo ? { label: actionLabel ?? t('Hoàn tác'), onClick: onUndo } : undefined,
  })
}
