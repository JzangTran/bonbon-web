import { DownloadIcon } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useApplyShop, type ShopApplication } from '@/entities/shop'
import { api } from '@/shared/api'
import { siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { checkUpload } from '@/shared/lib/upload'
import { Button, buttonClass } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ImageUpload } from '@/shared/ui/image-upload'

/** The link a shop's QR code carries: the app opens the shop's menu; a phone without the app lands on the web page of the shop. */
const shopLink = (id: string) => siteUrl('public', `/shops/${id}`)

/** The square picture next to the shop's name in the customer app. */
export function LogoCard({ shop }: { shop: ShopApplication }) {
  const upload = useApplyShop(async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.PUT('/api/merchant/shop/logo', {
      body: form as unknown as { file: string },
      bodySerializer: (body) => body as unknown as FormData,
    })
  }, t('Đã đổi logo.'))
  const remove = useApplyShop(() => api.DELETE('/api/merchant/shop/logo'), t('Đã gỡ logo.'))
  const logo = shop.shop?.logoUrl
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Logo quán')}</CardTitle>
        <CardDescription>{t('Ảnh vuông hiện cạnh tên quán trong ứng dụng khách. JPG, PNG hoặc WebP, tối đa 2 MB.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <ImageUpload
          label={logo ? t('Đổi logo') : t('Thêm logo')}
          accept="image/jpeg,image/png,image/webp"
          previewUrl={logo}
          pending={upload.isPending}
          onPick={async (file) => {
            const problem = await checkUpload(file, { maxMb: 2 })
            if (problem) toast.error(problem)
            else upload.mutate(file)
          }}
        />
        {logo ? (
          <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(undefined)}>
            {t('Gỡ logo')}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** The picture behind the top of the shop's page in the customer app, darkened there so the buttons stay readable. */
export function CoverCard({ shop }: { shop: ShopApplication }) {
  const upload = useApplyShop(async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.PUT('/api/merchant/shop/cover', {
      body: form as unknown as { file: string },
      bodySerializer: (body) => body as unknown as FormData,
    })
  }, t('Đã đổi ảnh nền.'))
  const remove = useApplyShop(() => api.DELETE('/api/merchant/shop/cover'), t('Đã gỡ ảnh nền.'))
  const cover = shop.shop?.coverUrl
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Ảnh nền quán')}</CardTitle>
        <CardDescription>{t('Ảnh ngang ở đầu trang quán trong ứng dụng khách. JPG, PNG hoặc WebP, tối đa 5 MB.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <ImageUpload
          label={cover ? t('Đổi ảnh nền') : t('Thêm ảnh nền')}
          accept="image/jpeg,image/png,image/webp"
          previewUrl={cover}
          pending={upload.isPending}
          onPick={async (file) => {
            const problem = await checkUpload(file, { maxMb: 5 })
            if (problem) toast.error(problem)
            else upload.mutate(file)
          }}
        />
        {cover ? (
          <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(undefined)}>
            {t('Gỡ ảnh nền')}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

/** The shop's QR code, to print and stick on the counter or the bags: customers scan it in the app to open the menu. */
export function QrCard({ shop }: { shop: ShopApplication }) {
  const id = shop.shop?.id
  const [image, setImage] = useState<string | null>(null)
  useEffect(() => {
    if (!id) return
    let cancelled = false
    void QRCode.toDataURL(shopLink(id), { width: 640, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#1D1D1D', light: '#FFFFFF' } }).then((url) => {
      if (!cancelled) setImage(url)
    })
    return () => {
      cancelled = true
    }
  }, [id])
  if (!id) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Mã QR của quán')}</CardTitle>
        <CardDescription>
          {t('In và dán ở quầy hoặc trên túi đồ ăn. Khách quét bằng nút quét mã trong ứng dụng bonbon để mở ngay thực đơn của quán.')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-6">
        {image ? <img src={image} alt={t('Mã QR của {v0}', { v0: shop.shop?.name ?? '' })} className="size-40 rounded-md border" /> : <div className="size-40 rounded-md bg-muted" />}
        <div className="flex flex-col gap-2">
          <p className="max-w-xs text-sm break-all text-muted-foreground">{shopLink(id)}</p>
          {image ? (
            <a href={image} download={`bonbon-qr-${id.slice(0, 8)}.png`} className={buttonClass({ variant: 'outline' })}>
              <DownloadIcon aria-hidden="true" />
              {t('Tải ảnh QR')}
            </a>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
