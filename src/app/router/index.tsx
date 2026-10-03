import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AreaLayout, type NavItem } from '@/app/layouts/area-layout'
import { RequireRole } from './require-role'

const sellerNav: NavItem[] = [{ to: '/seller', label: 'Tổng quan' }]
const adminNav: NavItem[] = [
  { to: '/admin', label: 'Tổng quan' },
  { to: '/admin/admins', label: 'Quản trị viên' },
]

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/seller" replace /> },
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
    path: '/legal/:type',
    lazy: () => import('@/pages/legal-document').then((m) => ({ Component: m.LegalDocumentPage })),
  },
  {
    element: <RequireRole role="SELLER" loginPath="/seller/login" />,
    children: [
      {
        path: '/seller',
        element: <AreaLayout title="Người bán" nav={sellerNav} loginPath="/seller/login" />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/seller/dashboard').then((m) => ({ Component: m.SellerDashboardPage })),
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
        element: <AreaLayout title="Quản trị" nav={adminNav} loginPath="/admin/login" />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/admin/dashboard').then((m) => ({ Component: m.AdminDashboardPage })),
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
