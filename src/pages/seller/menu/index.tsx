import { TriangleAlertIcon } from 'lucide-react'
import { Link } from 'react-router'
import { useMyOpenCaseCount } from '@/entities/dish-category-case'
import { useMenu, useOptionGroups } from '@/entities/menu'
import { problemMessage } from '@/shared/api'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { MenuTabs } from '@/widgets/seller-tabs'
import { MenuTab } from './menu-tab'
import { OptionsTab } from './options-tab'
import { merchantPath } from '@/shared/config/sites'

/** The seller's menu (manage-menu.md, manage-menu-options.md): sections and dishes, and the option groups dishes offer. */
export function SellerMenuPage({ startNewDish = false, tab = 'dishes' }: { startNewDish?: boolean; tab?: 'dishes' | 'options' }) {
  const menu = useMenu()
  const groups = useOptionGroups()
  const openCases = useMyOpenCaseCount()

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <MenuTabs />
      <div>
        <h1 className="text-2xl font-semibold">Thực đơn</h1>
        <p className="text-sm text-muted-foreground">
          Mục thực đơn là cách bạn nhóm món cho khách xem. Nhóm lựa chọn (cỡ ly, topping…) dùng lại được cho nhiều món.
        </p>
      </div>
      {openCases > 0 ? (
        <p className="flex flex-wrap items-center gap-2 rounded-md bg-warning-subtle px-4 py-3 text-sm text-warning-fg">
          <TriangleAlertIcon className="size-4 shrink-0" />
          Có {openCases} món bị đánh dấu sai ngành hàng.
          <Link to={merchantPath('/category-cases')} className="text-link font-medium">
            Xem và sửa
          </Link>
        </p>
      ) : null}
      {menu.isPending || groups.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : menu.isError || groups.isError ? (
        <FormError message={problemMessage(menu.error ?? groups.error)} />
      ) : tab === 'dishes' ? (
        <MenuTab menu={menu.data} groups={groups.data} startNewDish={startNewDish} />
      ) : (
        <OptionsTab menu={menu.data} groups={groups.data} />
      )}
    </div>
  )
}

/** "Thêm món ăn": the menu with the new-dish form already open on the first section. */
export function SellerAddDishPage() {
  return <SellerMenuPage startNewDish />
}

/** "Nhóm lựa chọn": the option groups dishes offer. */
export function SellerOptionGroupsPage() {
  return <SellerMenuPage tab="options" />
}
