import { LayersIcon, LifeBuoyIcon, ShieldCheckIcon, SlidersHorizontalIcon, StoreIcon, WalletIcon } from 'lucide-react'
import { WorkspaceShell, type ExtraPage, type FooterLink, type NavParent } from './workspace'
import { adminPath } from '@/shared/config/sites'

/** The administrator's menu: Trang chủ is the breadcrumb root; groups start closed except the one with the current page. */
const NAV: NavParent[] = [
  {
    key: 'shops',
    label: 'Cửa hàng',
    icon: StoreIcon,
    defaultOpen: false,
    children: [
      { to: adminPath('/shop-review'), label: 'Duyệt hồ sơ' },
      { to: adminPath('/service-areas'), label: 'Khu vực phục vụ' },
      { to: adminPath('/merchants'), label: 'Danh sách và vùng phủ' },
    ],
  },
  {
    key: 'money',
    label: 'Tiền',
    icon: WalletIcon,
    defaultOpen: false,
    children: [
      { to: adminPath('/settlement'), label: 'Đối soát' },
      { to: adminPath('/commission'), label: 'Hoa hồng' },
      { to: adminPath('/refunds'), label: 'Hoàn tiền' },
    ],
  },
  {
    key: 'quality',
    label: 'Chất lượng',
    icon: ShieldCheckIcon,
    defaultOpen: false,
    children: [
      { to: adminPath('/order-cases'), label: 'Khiếu nại đơn hàng' },
      { to: adminPath('/penalties'), label: 'Điểm phạt các quán' },
      { to: adminPath('/reviews'), label: 'Kiểm duyệt đánh giá' },
    ],
  },
  {
    key: 'content',
    label: 'Nội dung',
    icon: LayersIcon,
    defaultOpen: false,
    children: [
      { to: adminPath('/categories'), label: 'Ngành hàng' },
      { to: adminPath('/category-moderation'), label: 'Món sai ngành' },
    ],
  },
  {
    key: 'support',
    label: 'Hỗ trợ',
    icon: LifeBuoyIcon,
    defaultOpen: false,
    children: [
      { to: adminPath('/support-tickets'), label: 'Phiếu hỗ trợ' },
      { to: adminPath('/lookup'), label: 'Tra cứu đơn và tài khoản' },
      { to: adminPath('/help-articles'), label: 'Bài trợ giúp' },
    ],
  },
  {
    key: 'system',
    label: 'Hệ thống',
    icon: SlidersHorizontalIcon,
    defaultOpen: false,
    children: [
      { to: adminPath('/admins'), label: 'Quản trị viên' },
      { to: adminPath('/legal-documents'), label: 'Văn bản pháp lý' },
      { to: adminPath('/app-config'), label: 'Cấu hình app' },
    ],
  },
]

const EXTRAS: ExtraPage[] = [
  { to: adminPath('/statistics'), label: 'Thống kê hệ thống' },
  { to: adminPath('/conversations'), label: 'Hội thoại', parentKey: 'support' },
]

const FOOTER: FooterLink[] = [
  { to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' },
]

export function AdminLayout() {
  return (
    <WorkspaceShell area="Quản trị" homePath={adminPath()} nav={NAV} extras={EXTRAS} footerLinks={FOOTER} loginPath={adminPath('/login')} storageKey="bonbon.nav.admin" />
  )
}
