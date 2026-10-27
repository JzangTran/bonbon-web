import { BookOpenIcon, LayersIcon, LifeBuoyIcon, MapPinnedIcon, SettingsIcon, ShieldCheckIcon, StoreIcon, UsersIcon, WalletIcon, WorkflowIcon } from 'lucide-react'
import { WorkspaceShell, type ExtraPage, type FooterLink, type NavParent, type Space } from './workspace'
import { consolePath, siteUrl } from '@/shared/config/sites'

/** Operations: the day-to-day work on shops, money, quality and the people who ask for help. */
const OPERATIONS: NavParent[] = [
  {
    key: 'shops',
    label: 'Cửa hàng',
    icon: StoreIcon,
    children: [
      { to: consolePath('/shop-review'), label: 'Duyệt hồ sơ' },
      { to: consolePath('/merchants'), label: 'Danh sách và vùng phủ' },
    ],
  },
  {
    key: 'money',
    label: 'Tiền',
    icon: WalletIcon,
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
    children: [
      { to: consolePath('/order-cases'), label: 'Khiếu nại đơn hàng' },
      { to: consolePath('/penalties'), label: 'Điểm phạt các quán' },
      { to: consolePath('/reviews'), label: 'Kiểm duyệt đánh giá' },
    ],
  },
  {
    key: 'support',
    label: 'Hỗ trợ',
    icon: LifeBuoyIcon,
    children: [
      { to: consolePath('/support-tickets'), label: 'Phiếu hỗ trợ' },
      { to: consolePath('/lookup'), label: 'Tra cứu đơn và tài khoản' },
    ],
  },
]

const OPERATIONS_EXTRAS: ExtraPage[] = [
  { to: consolePath('/statistics'), label: 'Thống kê hệ thống' },
  { to: consolePath('/conversations'), label: 'Hội thoại', parentKey: 'support' },
]

/** Content: what customers and sellers read and choose from (categories, help articles, legal documents). */
const CONTENT: NavParent[] = [
  {
    key: 'catalog',
    label: 'Ngành hàng',
    icon: LayersIcon,
    children: [
      { to: consolePath('/categories'), label: 'Cây ngành hàng' },
      { to: consolePath('/category-moderation'), label: 'Món sai ngành' },
    ],
  },
  {
    key: 'documents',
    label: 'Tài liệu',
    icon: BookOpenIcon,
    children: [
      { to: consolePath('/help-articles'), label: 'Bài trợ giúp' },
      { to: consolePath('/legal-documents'), label: 'Văn bản pháp lý' },
    ],
  },
]

/** Settings: how the platform is set up and who may work in the console. */
const SETTINGS: NavParent[] = [
  {
    key: 'platform',
    label: 'Nền tảng',
    icon: MapPinnedIcon,
    children: [{ to: consolePath('/service-areas'), label: 'Khu vực phục vụ' }],
  },
  {
    key: 'access',
    label: 'Truy cập',
    icon: UsersIcon,
    children: [{ to: consolePath('/admins'), label: 'Quản trị viên' }],
  },
]

const SPACES: Space[] = [
  { key: 'operations', label: 'Vận hành', icon: WorkflowIcon, nav: OPERATIONS, extras: OPERATIONS_EXTRAS },
  { key: 'content', label: 'Nội dung', icon: BookOpenIcon, nav: CONTENT, extras: [{ to: consolePath('/help-articles/new'), label: 'Bài mới', under: consolePath('/help-articles') }] },
  { key: 'settings', label: 'Cài đặt', icon: SettingsIcon, nav: SETTINGS },
]

const FOOTER: FooterLink[] = [{ to: siteUrl('help', '/phap-ly/PRIVACY_POLICY'), label: 'Chính sách riêng tư', external: true }]

export function AdminLayout() {
  return <WorkspaceShell area="Quản trị" homePath={consolePath()} spaces={SPACES} footerLinks={FOOTER} loginPath={consolePath('/login')} />
}
