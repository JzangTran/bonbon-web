import { Navigate, useParams } from 'react-router'
import { NotFoundPage } from '@/pages/not-found'
import { DESIGN_LANGUAGE } from './content/design-language'
import { GET_STARTED } from './content/get-started'
import { UX } from './content/ux'
import { WEB_TOKENS } from './content/web-tokens'
import { BrandDocPage, type BrandDoc } from './doc'
import { groupPath, type BrandGroupKey } from './site'

const CONTENT: Partial<Record<BrandGroupKey, Record<string, BrandDoc>>> = {
  'get-started': GET_STARTED,
  'design-language': DESIGN_LANGUAGE,
  ux: UX,
  'web-tokens': WEB_TOKENS,
}

/** /bo-nhan-dien: the brand site opens on What's new. */
export function BrandHomePage() {
  return <Navigate to={groupPath('get-started')} replace />
}

/** /bo-nhan-dien/:group/:page, one page of the guidelines. */
export function BrandPage() {
  const { group, page } = useParams()
  const doc = CONTENT[group as BrandGroupKey]?.[page ?? '']
  if (!doc) return <NotFoundPage />
  return <BrandDocPage key={`${group}/${page}`} group={group as BrandGroupKey} slug={page!} doc={doc} />
}
