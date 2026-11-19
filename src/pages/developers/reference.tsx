import { useQuery } from '@tanstack/react-query'
import { ChevronRightIcon, DownloadIcon, LockIcon, SearchIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSession } from '@/entities/session'
import { OPENAPI_URL } from '@/shared/config/env'
import { developersPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type Param = { name: string; in: string; required?: boolean; description?: string; schema?: { type?: string; format?: string; enum?: string[] } }
type Response = { description?: string; content?: Record<string, { schema?: { $ref?: string } }> }
type Operation = {
  operationId?: string
  tags?: string[]
  summary?: string
  description?: string
  parameters?: Param[]
  requestBody?: { content?: Record<string, { schema?: { $ref?: string; type?: string } }> }
  responses?: Record<string, Response>
  security?: unknown[]
}
type Spec = {
  info?: { title?: string; version?: string; description?: string }
  servers?: { url: string }[]
  tags?: { name: string; description?: string }[]
  'x-tagGroups'?: { name: string; tags: string[] }[]
  paths: Record<string, Record<string, Operation>>
}
type Endpoint = Operation & { method: string; path: string }

const METHODS = ['get', 'post', 'put', 'patch', 'delete']
const METHOD_TONE: Record<string, string> = {
  get: 'bg-success-subtle text-success-fg',
  post: 'bg-accent text-accent-foreground',
  put: 'bg-warning-subtle text-warning-fg',
  patch: 'bg-warning-subtle text-warning-fg',
  delete: 'bg-danger-subtle text-danger-fg',
}
const refName = (ref?: string) => (ref ? ref.split('/').pop() : undefined)
/** The descriptions are Markdown; shown as plain text, so the emphasis marks go. */
const plain = (text?: string) => text?.replace(/\*\*/g, '')

/**
 * The API reference for an approved developer: every endpoint grouped as the backend groups them, searchable by path, summary or
 * operation id, each with its parameters, body and every answer it can give (the business error codes included). The document is
 * read with the developer's token; nobody else gets it.
 */
export function DeveloperReferencePage() {
  const { session, signOut } = useSession()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const spec = useQuery({
    queryKey: ['developers', 'openapi', session?.accessToken ? 'signed-in' : 'anonymous'],
    enabled: !!session,
    staleTime: Infinity,
    queryFn: async () => {
      const response = await fetch(OPENAPI_URL, { headers: { Authorization: `Bearer ${session?.accessToken ?? ''}` }, credentials: 'include' })
      if (!response.ok) throw new Error(String(response.status))
      return (await response.json()) as Spec
    },
  })

  const endpoints = useMemo<Endpoint[]>(() => {
    if (!spec.data) return []
    const out: Endpoint[] = []
    for (const [path, ops] of Object.entries(spec.data.paths)) {
      for (const m of METHODS) if (ops[m]) out.push({ ...ops[m], method: m, path })
    }
    return out
  }, [spec.data])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const shown = endpoints.filter((e) => !q || `${e.method} ${e.path} ${e.summary ?? ''} ${e.operationId ?? ''}`.toLowerCase().includes(q))
    const byTag = new Map<string, Endpoint[]>()
    for (const e of shown) {
      const tag = e.tags?.[0] ?? t('Khác')
      byTag.set(tag, [...(byTag.get(tag) ?? []), e])
    }
    const order = spec.data?.['x-tagGroups']?.flatMap((g) => g.tags) ?? spec.data?.tags?.map((tg) => tg.name) ?? []
    return [...byTag.entries()].sort(([a], [b]) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999))
  }, [endpoints, query, spec.data])

  const download = () => {
    if (!spec.data) return
    const url = URL.createObjectURL(new Blob([JSON.stringify(spec.data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'bonbon-openapi.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const baseUrl = spec.data?.servers?.[0]?.url ?? window.location.origin

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-small font-medium text-primary">{t('bonbon dành cho lập trình viên')}</p>
          <h1 className="text-title-1">{spec.data?.info?.title ?? t('Tài liệu API')}</h1>
          <p className="text-body-sm text-muted-foreground">
            {t('Địa chỉ gốc')}: <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-caption">{baseUrl}</code>
            {spec.data ? ` · ${endpoints.length} endpoint` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={download} disabled={!spec.data}>
            <DownloadIcon className="size-4" aria-hidden="true" />
            OpenAPI JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={() => void signOut().then(() => window.location.assign(developersPath()))}>
            {t('Đăng xuất')}
          </Button>
        </div>
      </header>

      {spec.isPending ? <Skeleton className="h-64" /> : null}
      {spec.isError ? (
        <FormError message={spec.error.message === '403' || spec.error.message === '401' ? t('Tài khoản chưa được cấp quyền đọc tài liệu API, hoặc quyền đã bị thu hồi.') : t('Không tải được tài liệu API.')} />
      ) : null}

      {spec.data ? (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <nav aria-label={t('Nhóm endpoint')} className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Tìm đường dẫn, mô tả…')} className="pl-9" aria-label={t('Tìm endpoint')} />
            </div>
            <ul className="hidden max-h-[70vh] flex-col overflow-y-auto text-body-sm lg:flex">
              {groups.map(([tag, list]) => (
                <li key={tag}>
                  <a href={`#tag-${encodeURIComponent(tag)}`} className="flex justify-between gap-2 rounded-sm px-2 py-1 hover:bg-muted">
                    <span className="truncate">{tag}</span>
                    <span className="text-caption text-muted-foreground">{list.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex min-w-0 flex-col gap-8">
            {groups.length === 0 ? <p className="text-body-sm text-muted-foreground">{t('Không có endpoint khớp với tìm kiếm.')}</p> : null}
            {groups.map(([tag, list]) => (
              <section key={tag} id={`tag-${encodeURIComponent(tag)}`} className="flex flex-col gap-2 scroll-mt-6">
                <h2 className="text-title-3">{tag}</h2>
                {spec.data?.tags?.find((tg) => tg.name === tag)?.description ? (
                  <p className="text-body-sm text-muted-foreground">{spec.data.tags.find((tg) => tg.name === tag)?.description}</p>
                ) : null}
                <ul className="flex flex-col divide-y rounded-sm border bg-card">
                  {list.map((e) => {
                    const key = `${e.method} ${e.path}`
                    const expanded = open === key
                    return (
                      <li key={key}>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setOpen(expanded ? null : key)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/60"
                        >
                          <span className={cn('w-16 shrink-0 rounded-sm px-1.5 py-0.5 text-center font-mono text-caption font-semibold', METHOD_TONE[e.method])}>
                            {e.method}
                          </span>
                          <code className="min-w-0 truncate font-mono text-body-sm">{e.path}</code>
                          <span className="ml-auto hidden truncate text-body-sm text-muted-foreground md:inline">{e.summary}</span>
                          {e.security?.length ? <LockIcon className="size-3.5 shrink-0 text-muted-foreground" aria-label={t('Cần đăng nhập')} /> : null}
                          <ChevronRightIcon className={cn('size-4 shrink-0 transition-transform', expanded && 'rotate-90')} aria-hidden="true" />
                        </button>
                        {expanded ? <EndpointDetail e={e} /> : null}
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function EndpointDetail({ e }: { e: Endpoint }) {
  const body = e.requestBody?.content ? Object.entries(e.requestBody.content)[0] : undefined
  return (
    <div className="flex flex-col gap-4 border-t bg-background px-4 py-4 text-body-sm">
      {e.summary ? <p className="font-medium">{e.summary}</p> : null}
      {e.description ? <p className="whitespace-pre-line text-muted-foreground">{plain(e.description)}</p> : null}
      {e.operationId ? (
        <p className="text-caption text-muted-foreground">
          operationId: <code className="font-mono">{e.operationId}</code>
        </p>
      ) : null}
      {e.parameters?.length ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-caption font-semibold tracking-wide text-muted-foreground">{t('Tham số')}</h3>
          <table className="w-full text-left text-body-sm">
            <tbody className="divide-y">
              {e.parameters.map((p) => (
                <tr key={`${p.in}-${p.name}`}>
                  <td className="py-1.5 pr-3 align-top">
                    <code className="font-mono">{p.name}</code>
                    {p.required ? <span className="ml-1 text-destructive">*</span> : null}
                  </td>
                  <td className="py-1.5 pr-3 align-top text-caption text-muted-foreground">
                    {p.in} · {p.schema?.enum ? p.schema.enum.join(' | ') : (p.schema?.format ?? p.schema?.type ?? '')}
                  </td>
                  <td className="py-1.5 align-top text-muted-foreground">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {body ? (
        <div className="flex flex-col gap-1">
          <h3 className="text-caption font-semibold tracking-wide text-muted-foreground">{t('Nội dung gửi')}</h3>
          <p>
            <code className="font-mono">{body[0]}</code>
            {refName(body[1].schema?.$ref) ? <> · {t('lược đồ')} <code className="font-mono">{refName(body[1].schema?.$ref)}</code></> : null}
          </p>
        </div>
      ) : null}
      {e.responses ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-caption font-semibold tracking-wide text-muted-foreground">{t('Phản hồi')}</h3>
          <ul className="flex flex-col gap-1.5">
            {Object.entries(e.responses).map(([code, r]) => (
              <li key={code} className="flex gap-3">
                <code className={cn('w-10 shrink-0 font-mono font-semibold', code.startsWith('2') ? 'text-success-fg' : 'text-danger-fg')}>{code}</code>
                <span className="whitespace-pre-line text-muted-foreground">
                  {plain(r.description)}
                  {refName(Object.values(r.content ?? {})[0]?.schema?.$ref) ? ` · ${refName(Object.values(r.content ?? {})[0]?.schema?.$ref)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
