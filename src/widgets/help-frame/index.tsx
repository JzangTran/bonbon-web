import { BookOpenIcon, LifeBuoyIcon, ScaleIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { helpPath } from '@/shared/config/sites'
import { DocsFrame, DocsRail, type DocsNavGroup, type DocsTab } from '@/shared/ui/docs-frame'
import { t } from '@/shared/i18n'

export type HelpTab = 'help' | 'contact' | 'legal'
export type HelpNavGroup = DocsNavGroup

const TABS: DocsTab[] = [
  { key: 'help', label: t('Trung tâm trợ giúp'), icon: BookOpenIcon, to: helpPath() },
  { key: 'contact', label: t('Liên hệ hỗ trợ'), icon: LifeBuoyIcon, to: helpPath('/lien-he') },
  { key: 'legal', label: t('Pháp lý'), icon: ScaleIcon, to: helpPath('/phap-ly') },
]

export function HelpSidebar({ groups, current }: { groups: HelpNavGroup[]; current?: string }) {
  return <DocsRail groups={groups} current={current} />
}

/** The help site, shared by customers, sellers and administrators: help center, contact and legal documents as tabs. */
export function HelpFrame({ tab, ...rest }: { tab: HelpTab; sidebar?: ReactNode; aside?: ReactNode; wide?: boolean; children: ReactNode }) {
  return <DocsFrame label={t('Trợ giúp')} tabs={TABS} tab={tab} {...rest} />
}
