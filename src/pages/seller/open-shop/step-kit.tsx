import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { SHOP_QUERY_KEY } from '@/entities/shop'
import { api, problemMessage } from '@/shared/api'
import { acceptUploads } from '@/shared/lib/upload'
import { Button } from '@/shared/ui/button'
import { FormRow } from '@/shared/ui/form-row'
import { ImageUpload } from '@/shared/ui/image-upload'
import type { UploadKind } from './step-logic'

export function StepCard({ title, description, children, footer }: { title: string; description?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">{footer}</div>
    </section>
  )
}

/** One line of the form: the label on the left, the control on the right. */
export function Field({ id, label, required, error, hint, children }: { id?: string; label: string; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  return (
    <FormRow htmlFor={id} label={label} required={required} error={error} hint={hint}>
      {children}
    </FormRow>
  )
}

export function SaveButtons({ pending, onSave }: { pending: boolean; onSave: (andNext: boolean) => void }) {
  return (
    <>
      <Button type="button" variant="outline" disabled={pending} onClick={() => onSave(false)}>
        Lưu nháp
      </Button>
      <Button type="button" disabled={pending} onClick={() => onSave(true)}>
        Lưu & tiếp tục
      </Button>
    </>
  )
}

function useUpload(kind: UploadKind) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data, error } = await api.POST('/api/merchant/shop/files/{kind}', {
        params: { path: { kind } },
        body: form as unknown as { file: string },
        bodySerializer: (body) => body as unknown as FormData,
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      toast.success('Đã tải tệp lên.')
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
}

/** A document of the application: its label, a square with a plus to pick the file (checked first), and the limit as a hint. */
export function UploadField({
  label,
  required,
  hint,
  kind,
  accept,
  maxMb = 8,
  previewUrl,
  error,
}: {
  label: string
  required?: boolean
  hint: string
  kind: UploadKind
  accept: string
  /** the server's limit for this document, in MB */
  maxMb?: number
  previewUrl?: string
  error?: string
}) {
  const upload = useUpload(kind)
  const pdf = accept.includes('application/pdf')
  const errorId = `upload-${kind}-error`
  return (
    <Field label={label} required={required} hint={hint} error={error}>
      <ImageUpload
        label={label}
        accept={accept}
        previewUrl={previewUrl}
        pdf={kind === 'business-license'}
        pending={upload.isPending}
        invalid={!!error}
        describedBy={error ? errorId : undefined}
        onPick={async (file) => {
          const [ok] = await acceptUploads([file], { maxMb, pdf }, (m) => toast.error(m))
          if (ok) upload.mutate(ok)
        }}
      />
    </Field>
  )
}
