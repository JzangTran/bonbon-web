import { useQueryClient } from '@tanstack/react-query'
import { BellIcon, BellOffIcon, WifiOffIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  OrderStatusBadge,
  SHOP_ORDERS_KEY,
  useOrderSocket,
  useShopOrders,
  type OrderEvent,
  type OrderStatus,
  type ShopOrderSummary,
} from '@/entities/order'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatRelative, formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { OrderActions } from './order-actions'
import { OrderSheet } from './order-sheet'
import { countdown, useNow } from './use-now'

type Tab = 'new' | 'progress' | 'history'

const IN_PROGRESS: OrderStatus[] = ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY']
const FINISHED: OrderStatus[] = ['DELIVERED', 'REJECTED', 'CANCELLED', 'NOT_DELIVERED']
const SOUND_KEY = 'bonbon.orderSound'

function readSoundPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    return true
  }
}

/** Two short beeps. Browsers only allow sound after the page has been used once, so a failure is simply silent. */
function beep() {
  try {
    const context = new AudioContext()
    const start = context.currentTime
    for (const offset of [0, 0.3]) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.2, start + offset)
      gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.2)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(start + offset)
      oscillator.stop(start + offset + 0.22)
    }
    setTimeout(() => void context.close(), 1000)
  } catch {
    // No audio available: the banner still shows.
  }
}

/** The shop's orders (view-new-orders-list.md, update-order-status.md, view-order-history.md), live over a socket. */
export function SellerOrdersPage() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('new')
  const [openId, setOpenId] = useState<string | null>(null)
  const [soundOn, setSoundOn] = useState(readSoundPreference)

  const soundRef = useRef(soundOn)
  useEffect(() => {
    soundRef.current = soundOn
  }, [soundOn])

  const socket = useOrderSocket(session?.accessToken ?? null, (event: OrderEvent) => {
    void queryClient.invalidateQueries({ queryKey: SHOP_ORDERS_KEY })
    if (event.channel === 'shop' && event.to === 'PLACED' && soundRef.current) beep()
  })
  const live = socket === 'live'

  const fresh = useShopOrders({ statuses: ['PLACED'], oldestFirst: true }, live)
  const progress = useShopOrders({ statuses: IN_PROGRESS, oldestFirst: true }, live)
  const waiting = fresh.data?.total ?? 0

  // Unanswered orders keep nagging every 30 s until the shop answers them (or the timeout does).
  useEffect(() => {
    if (waiting === 0 || !soundOn) return
    const timer = setInterval(beep, 30_000)
    return () => clearInterval(timer)
  }, [waiting, soundOn])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    try {
      localStorage.setItem(SOUND_KEY, next ? 'on' : 'off')
    } catch {
      // The preference just does not persist.
    }
    if (next) beep()
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'new', label: 'Mới', count: waiting },
    { id: 'progress', label: 'Đang làm', count: progress.data?.total ?? 0 },
    { id: 'history', label: 'Lịch sử' },
  ]

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">Đơn mới hiện ngay khi khách đặt. Nhận đơn trong vài phút, nếu không đơn sẽ tự bị từ chối.</p>
        </div>
        <Button variant="outline" size="sm" aria-pressed={soundOn} onClick={toggleSound}>
          {soundOn ? <BellIcon /> : <BellOffIcon />} {soundOn ? 'Đang bật âm báo' : 'Âm báo đang tắt'}
        </Button>
      </div>

      {socket === 'offline' ? (
        <p className="flex items-center gap-2 rounded-sm bg-warning-subtle px-3 py-2 text-sm text-warning-fg" role="status">
          <WifiOffIcon className="size-4" aria-hidden="true" /> Mất kết nối trực tiếp, đang tự tải lại mỗi 10 giây.
        </p>
      ) : null}

      {waiting > 0 && tab !== 'new' ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-sm bg-info-subtle px-4 py-3 text-info-fg">
          <span className="font-semibold">Có {waiting} đơn mới đang chờ bạn nhận.</span>
          <Button size="sm" onClick={() => setTab('new')}>
            Xem đơn mới
          </Button>
        </div>
      ) : null}

      <div role="tablist" aria-label="Đơn hàng" className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px flex h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-colors',
              tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            {t.count ? (
              <span className={cn('rounded-full px-2 text-xs tabular-nums', t.id === 'new' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'new' ? <OrderList query={fresh} empty="Chưa có đơn mới. Đơn mới sẽ hiện ở đây ngay khi khách đặt." onOpen={setOpenId} /> : null}
      {tab === 'progress' ? <OrderList query={progress} empty="Không có đơn nào đang làm." onOpen={setOpenId} /> : null}
      {tab === 'history' ? <History live={live} onOpen={setOpenId} /> : null}

      <OrderSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

type ListQuery = ReturnType<typeof useShopOrders>

function OrderList({ query, empty, onOpen }: { query: ListQuery; empty: string; onOpen: (id: string) => void }) {
  const now = useNow()
  if (query.isPending) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    )
  }
  if (query.isError) return <FormError message={problemMessage(query.error)} />
  const items = query.data?.items ?? []
  if (items.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">{empty}</p>
      </Card>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((order) => (
        <OrderRow key={order.id} order={order} now={now} onOpen={() => onOpen(order.id!)} />
      ))}
    </ul>
  )
}

