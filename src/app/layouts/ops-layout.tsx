import { t } from '@/shared/i18n'
import { ActivityIcon } from 'lucide-react'
import { WorkspaceShell, type FooterLink, type NavParent } from './workspace'
import { opsPath, siteUrl } from '@/shared/config/sites'

/** The infrastructure administrator's menu (ops.*): how the system is doing, and the settings an operator changes. */
const NAV: NavParent[] = [
  {
    key: 'system',
    label: t('Hệ thống'),
    icon: ActivityIcon,
    defaultOpen: true,
    children: [
      { to: opsPath(), label: t('Tình trạng hệ thống') },
      { to: opsPath('/app-config'), label: t('Cấu hình app') },
    ],
  },
]

const FOOTER: FooterLink[] = [{ to: siteUrl('help', '/legal/PRIVACY_POLICY'), label: t('Chính sách riêng tư'), external: true }]

export function OpsLayout() {
  return <WorkspaceShell area={t('Vận hành')} homePath={opsPath()} spaces={[{ key: 'ops', label: t('Vận hành'), icon: ActivityIcon, nav: NAV }]} footerLinks={FOOTER} loginPath={opsPath('/login')} />
}
