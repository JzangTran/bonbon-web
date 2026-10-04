import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AreaLayout, type NavItem } from '@/app/layouts/area-layout'
import { SellerLayout } from '@/app/layouts/seller-layout'
import { RequireRole } from './require-role'

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Tổng quan' },
  { to: '/admin/shop-review', label: 'Duyệt cửa hàng' },
  { to: '/admin/categories', label: 'Ngành hàng' },
  { to: '/admin/admins', label: 'Quản trị viên' },
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
