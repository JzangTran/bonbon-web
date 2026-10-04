import { useState } from 'react'
import { useMenu, useOptionGroups } from '@/entities/menu'
import { problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { MenuTab } from './menu-tab'
import { OptionsTab } from './options-tab'

type Tab = 'dishes' | 'options'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dishes', label: 'Món ăn' },
  { id: 'options', label: 'Nhóm lựa chọn' },
]

/** The seller's menu (manage-menu.md, manage-menu-options.md): sections and dishes, and the option groups dishes offer. */
export function SellerMenuPage() {
  const menu = useMenu()
  const groups = useOptionGroups()
  const [tab, setTab] = useState<Tab>('dishes')

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Thực đơn</h1>
        <p className="text-sm text-muted-foreground">
          Mục thực đơn là cách bạn nhóm món cho khách xem. Nhóm lựa chọn (cỡ ly, topping…) dùng lại được cho nhiều món.
        </p>
      </div>
      <div role="tablist" aria-label="Thực đơn" className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px h-11 border-b-2 px-4 text-sm font-semibold transition-colors',
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {menu.isPending || groups.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : menu.isError || groups.isError ? (
        <FormError message={problemMessage(menu.error ?? groups.error)} />
      ) : tab === 'dishes' ? (
        <MenuTab menu={menu.data} groups={groups.data} />
      ) : (
        <OptionsTab menu={menu.data} groups={groups.data} />
      )}
    </div>
  )
}
