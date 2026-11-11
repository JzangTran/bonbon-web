import { toast } from 'sonner'
import { ORDER_STATUSES, OrderStatusBadge } from '@/entities/order'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Textarea } from '@/shared/ui/textarea'
import { intlLocale, t } from '@/shared/i18n'

const sampleOrders = [
  { code: 'BB-1024', shop: t('Cơm tấm Cô Ba'), total: 45000, status: 'PREPARING' as const },
  { code: 'BB-1023', shop: t('Bún bò Huế 79'), total: 52000, status: 'OUT_FOR_DELIVERY' as const },
  { code: 'BB-1019', shop: t('Trà sữa Mây'), total: 38000, status: 'DELIVERED' as const },
]

const vnd = new Intl.NumberFormat(intlLocale, { style: 'currency', currency: 'VND' })

/** Dev-only catalogue of the base components with bonbon tokens applied. */
export function UiKitPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-8">
      <header>
        <h1 className="text-3xl font-semibold text-primary">bonbon UI kit</h1>
        <p className="text-muted-foreground">{t('Component cơ bản với design tokens (chỉ có ở môi trường dev).')}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t('Xác nhận đơn')}</Button>
          <Button size="lg">{t('Chuyển sang Đang giao')}</Button>
          <Button variant="outline">{t('Xem chi tiết')}</Button>
          <Button variant="secondary">{t('Lưu nháp')}</Button>
          <Button variant="ghost">{t('Bỏ qua')}</Button>
          <Button variant="destructive">{t('Từ chối đơn')}</Button>
          <Button variant="link">{t('Điều khoản')}</Button>
          <Button disabled>{t('Đang xử lý…')}</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Order status</h2>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <OrderStatusBadge key={s} status={s} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{t('Mặc định')}</Badge>
          <Badge variant="secondary">{t('Phụ')}</Badge>
          <Badge variant="outline">{t('Viền')}</Badge>
          <Badge variant="destructive">{t('Lỗi')}</Badge>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Form</CardTitle>
            <CardDescription>Input, select, textarea</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="shop-name">{t('Tên quán')}</Label>
              <Input id="shop-name" placeholder={t('Ví dụ: Cơm tấm Cô Ba')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invalid">{t('Số điện thoại')}</Label>
              <Input id="invalid" aria-invalid defaultValue="09xx" />
              <p role="alert" className="text-sm text-destructive">{t('Số điện thoại chưa đúng định dạng.')}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t('Phương thức thanh toán')}</Label>
              <Select defaultValue="cod">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">{t('Thanh toán khi nhận hàng')}</SelectItem>
                  <SelectItem value="online">{t('Ví MoMo')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="note">{t('Ghi chú')}</Label>
              <Textarea id="note" placeholder={t('Ít cay, không hành')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overlays and feedback</CardTitle>
            <CardDescription>Dialog, sheet, toast, skeleton</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">{t('Từ chối đơn…')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('Từ chối đơn BB-1024?')}</DialogTitle>
                    <DialogDescription>{t('Khách sẽ được báo ngay. Hành động này tính vào tỷ lệ đơn lỗi của quán.')}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">{t('Huỷ')}</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={() => toast.success(t('Đã từ chối đơn BB-1024'))}>
                        {t('Từ chối')}
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">{t('Mở sheet')}</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>{t('Tuỳ chọn món')}</SheetTitle>
                    <SheetDescription>{t('Size, topping và ghi chú.')}</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <Button variant="secondary" onClick={() => toast.success(t('Đã lưu thay đổi'))}>
                Toast
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Table</h2>
        <Card className="py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Mã đơn')}</TableHead>
                <TableHead>{t('Quán')}</TableHead>
                <TableHead className="text-right">{t('Tổng tiền')}</TableHead>
                <TableHead>{t('Trạng thái')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleOrders.map((o) => (
                <TableRow key={o.code}>
                  <TableCell className="font-medium">{o.code}</TableCell>
                  <TableCell>{o.shop}</TableCell>
                  <TableCell className="text-right">{vnd.format(o.total)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>
    </main>
  )
}
