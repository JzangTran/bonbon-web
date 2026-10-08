import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useRecordEntry, useSettlementVendor, useVendorLedger, useVendorStatement, type Granularity, type RecordInput } from '@/entities/settlement'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime, formatVnd } from '@/shared/lib/format'
import { LEDGER_TYPES, LEDGER_TYPE_LABEL, formatSigned, periodLabel } from '@/shared/lib/ledger'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'

type Kind = RecordInput['type']
type Tab = 'ledger' | 'statement'

const KIND_TEXT: Record<Kind, { title: string; description: string; button: string }> = {
  PAYOUT: { title: 'Ghi nhận đã chi trả cho quán', description: 'Sau khi bạn đã chuyển tiền cho quán ngoài hệ thống.', button: 'Chi trả' },
  COLLECTION: { title: 'Ghi nhận đã thu hoa hồng', description: 'Sau khi quán đã chuyển tiền hoa hồng còn nợ cho nền tảng.', button: 'Thu' },
  ADJUSTMENT: { title: 'Điều chỉnh số dư', description: 'Sửa một bút toán sai bằng bút toán ngược dấu. Bắt buộc có lý do; không xoá hay sửa được dòng đã ghi.', button: 'Điều chỉnh' },
}

/** One shop's money: balance, the ledger, statements, and recording what was moved outside the system. */
export function AdminSettlementShopPage() {
  const { vendorId = '' } = useParams()
  const { session } = useSession()
  const canRead = !!session?.permissions.has('settlement:read')
  const canWrite = !!session?.permissions.has('settlement:write')
  const vendor = useSettlementVendor(vendorId, canRead)
  const [tab, setTab] = useState<Tab>('ledger')
  const [type, setType] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [granularity, setGranularity] = useState<Granularity>('week')
  const ledger = useVendorLedger(vendorId, type, page, canRead && tab === 'ledger')
  const statement = useVendorStatement(vendorId, granularity, canRead && tab === 'statement')
  const [kind, setKind] = useState<Kind | null>(null)

  if (!canRead) return <p className="text-muted-foreground">Bạn không có quyền xem đối soát.</p>
  const v = vendor.data

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <Link to="/admin/settlement" className="text-sm text-primary hover:underline">
          ← Đối soát
        </Link>
        <h1 className="text-2xl font-bold">{v?.name ?? 'Quán'}</h1>
      </div>
      {vendor.isError ? <FormError message={problemMessage(vendor.error)} /> : null}
      {vendor.isPending ? <Skeleton className="h-24" /> : null}

      {v ? (
        <Card className="flex-row flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-muted-foreground">{(v.balance ?? 0) < 0 ? 'Quán đang nợ nền tảng' : 'Nền tảng đang nợ quán'}</p>
            <p className={cn('text-3xl font-semibold tabular-nums', (v.balance ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>{formatVnd(Math.abs(v.balance ?? 0))}</p>
            <p className="text-xs text-muted-foreground">
              Có thể chi trả ngay {formatVnd(v.payable)}
              {v.heldForCases ? ` · giữ cho khiếu nại ${formatVnd(v.heldForCases)}` : ''}
            </p>
          </div>
          {canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Button disabled={(v.payable ?? 0) <= 0} onClick={() => setKind('PAYOUT')}>
                Ghi chi trả
              </Button>
              <Button variant="outline" disabled={(v.owed ?? 0) <= 0} onClick={() => setKind('COLLECTION')}>
                Ghi thu hoa hồng
              </Button>
              <Button variant="outline" onClick={() => setKind('ADJUSTMENT')}>
                Điều chỉnh
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      <div role="tablist" className="flex gap-1 border-b">
        {(['ledger', 'statement'] as const).map((id) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn('-mb-px min-h-10 border-b-2 px-3 text-sm', tab === id ? 'border-primary font-semibold text-primary' : 'border-transparent text-muted-foreground')}
          >
            {id === 'ledger' ? 'Sổ cái' : 'Sao kê theo kỳ'}
          </button>
        ))}
      </div>

      {tab === 'ledger' ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="type-filter" className="text-sm">
              Loại
            </Label>
            <select
              id="type-filter"
              className="h-9 rounded-sm border border-input bg-card px-2 text-sm"
              value={type ?? ''}
              onChange={(e) => {
                setType(e.target.value || null)
                setPage(0)
              }}
            >
              <option value="">Tất cả</option>
              {LEDGER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LEDGER_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          {ledger.isError ? <FormError message={problemMessage(ledger.error)} /> : null}
          {ledger.data && (ledger.data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có bút toán nào.</Card> : null}
          <ul className="flex flex-col divide-y rounded-sm border bg-card">
            {(ledger.data?.items ?? []).map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {LEDGER_TYPE_LABEL[entry.type ?? ''] ?? entry.type}
                    {entry.orderNumber ? ` · đơn #${entry.orderNumber}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)} · {entry.actedByType === 'SYSTEM' ? 'tự động' : 'quản trị viên'}
                    {entry.reference ? ` · mã ${entry.reference}` : ''}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>
                <p className={cn('font-semibold tabular-nums', (entry.amount ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>{formatSigned(entry.amount)}</p>
              </li>
            ))}
          </ul>
          {(ledger.data?.total ?? 0) > (ledger.data?.size ?? 20) ? (
            <div className="flex items-center justify-between">
              <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page + 1} / {Math.ceil((ledger.data?.total ?? 0) / (ledger.data?.size ?? 20))}
              </span>
              <Button variant="outline" disabled={(page + 1) * (ledger.data?.size ?? 20) >= (ledger.data?.total ?? 0)} onClick={() => setPage(page + 1)}>
                Trang sau
              </Button>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <div className="flex gap-1">
            {(['day', 'week', 'month'] as const).map((g) => (
              <Button key={g} size="sm" variant={granularity === g ? 'default' : 'outline'} onClick={() => setGranularity(g)}>
                {g === 'day' ? 'Ngày' : g === 'week' ? 'Tuần' : 'Tháng'}
              </Button>
            ))}
          </div>
          {statement.isError ? <FormError message={problemMessage(statement.error)} /> : null}
          {statement.data && (statement.data.periods ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">Chưa có số liệu trong 90 ngày gần nhất.</Card> : null}
          <div className="overflow-x-auto rounded-sm border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs text-muted-foreground">
                <tr>
                  {['Kỳ', 'Đơn', 'Tiền món', 'Hoa hồng', 'Đã chi trả', 'Đã thu', 'Điều chỉnh', 'Số dư cuối'].map((h) => (
                    <th key={h} className="px-3 py-2 text-right font-medium first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(statement.data?.periods ?? []).map((p) => (
                  <tr key={p.start} className="border-t">
                    <td className="px-3 py-2">{periodLabel(p.start ?? '', granularity)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{p.orders}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.foodValue)}</td>
                    <td className="px-3 py-2 text-right tabular-nums" title={`ròng ${formatVnd(p.commissionNet)} + VAT ${formatVnd(p.commissionVat)}`}>
                      {formatVnd(p.commission)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.payouts)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatVnd(p.collections)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatSigned(p.adjustments)}</td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums">{formatSigned(p.closingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {kind && v ? <RecordDialog key={kind} vendorId={vendorId} kind={kind} payable={v.payable ?? 0} owed={v.owed ?? 0} onClose={() => setKind(null)} /> : null}
    </div>
  )
}

/** One dialog per recorded entry: its idempotency key is made when it opens, so pressing the button twice is the same request. */
function RecordDialog({ vendorId, kind, payable, owed, onClose }: { vendorId: string; kind: Kind; payable: number; owed: number; onClose: () => void }) {
  const record = useRecordEntry(vendorId)
  const [key] = useState(() => crypto.randomUUID())
  const [amount, setAmount] = useState('')
  const [sign, setSign] = useState<1 | -1>(1)
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const text = KIND_TEXT[kind]
  const digits = Number(amount.replace(/[.,\s]/g, ''))
  const limit = kind === 'PAYOUT' ? payable : kind === 'COLLECTION' ? owed : null
  const needsReference = kind !== 'ADJUSTMENT'
  const valid =
    Number.isInteger(digits) && digits > 0 && (limit === null || digits <= limit) && (!needsReference || reference.trim().length > 0) && (kind !== 'ADJUSTMENT' || note.trim().length > 0)

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{text.title}</DialogTitle>
          <DialogDescription>{text.description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {kind === 'ADJUSTMENT' ? (
            <div className="flex gap-1" role="radiogroup" aria-label="Chiều điều chỉnh">
              <Button type="button" size="sm" variant={sign === 1 ? 'default' : 'outline'} onClick={() => setSign(1)}>
                Cộng cho quán
              </Button>
              <Button type="button" size="sm" variant={sign === -1 ? 'default' : 'outline'} onClick={() => setSign(-1)}>
                Trừ của quán
              </Button>
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Số tiền (₫)</Label>
            <Input id="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {limit !== null ? <p className="text-xs text-muted-foreground">Tối đa {formatVnd(limit)}</p> : null}
            {limit !== null && digits > limit ? <p className="text-sm text-destructive">Vượt quá số cho phép.</p> : null}
          </div>
          {needsReference ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reference">Mã giao dịch ngân hàng</Label>
              <Input id="reference" value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} />
              <p className="text-xs text-muted-foreground">Dùng để đối chiếu với sao kê ngân hàng; hệ thống không kiểm tra được.</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">{kind === 'ADJUSTMENT' ? 'Lý do (bắt buộc)' : 'Ghi chú (không bắt buộc)'}</Label>
            <Textarea id="note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {record.isError ? <FormError message={problemMessage(record.error)} /> : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Huỷ</Button>
          </DialogClose>
          <Button
            disabled={!valid || record.isPending}
            onClick={() =>
              record.mutate(
                { key, input: { type: kind, amount: kind === 'PAYOUT' || kind === 'COLLECTION' ? digits : digits * sign, reference: reference.trim() || undefined, note: note.trim() || undefined } },
                { onSuccess: onClose },
              )
            }
          >
            {text.button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
