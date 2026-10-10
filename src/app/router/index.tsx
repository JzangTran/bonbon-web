import { AlertTriangleIcon, LifeBuoyIcon, SettingsIcon, ShieldCheckIcon, StoreIcon, WalletIcon } from 'lucide-react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AreaLayout, type NavGroup } from '@/app/layouts/area-layout'
import { SellerLayout } from '@/app/layouts/seller-layout'
import { RequireRole } from './require-role'

const adminNav: NavGroup[] = [
  { items: [{ to: '/admin', label: 'Tổng quan' }] },
  { title: 'Cửa hàng', icon: <StoreIcon />, items: [{ to: '/admin/shop-review', label: 'Duyệt cửa hàng' }] },
  {
    title: 'Tiền',
    icon: <WalletIcon />,
    items: [
      { to: '/admin/settlement', label: 'Đối soát' },
      { to: '/admin/commission', label: 'Hoa hồng' },
      { to: '/admin/refunds', label: 'Hoàn tiền' },
    ],
  },
  { title: 'Chất lượng', icon: <AlertTriangleIcon />, items: [{ to: '/admin/order-cases', label: 'Khiếu nại đơn hàng' }, { to: '/admin/penalties', label: 'Điểm phạt các quán' }] },
  { title: 'Nội dung', icon: <ShieldCheckIcon />, items: [{ to: '/admin/reviews', label: 'Kiểm duyệt đánh giá' }, { to: '/admin/categories', label: 'Ngành hàng' }] },
  { title: 'Hỗ trợ', icon: <LifeBuoyIcon />, items: [{ to: '/admin/support-tickets', label: 'Phiếu hỗ trợ' }, { to: '/admin/lookup', label: 'Tra cứu đơn & tài khoản' }, { to: '/admin/help-articles', label: 'Bài trợ giúp' }] },
  { title: 'Hệ thống', icon: <SettingsIcon />, items: [{ to: '/admin/admins', label: 'Quản trị viên' }] },
]

