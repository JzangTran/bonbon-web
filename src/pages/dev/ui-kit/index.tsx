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

const sampleOrders = [
  { code: 'BB-1024', shop: 'Cơm tấm Cô Ba', total: 45000, status: 'PREPARING' as const },
  { code: 'BB-1023', shop: 'Bún bò Huế 79', total: 52000, status: 'OUT_FOR_DELIVERY' as const },
  { code: 'BB-1019', shop: 'Trà sữa Mây', total: 38000, status: 'DELIVERED' as const },
]

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

/** Dev-only catalogue of the base components with bonbon tokens applied. */
export function UiKitPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 p-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-600">bonbon UI kit</h1>
        <p className="text-muted-foreground">Component cơ bản với design tokens (chỉ có ở môi trường dev).</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Xác nhận đơn</Button>
          <Button size="lg">Chuyển sang Đang giao</Button>
          <Button variant="outline">Xem chi tiết</Button>
          <Button variant="secondary">Lưu nháp</Button>
          <Button variant="ghost">Bỏ qua</Button>
          <Button variant="destructive">Từ chối đơn</Button>
          <Button variant="link">Điều khoản</Button>
          <Button disabled>Đang xử lý…</Button>
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
          <Badge>Mặc định</Badge>
          <Badge variant="secondary">Phụ</Badge>
          <Badge variant="outline">Viền</Badge>
          <Badge variant="destructive">Lỗi</Badge>
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
              <Label htmlFor="shop-name">Tên quán</Label>
              <Input id="shop-name" placeholder="Ví dụ: Cơm tấm Cô Ba" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="invalid">Số điện thoại</Label>
              <Input id="invalid" aria-invalid defaultValue="09xx" />
              <p className="text-sm text-destructive">Số điện thoại chưa đúng định dạng.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Phương thức thanh toán</Label>
              <Select defaultValue="cod">
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Thanh toán khi nhận hàng</SelectItem>
                  <SelectItem value="online">Ví MoMo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea id="note" placeholder="Ít cay, không hành" />
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
                  <Button variant="destructive">Từ chối đơn…</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Từ chối đơn BB-1024?</DialogTitle>
                    <DialogDescription>Khách sẽ được báo ngay. Hành động này tính vào tỷ lệ đơn lỗi của quán.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Huỷ</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={() => toast.success('Đã từ chối đơn BB-1024')}>
                        Từ chối
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Mở sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Tuỳ chọn món</SheetTitle>
                    <SheetDescription>Size, topping và ghi chú.</SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
              <Button variant="secondary" onClick={() => toast.success('Đã lưu thay đổi')}>
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
                <TableHead>Mã đơn</TableHead>
                <TableHead>Quán</TableHead>
                <TableHead className="text-right">Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
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
