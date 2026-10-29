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
import { PageTabs } from '@/shared/ui/workspace-slots'
import { consolePath } from '@/shared/config/sites'
import { Pagination } from '@/shared/ui/pagination'
import { usePaging } from '@/shared/lib/use-paging'
import { ChartPanel } from '@/widgets/chart-panel'
import { t } from '@/shared/i18n'

type Kind = RecordInput['type']
type Tab = 'ledger' | 'statement'

const KIND_TEXT: Record<Kind, { title: string; description: string; button: string }> = {
  PAYOUT: { title: t('Ghi nhận đã chi trả cho quán'), description: t('Sau khi bạn đã chuyển tiền cho quán ngoài hệ thống.'), button: t('Chi trả') },
  COLLECTION: { title: t('Ghi nhận đã thu hoa hồng'), description: t('Sau khi quán đã chuyển tiền hoa hồng còn nợ cho nền tảng.'), button: t('Thu') },
  ADJUSTMENT: { title: t('Điều chỉnh số dư'), description: t('Sửa một bút toán sai bằng bút toán ngược dấu. Bắt buộc có lý do; không xoá hay sửa được dòng đã ghi.'), button: t('Điều chỉnh') },
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
  const paging = usePaging()
  const [granularity, setGranularity] = useState<Granularity>('week')
  const ledger = useVendorLedger(vendorId, type, paging.page, canRead && tab === 'ledger', paging.size)
  const statement = useVendorStatement(vendorId, granularity, canRead && tab === 'statement')
  const [kind, setKind] = useState<Kind | null>(null)

  if (!canRead) return <p className="text-muted-foreground">{t('Bạn không có quyền xem đối soát.')}</p>
  const v = vendor.data

  return (
    <div className="flex max-w-5xl flex-col gap-10">
      <div>
        <Link to={consolePath('/settlement')} className="text-link text-sm">
          {t('← Đối soát')}
        </Link>
        <h1 className="text-2xl font-semibold">{v?.name ?? t('Quán')}</h1>
      </div>
      {vendor.isError ? <FormError message={problemMessage(vendor.error)} /> : null}
      {vendor.isPending ? <Skeleton className="h-24" /> : null}

      {v ? (
        <Card className="flex-row flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm text-muted-foreground">{(v.balance ?? 0) < 0 ? t('Quán đang nợ nền tảng') : t('Nền tảng đang nợ quán')}</p>
            <p className={cn('text-3xl font-semibold tabular-nums', (v.balance ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>{formatVnd(Math.abs(v.balance ?? 0))}</p>
            <p className="text-xs text-muted-foreground">
              {t('Có thể chi trả ngay ')}{formatVnd(v.payable)}
              {v.heldForCases ? t(' · giữ cho khiếu nại {v0}', { v0: formatVnd(v.heldForCases) }) : ''}
            </p>
          </div>
          {canWrite ? (
            <div className="flex flex-wrap gap-2">
              <Button disabled={(v.payable ?? 0) <= 0} onClick={() => setKind('PAYOUT')}>
                {t('Ghi chi trả')}
              </Button>
              <Button variant="outline" disabled={(v.owed ?? 0) <= 0} onClick={() => setKind('COLLECTION')}>
                {t('Ghi thu hoa hồng')}
              </Button>
              <Button variant="outline" onClick={() => setKind('ADJUSTMENT')}>
                {t('Điều chỉnh')}
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      <PageTabs
        label={t('Sổ cái của quán')}
        tabs={[
          { id: 'ledger', label: t('Sổ cái') },
          { id: 'statement', label: t('Sao kê theo kỳ') },
        ]}
        value={tab}
        onValueChange={(id) => setTab(id as 'ledger' | 'statement')}
      />

      {tab === 'ledger' ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="type-filter" className="text-sm">
              {t('Loại')}
            </Label>
            <select
              id="type-filter"
              className="h-9 rounded-lg bg-grey-100 hover:bg-grey-200/70 px-2 text-sm"
              value={type ?? ''}
              onChange={(e) => {
                setType(e.target.value || null)
                paging.reset()
              }}
            >
              <option value="">{t('Tất cả')}</option>
              {LEDGER_TYPES.map((tItem) => (
                <option key={tItem} value={tItem}>
                  {LEDGER_TYPE_LABEL[tItem]}
                </option>
              ))}
            </select>
          </div>
          {ledger.isError ? <FormError message={problemMessage(ledger.error)} /> : null}
          {ledger.data && (ledger.data.items ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{t('Chưa có bút toán nào.')}</Card> : null}
          <ul className="flex flex-col divide-y rounded-sm border bg-card">
            {(ledger.data?.items ?? []).map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {LEDGER_TYPE_LABEL[entry.type ?? ''] ?? entry.type}
                    {entry.orderNumber ? t(' · đơn #{v0}', { v0: entry.orderNumber }) : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)} · {entry.actedByType === 'SYSTEM' ? t('tự động') : t('quản trị viên')}
                    {entry.reference ? t(' · mã {v0}', { v0: entry.reference }) : ''}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </p>
                </div>
                <p className={cn('font-semibold tabular-nums', (entry.amount ?? 0) < 0 ? 'text-danger-fg' : 'text-success-fg')}>{formatSigned(entry.amount)}</p>
              </li>
            ))}
          </ul>
          <Pagination paging={paging} total={ledger.data?.total ?? 0} />
        </section>
      ) : (
        <section className="flex flex-col gap-3">
          <div className="flex gap-1">
            {(['day', 'week', 'month'] as const).map((g) => (
              <Button key={g} size="sm" variant={granularity === g ? 'default' : 'outline'} onClick={() => setGranularity(g)}>
                {g === 'day' ? t('Ngày') : g === 'week' ? t('Tuần') : t('Tháng')}
              </Button>
            ))}
          </div>
          {statement.isError ? <FormError message={problemMessage(statement.error)} /> : null}
          {statement.data && (statement.data.periods ?? []).length > 0 ? (
            <ChartPanel
              title={t('Tiền theo kỳ')}
              metrics={[
                { id: 'food', label: t('Tiền món'), value: (p) => p.foodValue, format: formatVnd },
                { id: 'commission', label: t('Hoa hồng'), value: (p) => p.commission, format: formatVnd },
                { id: 'payouts', label: t('Đã chi trả'), value: (p) => p.payouts, format: formatVnd },
              ]}
              current={[...(statement.data.periods ?? [])].reverse()}
              label={(p) => periodLabel(p.start ?? '', granularity)}
              full={(p) => periodLabel(p.start ?? '', granularity)}
            />
          ) : null}
          {statement.data && (statement.data.periods ?? []).length === 0 ? <Card className="p-6 text-muted-foreground">{t('Chưa có số liệu trong 90 ngày gần nhất.')}</Card> : null}
          <div className="overflow-x-auto rounded-xl bg-beige-50 px-2 py-1 sm:px-3">
            <table className="w-full text-ui">
              <thead className="text-small text-muted-foreground">
                <tr>
                  {[t('Kỳ'), t('Đơn'), t('Tiền món'), t('Hoa hồng'), t('Đã chi trả'), t('Đã thu'), t('Điều chỉnh'), t('Số dư cuối')].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-right font-normal whitespace-nowrap first:text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(statement.data?.periods ?? []).map((p) => (
                  <tr key={p.start} className="border-t border-grey-200">
                    <td className="px-3 py-3">{periodLabel(p.start ?? '', granularity)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.orders}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.foodValue)}</td>
                    <td className="px-3 py-3 text-right tabular-nums" title={t('ròng {v0} + VAT {v1}', { v0: formatVnd(p.commissionNet), v1: formatVnd(p.commissionVat) })}>
                      {formatVnd(p.commission)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.payouts)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatVnd(p.collections)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatSigned(p.adjustments)}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums">{formatSigned(p.closingBalance)}</td>
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
            <div className="flex gap-1" role="radiogroup" aria-label={t('Chiều điều chỉnh')}>
              <Button type="button" size="sm" variant={sign === 1 ? 'default' : 'outline'} onClick={() => setSign(1)}>
                {t('Cộng cho quán')}
              </Button>
              <Button type="button" size="sm" variant={sign === -1 ? 'default' : 'outline'} onClick={() => setSign(-1)}>
                {t('Trừ của quán')}
              </Button>
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">{t('Số tiền (₫)')}</Label>
            <Input id="amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {limit !== null ? <p className="text-xs text-muted-foreground">{t('Tối đa ')}{formatVnd(limit)}</p> : null}
            {limit !== null && digits > limit ? <p role="alert" className="text-sm text-destructive">{t('Vượt quá số cho phép.')}</p> : null}
          </div>
          {needsReference ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reference">{t('Mã giao dịch ngân hàng')}</Label>
              <Input id="reference" value={reference} maxLength={100} onChange={(e) => setReference(e.target.value)} />
              <p className="text-xs text-muted-foreground">{t('Dùng để đối chiếu với sao kê ngân hàng; hệ thống không kiểm tra được.')}</p>
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">{kind === 'ADJUSTMENT' ? t('Lý do (bắt buộc)') : t('Ghi chú (không bắt buộc)')}</Label>
            <Textarea id="note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {record.isError ? <FormError message={problemMessage(record.error)} /> : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('Huỷ')}</Button>
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
