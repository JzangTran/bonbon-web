import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AdminLayout } from '@/app/layouts/admin-layout'
import { OpsLayout } from '@/app/layouts/ops-layout'
import { SellerLayout } from '@/app/layouts/seller-layout'
import { RequireRole } from './require-role'
import { RouteError } from './route-error'
import { PATH_MODE, SITE, consolePath, helpPath, merchantPath, opsPath } from '@/shared/config/sites'

// One build, five hosts (see shared/config/sites.ts): each host gets its own pages, and the shared ones (email links, legal texts,
// payment return) work on all of them. Without subdomains (development, previews) every page lives on the one host.
const showLanding = SITE === 'public'
const showMerchant = SITE === 'merchant' || PATH_MODE
const showHelp = SITE === 'help' || PATH_MODE
const showConsole = SITE === 'console' || PATH_MODE
const showOps = SITE === 'ops' || PATH_MODE

const router = createBrowserRouter([
  ...(showLanding ? [
  {
    path: '/',
    lazy: () => import('@/pages/landing').then((m) => ({ Component: m.LandingPage })),
  },
  ] : []),
  // Guides, blog and brand kit: pages of the public site only.
  ...(showLanding ? [
    { path: '/huong-dan', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: m.GuideStartRedirect })) },
    { path: '/huong-dan/bat-dau', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: m.GuideStartRedirect })) },
    { path: '/huong-dan/bat-dau/:slug', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: () => <m.ArticlePage collection="bat-dau" /> })) },
    { path: '/huong-dan/quan-ly-cua-hang', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: m.ManageHubPage })) },
    { path: '/huong-dan/quan-ly-cua-hang/:slug', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: () => <m.ArticlePage collection="quan-ly-cua-hang" /> })) },
    { path: '/blog', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: m.BlogHubPage })) },
    { path: '/nha-phat-trien', lazy: () => import('@/pages/content/developers').then((m) => ({ Component: m.DevelopersPage })) },
    { path: '/blog/:slug', lazy: () => import('@/pages/content/pages').then((m) => ({ Component: () => <m.ArticlePage collection="blog" /> })) },
    { path: '/bo-nhan-dien', lazy: () => import('@/pages/brand-kit').then((m) => ({ Component: m.BrandKitPage })) },
  ] : []),
  // The help center: its own host, /help in development.
  ...(showHelp ? [
    { path: helpPath(), lazy: () => import('@/pages/content/help-center').then((m) => ({ Component: m.HelpCenterPage })) },
    { path: helpPath('/bai-viet/:id'), lazy: () => import('@/pages/content/help-center').then((m) => ({ Component: m.HelpArticlePage })) },
    { path: helpPath('/lien-he'), lazy: () => import('@/pages/content/help-center').then((m) => ({ Component: m.ContactPage })) },
    { path: helpPath('/phap-ly'), lazy: () => import('@/pages/content/help-center').then((m) => ({ Component: m.LegalIndexRedirect })) },
    { path: helpPath('/phap-ly/:type'), lazy: () => import('@/pages/content/help-center').then((m) => ({ Component: m.LegalPage })) },
  ] : []),
  ...(showMerchant ? [
  {
    path: merchantPath('/login'),
    lazy: () => import('@/pages/auth/seller-login').then((m) => ({ Component: m.SellerLoginPage })),
  },
  ] : []),
  ...(showConsole ? [
  {
    path: consolePath('/login'),
    lazy: () => import('@/pages/auth/admin-login').then((m) => ({ Component: () => <m.AdminLoginPage area="console" /> })),
  },
  ] : []),
  ...(showOps ? [
  {
    path: opsPath('/login'),
    lazy: () => import('@/pages/auth/admin-login').then((m) => ({ Component: () => <m.AdminLoginPage area="ops" /> })),
  },
  ] : []),
  ...(showMerchant ? [
  {
    path: merchantPath('/register'),
    lazy: () => import('@/pages/auth/seller-register').then((m) => ({ Component: m.SellerRegisterPage })),
  },
  ] : []),
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
    // Old address of the legal documents: they live on the help site now.
    path: '/legal/:type',
    lazy: () => import('@/pages/content/redirects').then((m) => ({ Component: m.LegacyLegalRedirect })),
  },
  ...(showMerchant ? [
  {
    // Tasks that need the person's whole attention: a page of their own, no workspace around them.
    element: <RequireRole role="SELLER" loginPath={merchantPath('/login')} />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/focus/open-shop',
        lazy: () => import('@/pages/seller/open-shop').then((m) => ({ Component: m.OpenShopFocusPage })),
      },
      {
        path: '/focus/close-shop',
        lazy: () => import('@/pages/seller/close-shop').then((m) => ({ Component: m.CloseShopPage })),
      },
      {
        path: '/focus/delete-account',
        lazy: () => import('@/pages/seller/delete-account').then((m) => ({ Component: m.SellerDeleteAccountPage })),
      },
    ],
  },
  {
    element: <RequireRole role="SELLER" loginPath={merchantPath('/login')} />,
    children: [
      {
        path: merchantPath(),
        element: <SellerLayout />,
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/seller/dashboard').then((m) => ({ Component: m.SellerDashboardPage })),
          },
          {
            path: 'closing',
            lazy: () => import('@/pages/seller/closing').then((m) => ({ Component: m.SellerClosingPage })),
          },
          {
            path: 'category-cases',
            lazy: () => import('@/pages/seller/category-cases').then((m) => ({ Component: m.SellerCategoryCasesPage })),
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
            path: 'orders/cancelled',
            lazy: () => import('@/pages/seller/orders').then((m) => ({ Component: m.SellerCancelledOrdersPage })),
          },
          {
            path: 'shipping',
            lazy: () => import('@/pages/seller/shipping').then((m) => ({ Component: m.SellerShippingPage })),
          },
          {
            path: 'bank-account',
            lazy: () => import('@/pages/seller/bank-account').then((m) => ({ Component: m.SellerBankAccountPage })),
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
            // The help center is shared by everyone on the help site.
            path: 'help',
            lazy: () => import('@/pages/content/redirects').then((m) => ({ Component: m.HelpSiteRedirect })),
          },
          {
            path: 'support-tickets',
            lazy: () => import('@/pages/seller/support-tickets').then((m) => ({ Component: m.SellerSupportTicketsPage })),
          },
          {
            path: 'support-tickets/new',
            lazy: () => import('@/pages/seller/support-tickets').then((m) => ({ Component: m.SellerNewTicketPage })),
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
            path: 'menu/options',
            lazy: () => import('@/pages/seller/menu').then((m) => ({ Component: m.SellerOptionGroupsPage })),
          },
          {
            path: 'menu/new',
            lazy: () => import('@/pages/seller/menu').then((m) => ({ Component: m.SellerAddDishPage })),
          },
          {
            path: 'open-shop',
            element: <Navigate to="/focus/open-shop" replace />,
          },
        ],
      },
    ],
  },
  ] : []),
  ...(showOps ? [
  {
    element: <RequireRole role="ADMIN" loginPath={opsPath('/login')} />,
    children: [
      {
        path: opsPath(),
        element: <OpsLayout />,
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/ops/status').then((m) => ({ Component: m.OpsStatusPage })),
          },
          {
            path: 'app-config',
            lazy: () => import('@/pages/admin/app-config').then((m) => ({ Component: m.AdminAppConfigPage })),
          },
        ],
      },
    ],
  },
  ] : []),
  ...(showConsole ? [
  {
    element: <RequireRole role="ADMIN" loginPath={consolePath('/login')} />,
    children: [
      {
        path: consolePath(),
        element: <AdminLayout />,
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/admin/dashboard').then((m) => ({ Component: m.AdminDashboardPage })),
          },
          {
            path: 'legal-documents',
            lazy: () => import('@/pages/admin/legal-documents').then((m) => ({ Component: m.AdminLegalDocumentsPage })),
          },
          {
            path: 'legal-documents/:id',
            lazy: () => import('@/pages/admin/legal-document-edit').then((m) => ({ Component: m.AdminLegalDocumentEditPage })),
          },
          {
            path: 'category-moderation',
            lazy: () => import('@/pages/admin/category-moderation').then((m) => ({ Component: m.AdminCategoryModerationPage })),
          },
          {
            path: 'category-moderation/flag',
            lazy: () => import('@/pages/admin/category-moderation/flag-page').then((m) => ({ Component: m.FlagDishPage })),
          },
          {
            path: 'service-areas',
            lazy: () => import('@/pages/admin/service-areas').then((m) => ({ Component: m.AdminServiceAreasPage })),
          },
          {
            path: 'service-areas/new',
            lazy: () => import('@/pages/admin/service-areas').then((m) => ({ Component: m.AdminServiceAreaEditPage })),
          },
          {
            path: 'service-areas/:id',
            lazy: () => import('@/pages/admin/service-areas').then((m) => ({ Component: m.AdminServiceAreaEditPage })),
          },
          {
            path: 'merchants',
            lazy: () => import('@/pages/admin/merchants').then((m) => ({ Component: m.AdminMerchantsPage })),
          },
          {
            path: 'merchants/:vendorId',
            lazy: () => import('@/pages/admin/merchant-detail').then((m) => ({ Component: m.AdminMerchantDetailPage })),
          },
          {
            path: 'statistics',
            lazy: () => import('@/pages/admin/platform-stats').then((m) => ({ Component: m.AdminPlatformStatsPage })),
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
            path: 'contact-requests',
            lazy: () => import('@/pages/admin/contact-requests').then((m) => ({ Component: m.AdminContactRequestsPage })),
          },
          {
            path: 'contact-requests/:id',
            lazy: () => import('@/pages/admin/contact-requests').then((m) => ({ Component: m.AdminContactRequestPage })),
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
            path: 'help-articles/new',
            lazy: () => import('@/pages/admin/help-articles').then((m) => ({ Component: m.AdminHelpArticleEditPage })),
          },
          {
            path: 'help-articles/:id',
            lazy: () => import('@/pages/admin/help-articles').then((m) => ({ Component: m.AdminHelpArticleEditPage })),
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
  ] : []),
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
