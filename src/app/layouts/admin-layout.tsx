import { BookOpenIcon, LayersIcon, LifeBuoyIcon, MapPinnedIcon, SettingsIcon, ShieldCheckIcon, StoreIcon, UsersIcon, WalletIcon, WorkflowIcon } from 'lucide-react'
import { WorkspaceShell, type ExtraPage, type FooterLink, type NavParent, type Space } from './workspace'
import { consolePath, siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/** Operations: the day-to-day work on shops, money, quality and the people who ask for help. */
const OPERATIONS: NavParent[] = [
  {
    key: 'shops',
    label: t('Cửa hàng'),
    icon: StoreIcon,
    children: [
      { to: consolePath('/shop-review'), label: t('Duyệt hồ sơ') },
      { to: consolePath('/merchants'), label: t('Danh sách và vùng phủ') },
    ],
  },
  {
    key: 'money',
    label: t('Tiền'),
    icon: WalletIcon,
    children: [
      { to: consolePath('/settlement'), label: t('Đối soát') },
      { to: consolePath('/commission'), label: t('Hoa hồng') },
      { to: consolePath('/refunds'), label: t('Hoàn tiền') },
    ],
  },
  {
    key: 'quality',
    label: t('Chất lượng'),
    icon: ShieldCheckIcon,
    children: [
      { to: consolePath('/order-cases'), label: t('Khiếu nại đơn hàng') },
      { to: consolePath('/penalties'), label: t('Điểm phạt các quán') },
      { to: consolePath('/reviews'), label: t('Kiểm duyệt đánh giá') },
    ],
  },
  {
    key: 'support',
    label: t('Hỗ trợ'),
    icon: LifeBuoyIcon,
    children: [
      { to: consolePath('/support-tickets'), label: t('Phiếu hỗ trợ') },
      { to: consolePath('/contact-requests'), label: t('Yêu cầu liên hệ') },
      { to: consolePath('/lookup'), label: t('Tra cứu đơn và tài khoản') },
    ],
  },
]

const OPERATIONS_EXTRAS: ExtraPage[] = [
  { to: consolePath('/statistics'), label: t('Thống kê hệ thống') },
  { to: consolePath('/conversations'), label: t('Hội thoại'), parentKey: 'support' },
]

/** Content: what customers and sellers read and choose from (categories, help articles, legal documents). */
const CONTENT: NavParent[] = [
  {
    key: 'catalog',
    label: t('Ngành hàng'),
    icon: LayersIcon,
    children: [
      { to: consolePath('/categories'), label: t('Cây ngành hàng') },
      { to: consolePath('/category-moderation'), label: t('Món sai ngành') },
    ],
  },
  {
    key: 'documents',
    label: t('Tài liệu'),
    icon: BookOpenIcon,
    children: [
      { to: consolePath('/help-articles'), label: t('Bài trợ giúp') },
      { to: consolePath('/legal-documents'), label: t('Văn bản pháp lý') },
    ],
  },
]

/** Settings: how the platform is set up and who may work in the console. */
const SETTINGS: NavParent[] = [
  {
    key: 'platform',
    label: t('Nền tảng'),
    icon: MapPinnedIcon,
    children: [{ to: consolePath('/service-areas'), label: t('Khu vực phục vụ') }],
  },
  {
    key: 'access',
    label: t('Truy cập'),
    icon: UsersIcon,
    children: [{ to: consolePath('/admins'), label: t('Quản trị viên') }],
  },
]

const SPACES: Space[] = [
  { key: 'operations', label: t('Vận hành'), icon: WorkflowIcon, nav: OPERATIONS, extras: OPERATIONS_EXTRAS },
  { key: 'content', label: t('Nội dung'), icon: BookOpenIcon, nav: CONTENT, extras: [{ to: consolePath('/help-articles/new'), label: t('Bài mới'), under: consolePath('/help-articles') }] },
  { key: 'settings', label: t('Cài đặt'), icon: SettingsIcon, nav: SETTINGS },
]

const FOOTER: FooterLink[] = [{ to: siteUrl('help', '/legal/PRIVACY_POLICY'), label: t('Chính sách riêng tư'), external: true }]

export function AdminLayout() {
  return <WorkspaceShell area={t('Quản trị')} homePath={consolePath()} spaces={SPACES} footerLinks={FOOTER} loginPath={consolePath('/login')} />
}
