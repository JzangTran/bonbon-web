import { useMutation } from '@tanstack/react-query'
import { EyeIcon, TriangleAlertIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { toast } from 'sonner'
import { api, problemMessage, type components } from '@/shared/api'
import { formatTime, formatVnd, weekdayName } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

type Detail = components['schemas']['ShopApplicationDetail']

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">{children}</CardContent>
    </Card>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 text-sm sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  )
}

/** What an administrator reads about a shop: the four sections of its application, identity documents behind their own permission. */
export function ShopApplicationSections({ shop, canViewIdentity }: { shop: Detail; canViewIdentity: boolean }) {
  return (
    <>
      <Section title="1 · Thông tin quán">
        <Row label="Địa chỉ">
          {shop.formattedAddress ?? '—'}
          {shop.addressDetail ? ` · ${shop.addressDetail}` : ''}
        </Row>
        <Row label="Điện thoại / email">
          {shop.phone ?? '—'} · {shop.email ?? '—'}
        </Row>
        {shop.lat !== undefined && shop.lng !== undefined ? (
          <Row label="Toạ độ">
            <a className="text-link" href={`https://www.google.com/maps?q=${shop.lat},${shop.lng}`} target="_blank" rel="noreferrer">
              {shop.lat.toFixed(5)}, {shop.lng.toFixed(5)}
            </a>
          </Row>
        ) : null}
      </Section>
      <Section title="2 · Giao hàng & giờ mở cửa">
        <Row label="Bán kính / phí">
          {shop.deliveryRadiusKm ?? '—'} km · {formatVnd(shop.deliveryFee)}
        </Row>
        <Row label="Miễn phí từ / tối thiểu">
          {formatVnd(shop.freeDeliveryThreshold)} · {formatVnd(shop.minOrderValue)}
        </Row>
        <Row label="Giờ mở cửa">
          {shop.openingHours?.length
            ? shop.openingHours.map((w) => `${weekdayName(w.weekday)} ${formatTime(w.opensAt)}–${formatTime(w.closesAt)}`).join(' · ')
            : '—'}
        </Row>
      </Section>
      <Section title="3 · Thuế & tài khoản nhận tiền">
        <Row label="Loại hình">{shop.businessType === 'HOUSEHOLD' ? `Hộ kinh doanh · ${shop.businessName ?? '—'}` : 'Cá nhân'}</Row>
        <Row label="Mã số thuế">{shop.taxCode ?? '—'}</Row>
        <Row label="Địa chỉ kinh doanh">{shop.businessAddress ?? '—'}</Row>
        <Row label="Email hoá đơn">{shop.invoiceEmails?.join(', ') || '—'}</Row>
        {shop.businessLicenseUrl ? (
          <Row label="Giấy phép kinh doanh">
            <a className="text-link" href={shop.businessLicenseUrl} target="_blank" rel="noreferrer">
              Mở tệp (liên kết hết hạn sau 5 phút)
            </a>
          </Row>
        ) : null}
        <Row label="Tài khoản nhận tiền">
          {shop.bankName ?? '—'} · ••••{shop.accountLast4 ?? '????'} · {shop.accountHolderName ?? '—'}
        </Row>
        {shop.payoutHolderMatchesIdentity === false ? (
          <p className="flex items-center gap-2 rounded-md bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
            <TriangleAlertIcon className="size-4 shrink-0" />
            Tên chủ tài khoản không khớp tên trên giấy tờ ({shop.identityFullName}). Kiểm tra kỹ.
          </p>
        ) : null}
      </Section>
      <IdentitySection shop={shop} canView={canViewIdentity} />
    </>
  )
}

function IdentitySection({ shop, canView }: { shop: Detail; canView: boolean }) {
  const reveal = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchant-approval/requests/{vendorId}/identity', {
        params: { path: { vendorId: shop.vendorId! } },
      })
      if (error || !data) throw error
      return data
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
  const docs = reveal.data

  return (
    <Section title="4 · Định danh">
      <Row label="Giấy tờ">
        {shop.identityDocType ?? '—'} · {shop.identityFullName ?? '—'}
      </Row>
      {docs ? (
        <>
          <Row label="Số giấy tờ">{docs.docNumber ?? '—'}</Row>
          <div className="flex flex-wrap gap-3">
            {[docs.frontPhotoUrl, docs.selfiePhotoUrl].map((url, i) =>
              url ? (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="block">
                  <img src={url} alt={i === 0 ? 'Ảnh mặt trước giấy tờ' : 'Ảnh cầm giấy tờ'} className="h-40 w-64 rounded-md border object-cover" />
                </a>
              ) : null,
            )}
          </div>
          <p className="text-xs text-muted-foreground">Liên kết ảnh hết hạn sau 5 phút.</p>
        </>
      ) : canView ? (
        <div>
          <Button variant="outline" disabled={reveal.isPending} onClick={() => reveal.mutate()}>
            <EyeIcon /> Xem giấy tờ (được ghi nhật ký)
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bạn không có quyền xem giấy tờ tuỳ thân.</p>
      )}
    </Section>
  )
}
