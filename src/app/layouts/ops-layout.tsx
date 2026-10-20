import { ActivityIcon } from 'lucide-react'
import { WorkspaceShell, type FooterLink, type NavParent } from './workspace'
import { opsPath } from '@/shared/config/sites'

/** The infrastructure administrator's menu (ops.*): how the system is doing, and the settings an operator changes. */
const NAV: NavParent[] = [
  {
    key: 'system',
    label: 'Hệ thống',
    icon: ActivityIcon,
    defaultOpen: true,
    children: [
      { to: opsPath(), label: 'Tình trạng hệ thống' },
      { to: opsPath('/app-config'), label: 'Cấu hình app' },
    ],
  },
]

const FOOTER: FooterLink[] = [{ to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' }]

export function OpsLayout() {
  return <WorkspaceShell area="Vận hành" homePath={opsPath()} nav={NAV} footerLinks={FOOTER} loginPath={opsPath('/login')} storageKey="bonbon.nav.ops" />
}