function OrderRow({ order, now, onOpen }: { order: ShopOrderSummary; now: number; onOpen: () => void }) {
  const status = order.status as OrderStatus
  const response = countdown(order.responseDeadline, now)
  const handover = countdown(order.handoverDeadline, now)
  return (
    <li>
      <Card className="gap-3 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <button type="button" onClick={onOpen} className="min-w-0 flex-1 basis-60 text-left" aria-label={`Mở đơn #${order.number}`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold tabular-nums">#{order.number}</span>
              <OrderStatusBadge status={status} />
              <span className="text-sm text-muted-foreground">{formatRelative(order.placedAt)}</span>
            </div>
            <p className="mt-1 font-medium">{order.customerName}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">{order.itemsPreview}</p>
          </button>
          <div className="flex flex-col items-end gap-1">
            <span className="font-semibold tabular-nums">{formatVnd(order.grandTotal)}</span>
            {response ? (
              <span className={cn('text-sm tabular-nums', response.urgent ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
                Còn {response.text}
              </span>
            ) : null}
            {handover ? (
              <span className={cn('text-sm tabular-nums', handover.urgent ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
                Hạn giao đi {handover.text}
              </span>
            ) : null}
          </div>
        </div>
        <OrderActions id={order.id!} status={status} />
      </Card>
    </li>
  )
}

function History({ live, onOpen }: { live: boolean; onOpen: (id: string) => void }) {
  const [status, setStatus] = useState<'ALL' | OrderStatus>('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const query = useShopOrders({ statuses: status === 'ALL' ? FINISHED : [status], from, to, page, size: 20 }, live)
  const total = query.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / 20))
  const reset = <T,>(set: (value: T) => void) => (value: T) => {
    set(value)
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="history-status">Trạng thái</Label>
          <select
            id="history-status"
            className="h-10 rounded-sm border border-input bg-card px-3 text-sm"
            value={status}
            onChange={(e) => reset(setStatus)(e.target.value as 'ALL' | OrderStatus)}
          >
            <option value="ALL">Tất cả</option>
            <option value="DELIVERED">Đã giao</option>
            <option value="REJECTED">Quán từ chối</option>
            <option value="CANCELLED">Đã huỷ</option>
            <option value="NOT_DELIVERED">Giao không thành công</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="history-from">Từ ngày</Label>
          <Input id="history-from" type="date" value={from} max={to || undefined} onChange={(e) => reset(setFrom)(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="history-to">Đến ngày</Label>
          <Input id="history-to" type="date" value={to} min={from || undefined} onChange={(e) => reset(setTo)(e.target.value)} />
        </div>
      </div>
      <OrderList query={query} empty="Không có đơn nào trong bộ lọc này." onOpen={onOpen} />
      {total > 20 ? (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            Trang {page + 1}/{pages} · {total} đơn
          </span>
          <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
            Trang sau
          </Button>
        </div>
      ) : null}
    </div>
  )
}
