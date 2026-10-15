import { LayersIcon, LifeBuoyIcon, ShieldCheckIcon, SlidersHorizontalIcon, StoreIcon, WalletIcon } from 'lucide-react'
import { WorkspaceShell, type ExtraPage, type FooterLink, type NavParent } from './workspace'

/** The administrator's menu: Trang chủ is the breadcrumb root; groups start closed except the one with the current page. */
const NAV: NavParent[] = [
  {
    key: 'shops',
    label: 'Cửa hàng',
    icon: StoreIcon,
    defaultOpen: false,
    children: [
      { to: '/admin/shop-review', label: 'Duyệt hồ sơ' },
      { to: '/admin/merchants', label: 'Danh sách và vùng phủ' },
    ],
  },
  {
    key: 'money',
    label: 'Tiền',
    icon: WalletIcon,
    defaultOpen: false,
    children: [
      { to: '/admin/settlement', label: 'Đối soát' },
      { to: '/admin/commission', label: 'Hoa hồng' },
      { to: '/admin/refunds', label: 'Hoàn tiền' },
    ],
  },
  {
    key: 'quality',
    label: 'Chất lượng',
    icon: ShieldCheckIcon,
    defaultOpen: false,
    children: [
      { to: '/admin/order-cases', label: 'Khiếu nại đơn hàng' },
      { to: '/admin/penalties', label: 'Điểm phạt các quán' },
      { to: '/admin/reviews', label: 'Kiểm duyệt đánh giá' },
    ],
  },
  {
    key: 'content',
    label: 'Nội dung',
    icon: LayersIcon,
    defaultOpen: false,
    children: [
      { to: '/admin/categories', label: 'Ngành hàng' },
      { to: '/admin/category-moderation', label: 'Món sai ngành' },
    ],
  },
  {
    key: 'support',
    label: 'Hỗ trợ',
    icon: LifeBuoyIcon,
    defaultOpen: false,
    children: [
      { to: '/admin/support-tickets', label: 'Phiếu hỗ trợ' },
      { to: '/admin/lookup', label: 'Tra cứu đơn và tài khoản' },
      { to: '/admin/help-articles', label: 'Bài trợ giúp' },
    ],
  },
  {
    key: 'system',
    label: 'Hệ thống',
    icon: SlidersHorizontalIcon,
    defaultOpen: false,
    children: [
      { to: '/admin/admins', label: 'Quản trị viên' },
      { to: '/admin/legal-documents', label: 'Văn bản pháp lý' },
      { to: '/admin/app-config', label: 'Cấu hình app' },
    ],
  },
]

const EXTRAS: ExtraPage[] = [
  { to: '/admin/statistics', label: 'Thống kê hệ thống' },
  { to: '/admin/conversations', label: 'Hội thoại', parentKey: 'support' },
]

const FOOTER: FooterLink[] = [
  { to: '/legal/PRIVACY_POLICY', label: 'Chính sách riêng tư' },
]

export function AdminLayout() {
  return (
    <WorkspaceShell area="Quản trị" homePath="/admin" nav={NAV} extras={EXTRAS} footerLinks={FOOTER} loginPath="/admin/login" storageKey="bonbon.nav.admin" />
  )
}
