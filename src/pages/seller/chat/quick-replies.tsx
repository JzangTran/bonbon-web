import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { api, problemMessage } from '@/shared/api'
import { t } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { QUICK_REPLIES_KEY as KEY, useQuickReplies, type QuickReply } from './quick-replies-api'

/**
 * The list shown above the composer while typing "/" + shortcut (Intercom's macros, WhatsApp Business quick replies). Click or press
 * Enter/Tab to put the text in the composer; nothing is sent until the seller sends it.
 */
export function QuickReplyPicker({ matches, active, onPick }: { matches: QuickReply[]; active: number; onPick: (r: QuickReply) => void }) {
  return (
    <ul role="listbox" aria-label={t('Tin trả lời mẫu')} className="mb-2 flex max-h-56 flex-col overflow-y-auto rounded-sm border bg-card shadow-sm">
      {matches.length === 0 ? <li className="px-3 py-2 text-sm text-muted-foreground">{t('Không có tin mẫu khớp. Thêm tin mẫu trong Cài đặt chat.')}</li> : null}
      {matches.map((r, i) => (
        <li key={r.id} role="option" aria-selected={i === active}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              onPick(r)
            }}
            className={cn('flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-muted', i === active && 'bg-muted')}
          >
            <span className="font-mono text-xs text-primary">/{r.shortcut}</span>
            <span className="line-clamp-2">{r.text}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Add, edit and remove quick replies (Cài đặt chat). */
export function QuickReplyEditor() {
  const replies = useQuickReplies()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<QuickReply | 'new' | null>(null)
  const [shortcut, setShortcut] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const refresh = () => void queryClient.invalidateQueries({ queryKey: KEY })

  const open = (r: QuickReply | 'new') => {
    setEditing(r)
    setShortcut(r === 'new' ? '' : (r.shortcut ?? ''))
    setText(r === 'new' ? '' : (r.text ?? ''))
    setError(null)
  }
  const save = useMutation({
    mutationFn: async () => {
      const body = { shortcut, text: text.trim() }
      const res =
        editing && editing !== 'new'
          ? await api.PUT('/api/merchant/quick-replies/{id}', { params: { path: { id: editing.id ?? '' } }, body })
          : await api.POST('/api/merchant/quick-replies', { body })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      refresh()
      setEditing(null)
      toast.success(t('Đã lưu tin mẫu.'))
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: problem, response } = await api.DELETE('/api/merchant/quick-replies/{id}', { params: { path: { id } } })
      if (!response.ok) throw problem
    },
    onSuccess: refresh,
    onError: (e) => toast.error(problemMessage(e)),
  })

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{t('Tin trả lời mẫu')}</p>
          <p className="text-xs text-muted-foreground">{t('Gõ / và mã gõ tắt trong ô chat để chèn, ví dụ /giao.')}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => open('new')}>
          <PlusIcon className="size-4" aria-hidden="true" />
          {t('Thêm')}
        </Button>
      </div>
      {editing ? (
        <form
          className="flex flex-col gap-2 rounded-sm border p-3"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            if (!/^[a-z0-9-]{1,20}$/.test(shortcut)) return setError(t('Mã gõ tắt 1–20 ký tự: chữ thường không dấu, số, gạch ngang.'))
            if (!text.trim()) return setError(t('Vui lòng nhập nội dung.'))
            save.mutate()
          }}
        >
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">/</span>
            <Input
              value={shortcut}
              maxLength={20}
              onChange={(e) => setShortcut(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="giao"
              aria-label={t('Mã gõ tắt')}
            />
          </div>
          <Textarea value={text} maxLength={1000} rows={3} onChange={(e) => setText(e.target.value)} aria-label={t('Nội dung tin mẫu')} />
          <FormError message={error} />
          <div className="flex justify-end gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" size="sm" disabled={save.isPending}>
              {t('Lưu')}
            </Button>
          </div>
        </form>
      ) : null}
      <ul className="flex flex-col divide-y rounded-sm border empty:hidden">
        {(replies.data ?? []).map((r) => (
          <li key={r.id} className="flex items-start gap-3 px-3 py-2 text-sm">
            <span className="w-20 shrink-0 font-mono text-xs text-primary">/{r.shortcut}</span>
            <span className="min-w-0 flex-1 line-clamp-2">{r.text}</span>
            <Button variant="ghost" size="icon-sm" aria-label={t('Sửa')} onClick={() => open(r)}>
              <PencilIcon />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label={t('Xoá')} disabled={remove.isPending} onClick={() => r.id && remove.mutate(r.id)}>
              <Trash2Icon />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
