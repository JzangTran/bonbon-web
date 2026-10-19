import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { api, problemMessage } from '@/shared/api'
import { SiteFooter, SiteHeader } from '@/widgets/site-chrome'

type DocumentType = 'CUSTOMER_TERMS' | 'SELLER_TERMS' | 'PRIVACY_POLICY'
const TYPES: DocumentType[] = ['CUSTOMER_TERMS', 'SELLER_TERMS', 'PRIVACY_POLICY']

/** Public page showing the version of a legal document in force (linked from the consent checkboxes). */
export function LegalDocumentPage() {
  const { type } = useParams()
  const valid = TYPES.includes(type as DocumentType)
  const doc = useQuery({
    queryKey: ['legal-document', type],
    enabled: valid,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/legal/documents/{type}', { params: { path: { type: type as DocumentType } } })
      if (error || !data) throw error
      return data
    },
  })
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-10 sm:px-6">
      {!valid ? <p>Không tìm thấy văn bản.</p> : null}
      {doc.isError ? <p className="text-destructive">{problemMessage(doc.error)}</p> : null}
      {doc.data ? (
        <>
          <h1 className="text-2xl font-bold">{doc.data.title}</h1>
          <p className="text-sm text-muted-foreground">
            Phiên bản {doc.data.version}
            {doc.data.effectiveAt ? ` · hiệu lực từ ${new Date(doc.data.effectiveAt).toLocaleDateString('vi-VN')}` : ''}
          </p>
          <article className="whitespace-pre-line leading-7">{doc.data.content}</article>
        </>
      ) : null}
      </main>
      <SiteFooter />
    </div>
  )
}
