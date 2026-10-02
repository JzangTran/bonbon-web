import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AreaLayout, type NavItem } from '@/app/layouts/area-layout'
import { RequireRole } from './require-role'

const sellerNav: NavItem[] = [{ to: '/seller', label: 'Tổng quan' }]
const adminNav: NavItem[] = [{ to: '/admin', label: 'Tổng quan' }]

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
    element: <RequireRole role="SELLER" loginPath="/seller/login" />,
    children: [
      {
        path: '/seller',
        element: <AreaLayout title="Người bán" nav={sellerNav} />,
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
        element: <AreaLayout title="Quản trị" nav={adminNav} />,
        children: [
          {
            index: true,
            lazy: () => import('@/pages/admin/dashboard').then((m) => ({ Component: m.AdminDashboardPage })),
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
