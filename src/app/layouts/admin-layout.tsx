import { LayersIcon, LifeBuoyIcon, ShieldCheckIcon, SlidersHorizontalIcon, StoreIcon, WalletIcon } from 'lucide-react'
import { WorkspaceShell, type ExtraPage, type FooterLink, type NavParent } from './workspace'
import { consolePath } from '@/shared/config/sites'

/** The administrator's menu: Trang chủ is the breadcrumb root; groups start closed except the one with the current page. */
const NAV: NavParent[] = [
  {
    key: 'shops',
    label: 'Cửa hàng',
    icon: StoreIcon,
    defaultOpen: false,
    children: [
      { to: consolePath('/shop-review'), label: 'Duyệt hồ sơ' },
      { to: consolePath('/service-areas'), label: 'Khu vực phục vụ' },
      { to: consolePath('/merchants'), label: 'Danh sách và vùng phủ' },
    ],
  },
  {
    key: 'money',
    label: 'Tiền',
    icon: WalletIcon,
    defaultOpen: false,
    children: [
      { to: consolePath('/settlement'), label: 'Đối soát' },
      { to: consolePath('/commission'), label: 'Hoa hồng' },
      { to: consolePath('/refunds'), label: 'Hoàn tiền' },
    ],
  },
  {
    key: 'quality',
    label: 'Chất lượng',
    icon: ShieldCheckIcon,
    defaultOpen: false,
    children: [
      { to: consolePath('/order-cases'), label: 'Khiếu nại đơn hàng' },
      { to: consolePath('/penalties'), label: 'Điểm phạt các quán' },
      { to: consolePath('/reviews'), label: 'Kiểm duyệt đánh giá' },
    ],
  },
  {
    key: 'content',
    label: 'Nội dung',
    icon: LayersIcon,
    defaultOpen: false,
    children: [
      { to: consolePath('/categories'), label: 'Ngành hàng' },
      { to: consolePath('/category-moderation'), label: 'Món sai ngành' },
    ],
  },
  {
    key: 'support',
    label: 'Hỗ trợ',
    icon: LifeBuoyIcon,
    defaultOpen: false,
    children: [
      { to: consolePath('/support-tickets'), label: 'Phiếu hỗ trợ' },
      { to: consolePath('/lookup'), label: 'Tra cứu đơn và tài khoản' },
      { to: consolePath('/help-articles'), label: 'Bài trợ giúp' },
    ],
  },
  {
    key: 'system',
    label: 'Hệ thống',
    icon: SlidersHorizontalIcon,
    defaultOpen: false,
    children: [
      { to: consolePath('/admins'), label: 'Quản trị viên' },
      { to: consolePath('/legal-documents'), label: 'Văn bản pháp lý' },
    ],
  },
]

const EXTRAS: ExtraPage[] = [
  { to: consolePath('/statistics'), label: 'Thống kê hệ thống' },
  { to: consolePath('/conversations'), label: 'Hội thoại', parentKey: 'support' },
]

const FOOTER: FooterLink[] = [
  { to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' },
]

export function AdminLayout() {
  return (
    <WorkspaceShell area="Quản trị" homePath={consolePath()} nav={NAV} extras={EXTRAS} footerLinks={FOOTER} loginPath={consolePath('/login')} />
  )
}
