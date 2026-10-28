import { ComponentIcon, PaletteIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { DocsFrame, type DocsTab } from '@/shared/ui/docs-frame'

export const BRAND_PATH = '/bo-nhan-dien'
export const COMPONENTS_PATH = '/bo-nhan-dien/components'

const TABS: DocsTab[] = [
  { key: 'identity', label: 'Nhận diện', icon: PaletteIcon, to: BRAND_PATH },
  { key: 'components', label: 'Components', icon: ComponentIcon, to: COMPONENTS_PATH },
]

/** The brand site, laid out like the help center: the identity (logo, colours, type, rules) and the components, as tabs. */
export function BrandFrame({ tab, ...rest }: { tab: 'identity' | 'components'; sidebar?: ReactNode; aside?: ReactNode; children: ReactNode }) {
  return <DocsFrame label="Thương hiệu" tabs={TABS} tab={tab} {...rest} />
}

/** A section of a brand page: a heading the side menu and the headings list jump to, a line under it, then the samples. */
export function BrandSection({ id, title, intro, children }: { id: string; title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex scroll-mt-36 flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 id={id} className="text-h2 font-semibold">
          {title}
        </h2>
        <p className="text-body text-ink">{intro}</p>
      </div>
      {children}
    </section>
  )
}