const router = createBrowserRouter([
  {
    path: '/',
    lazy: () => import('@/pages/landing').then((m) => ({ Component: m.LandingPage })),
  },
  {
    path: '/seller/login',
    lazy: () => import('@/pages/auth/seller-login').then((m) => ({ Component: m.SellerLoginPage })),
  },
  {
    path: '/admin/login',
    lazy: () => import('@/pages/auth/admin-login').then((m) => ({ Component: m.AdminLoginPage })),
  },
  {
    path: '/seller/register',
    lazy: () => import('@/pages/auth/seller-register').then((m) => ({ Component: m.SellerRegisterPage })),
  },
  {
    path: '/verify-email',
    lazy: () => import('@/pages/auth/verify-email').then((m) => ({ Component: m.VerifyEmailPage })),
  },
  {
    path: '/forgot-password',
    lazy: () => import('@/pages/auth/forgot-password').then((m) => ({ Component: m.ForgotPasswordPage })),
  },
  {
    path: '/reset-password',
    lazy: () => import('@/pages/auth/reset-password').then((m) => ({ Component: () => <m.SetPasswordPage mode="reset" /> })),
  },
  {
    path: '/set-password',
    lazy: () => import('@/pages/auth/reset-password').then((m) => ({ Component: () => <m.SetPasswordPage mode="initial" /> })),
  },
  {
    path: '/payment/return',
    lazy: () => import('@/pages/payment-return').then((m) => ({ Component: m.PaymentReturnPage })),
  },
  {
    path: '/captcha-bridge',
    lazy: () => import('@/pages/captcha-bridge').then((m) => ({ Component: m.CaptchaBridgePage })),
  },
  {
    path: '/legal/:type',
    lazy: () => import('@/pages/legal-document').then((m) => ({ Component: m.LegalDocumentPage })),
  },
  {
    element: <RequireRole role="SELLER" loginPath="/seller/login" />,
    children: [
      {
        path: '/seller',
        element: <SellerLayout />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/seller/dashboard').then((m) => ({ Component: m.SellerDashboardPage })),
          },
          {
            path: 'account',
            lazy: () => import('@/pages/seller/account').then((m) => ({ Component: m.SellerAccountPage })),
          },
          {
            path: 'shop',
            lazy: () => import('@/pages/seller/shop').then((m) => ({ Component: m.SellerShopPage })),
          },
          {
            path: 'orders',
            lazy: () => import('@/pages/seller/orders').then((m) => ({ Component: m.SellerOrdersPage })),
          },
          {
            path: 'statistics',
            lazy: () => import('@/pages/seller/statistics').then((m) => ({ Component: m.SellerStatisticsPage })),
          },
          {
            path: 'performance',
            lazy: () => import('@/pages/seller/performance').then((m) => ({ Component: m.SellerPerformancePage })),
          },
          {
            path: 'order-cases',
            lazy: () => import('@/pages/seller/order-cases').then((m) => ({ Component: m.SellerOrderCasesPage })),
          },
          {
            path: 'order-cases/:id',
            lazy: () => import('@/pages/seller/order-case-detail').then((m) => ({ Component: m.SellerOrderCaseDetailPage })),
          },
          {
            path: 'chat',
            lazy: () => import('@/pages/seller/chat').then((m) => ({ Component: m.SellerChatPage })),
          },
          {
            path: 'help',
            lazy: () => import('@/pages/seller/help').then((m) => ({ Component: m.SellerHelpPage })),
          },
          {
            path: 'support-tickets',
            lazy: () => import('@/pages/seller/support-tickets').then((m) => ({ Component: m.SellerSupportTicketsPage })),
          },
          {
            path: 'support-tickets/:id',
            lazy: () => import('@/pages/seller/support-ticket-detail').then((m) => ({ Component: m.SellerSupportTicketDetailPage })),
          },
          {
            path: 'notification-settings',
            lazy: () => import('@/pages/seller/notification-settings').then((m) => ({ Component: m.SellerNotificationSettingsPage })),
          },
          {
            path: 'earnings',
            lazy: () => import('@/pages/seller/earnings').then((m) => ({ Component: m.SellerEarningsPage })),
          },
          {
            path: 'reviews',
            lazy: () => import('@/pages/seller/reviews').then((m) => ({ Component: m.SellerReviewsPage })),
          },
          {
            path: 'menu',
            lazy: () => import('@/pages/seller/menu').then((m) => ({ Component: m.SellerMenuPage })),
          },
          {
            path: 'open-shop',
            lazy: () => import('@/pages/seller/open-shop').then((m) => ({ Component: m.OpenShopPage })),
          },
        ],
      },
    ],
  },
  {
    element: <RequireRole role="ADMIN" loginPath="/admin/login" />,
    children: [
      {
        path: '/admin',
        element: <AreaLayout title="Quản trị" nav={adminNav} loginPath="/admin/login" tone="dark" />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/admin/dashboard').then((m) => ({ Component: m.AdminDashboardPage })),
          },
          {
            path: 'shop-review',
            lazy: () => import('@/pages/admin/shop-review').then((m) => ({ Component: m.ShopReviewQueuePage })),
          },
          {
            path: 'shop-review/:vendorId',
            lazy: () => import('@/pages/admin/shop-review-detail').then((m) => ({ Component: m.ShopReviewDetailPage })),
          },
          {
            path: 'settlement',
            lazy: () => import('@/pages/admin/settlement').then((m) => ({ Component: m.AdminSettlementPage })),
          },
          {
            path: 'settlement/:vendorId',
            lazy: () => import('@/pages/admin/settlement-shop').then((m) => ({ Component: m.AdminSettlementShopPage })),
          },
          {
            path: 'commission',
            lazy: () => import('@/pages/admin/commission').then((m) => ({ Component: m.AdminCommissionPage })),
          },
          {
            path: 'support-tickets',
            lazy: () => import('@/pages/admin/support-tickets').then((m) => ({ Component: m.AdminSupportTicketsPage })),
          },
          {
            path: 'support-tickets/:id',
            lazy: () => import('@/pages/admin/support-ticket-detail').then((m) => ({ Component: m.AdminSupportTicketDetailPage })),
          },
          {
            path: 'lookup',
            lazy: () => import('@/pages/admin/lookup').then((m) => ({ Component: m.AdminLookupPage })),
          },
          {
            path: 'lookup/orders/:id',
            lazy: () => import('@/pages/admin/lookup-order').then((m) => ({ Component: m.AdminLookupOrderPage })),
          },
          {
            path: 'lookup/customers/:id',
            lazy: () => import('@/pages/admin/lookup-customer').then((m) => ({ Component: m.AdminLookupCustomerPage })),
          },
          {
            path: 'conversations/:id',
            lazy: () => import('@/pages/admin/conversation').then((m) => ({ Component: m.AdminConversationPage })),
          },
          {
            path: 'help-articles',
            lazy: () => import('@/pages/admin/help-articles').then((m) => ({ Component: m.AdminHelpArticlesPage })),
          },
          {
            path: 'penalties',
            lazy: () => import('@/pages/admin/penalties').then((m) => ({ Component: m.AdminPenaltiesPage })),
          },
          {
            path: 'penalties/:vendorId',
            lazy: () => import('@/pages/admin/penalty-shop').then((m) => ({ Component: m.AdminPenaltyShopPage })),
          },
          {
            path: 'order-cases',
            lazy: () => import('@/pages/admin/order-cases').then((m) => ({ Component: m.AdminOrderCasesPage })),
          },
          {
            path: 'order-cases/:id',
            lazy: () => import('@/pages/admin/order-case-detail').then((m) => ({ Component: m.AdminOrderCaseDetailPage })),
          },
          {
            path: 'refunds',
            lazy: () => import('@/pages/admin/refunds').then((m) => ({ Component: m.AdminRefundsPage })),
          },
          {
            path: 'reviews',
            lazy: () => import('@/pages/admin/reviews').then((m) => ({ Component: m.AdminReviewsPage })),
          },
          {
            path: 'categories',
            lazy: () => import('@/pages/admin/categories').then((m) => ({ Component: m.AdminCategoriesPage })),
          },
          {
            path: 'admins',
            lazy: () => import('@/pages/admin/admins').then((m) => ({ Component: m.AdminsPage })),
          },
        ],
      },
    ],
  },
  ...(import.meta.env.DEV
    ? [{ path: '/dev/ui', lazy: () => import('@/pages/dev/ui-kit').then((m) => ({ Component: m.UiKitPage })) }]
    : []),
  {
    path: '*',
    lazy: () => import('@/pages/not-found').then((m) => ({ Component: m.NotFoundPage })),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
