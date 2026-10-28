import { useState, type ReactNode } from 'react'
import { ORDER_STATUSES, OrderStatusBadge } from '@/entities/order'
import { usePaging } from '@/shared/lib/use-paging'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DocsRail } from '@/shared/ui/docs-frame'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Pagination } from '@/shared/ui/pagination'
import { ActionGroup, Segmented, StatRow, StatsPanel, StatTile, Toolbar } from '@/shared/ui/section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Textarea } from '@/shared/ui/textarea'
import { TimeChart, type ChartKind } from '@/shared/ui/time-chart'
import { Toc } from '@/widgets/article/article-view'
import { Breadcrumb } from '@/widgets/article/parts'
import { PageSeo } from '@/widgets/article/seo'
import { BRAND_PATH, BrandFrame, BrandSection, COMPONENTS_PATH } from './frame'

const SECTIONS = [
  { id: 'nut', text: 'Nút' },
  { id: 'lien-ket', text: 'Liên kết' },
  { id: 'o-nhap', text: 'Ô nhập' },
  { id: 'lua-chon', text: 'Lựa chọn' },
  { id: 'tab', text: 'Tab' },
  { id: 'nhan', text: 'Nhãn trạng thái' },
  { id: 'bang', text: 'Bảng và phân trang' },
  { id: 'so-lieu', text: 'Số liệu và biểu đồ' },
  { id: 'khoang-cach', text: 'Khoảng cách' },
]
const HEADINGS = SECTIONS.map((x) => ({ ...x, level: 2 as const }))
const GROUPS = [{ title: 'Components', items: SECTIONS.map((x) => ({ label: x.text, to: `${COMPONENTS_PATH}#${x.id}` })) }]
const TRAIL = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Thương hiệu', path: BRAND_PATH },
  { name: 'Components', path: COMPONENTS_PATH },
]

/** A white stage for a live sample, with the rules for it underneath. */
function Sample({ children, rules, className }: { children: ReactNode; rules: string[]; className?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={cn('flex flex-wrap items-center gap-3 rounded-xl border border-grey-200 p-6', className)}>{children}</div>
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-ui text-ink marker:text-primary">
        {rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  )
}

const ORDERS = [
  { code: '#116', customer: 'Hoàng Minh Anh', items: '2× Mì cay hải sản', total: 129000, status: 'PLACED' as const },
  { code: '#115', customer: 'Bùi Quang Huy', items: '1× Mì cay bò Mỹ', total: 71000, status: 'PREPARING' as const },
  { code: '#114', customer: 'Đặng Thu Hà', items: '3× Mì cay thập cẩm', total: 231000, status: 'OUT_FOR_DELIVERY' as const },
  { code: '#113', customer: 'Ngô Đức Long', items: '1× Kimbap chiên', total: 41000, status: 'DELIVERED' as const },
]
const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => ({
  key: d,
  label: d,
  full: `Thứ ${i === 6 ? 'Chủ nhật' : i + 2}`,
  values: { now: [420, 380, 510, 460, 720, 940, 860][i] * 1000, before: [390, 410, 450, 470, 650, 880, 900][i] * 1000 },
}))
const vnd = (n: number) => `${n.toLocaleString('vi-VN')} ₫`

/** /bo-nhan-dien/components: the building blocks of the bonbon screens, each with a live sample and the rules for using it. */
export function ComponentsPage() {
  const [segment, setSegment] = useState<'day' | 'week' | 'month'>('week')
  const [tab, setTab] = useState('new')
  const [kind, setKind] = useState<ChartKind>('bar')
  const [name, setName] = useState('')
  const paging = usePaging()

  return (
    <BrandFrame tab="components" sidebar={<DocsRail groups={GROUPS} label="Components" />} aside={<Toc headings={HEADINGS} />}>
      <PageSeo title="Components" description="Các thành phần giao diện của bonbon: nút, liên kết, ô nhập, tab, nhãn, bảng, số liệu và biểu đồ, kèm quy tắc dùng." path={COMPONENTS_PATH} trail={TRAIL} />
      <div className="flex flex-col gap-16">
        <div className="flex flex-col gap-3">
          <Breadcrumb trail={TRAIL} />
          <h1 className="text-h1 font-semibold">Components</h1>
          <p className="text-lead text-ink">Những mảnh ghép dựng nên mọi màn hình của bonbon. Mỗi mục có mẫu dùng thử và vài quy tắc ngắn để các trang luôn giống nhau.</p>
        </div>

        <BrandSection id="nut" title="Nút" intro="Nút dạng viên thuốc, chữ 14 px, đậm vừa. Nút chính màu mực; các nút còn lại nhẹ dần.">
          <Sample
            rules={[
              'Mỗi vùng chỉ một nút chính (màu mực). Các thao tác khác dùng nút phụ, nút viền hoặc nút chữ.',
              'Rê chuột lên nút phụ, nút chữ, tab hay mục menu: nền xám nhẹ và chữ đen, dù mục đó đang được chọn hay không.',
              'Nút nguy hiểm (xoá, từ chối) chỉ dùng khi hậu quả không hoàn tác được.',
            ]}
          >
            <Button>Nhận đơn</Button>
            <Button variant="secondary">Lưu nháp</Button>
            <Button variant="outline">Xem chi tiết</Button>
            <Button variant="ghost">Bỏ qua</Button>
            <Button variant="destructive">Từ chối đơn</Button>
            <Button disabled>Đang xử lý…</Button>
            <Button size="sm">Nhỏ</Button>
            <Button size="lg">Lớn</Button>
          </Sample>
        </BrandSection>

        <BrandSection id="lien-ket" title="Liên kết" intro="Liên kết trong chữ giữ màu của chữ quanh nó, có gạch chân cam; rê chuột thì gạch chân đậm lên, chữ không xê dịch.">
          <Sample rules={['Dùng lớp text-link cho mọi liên kết trong câu chữ.', 'Mục điều hướng (menu, breadcrumb, thanh bên) không gạch chân: chúng đổi nền khi rê chuột.']}>
            <p className="text-body">
              Đọc{' '}
              <a href={BRAND_PATH} className="text-link">
                quy tắc sử dụng logo
              </a>{' '}
              trước khi in logo lên bao bì.
            </p>
          </Sample>
        </BrandSection>

        <BrandSection id="o-nhap" title="Ô nhập" intro="Nền xám nhạt, không viền; nhãn ở trên, dấu * đỏ trước nhãn khi bắt buộc, số ký tự đã gõ ở góc phải.">
          <Sample
            className="flex-col items-stretch"
            rules={['Nhãn ngắn, nói đúng thứ cần nhập; ví dụ đặt trong chữ mờ của ô.', 'Lỗi hiện ngay dưới ô, bằng một câu nói cách sửa.']}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-shop">
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>{' '}
                Tên quán
              </Label>
              <Input id="c-shop" showCount maxLength={100} placeholder="Ví dụ: Mì Cay Cay" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-note">Ghi chú cho quán</Label>
              <Textarea id="c-note" rows={3} placeholder="Ví dụ: gọi điện khi tới sảnh" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="c-phone">Số điện thoại</Label>
              <Input id="c-phone" defaultValue="0912" aria-invalid />
              <p className="text-small text-destructive">Số điện thoại cần 10 chữ số, bắt đầu bằng 0.</p>
            </div>
          </Sample>
        </BrandSection>

        <BrandSection id="lua-chon" title="Lựa chọn" intro="Vài lựa chọn đi cùng nhau nằm trong một viên xám; mục đang chọn nền trắng, chữ cam.">
          <Sample rules={['Dùng cho 2–5 lựa chọn loại trừ nhau (kỳ thống kê, kiểu biểu đồ). Nhiều hơn thì dùng ô chọn.', 'Không đổi nền mục đang chọn sang màu đậm: chữ cam là đủ.']}>
            <Segmented
              label="Chia theo"
              options={[
                { id: 'day', label: 'Ngày' },
                { id: 'week', label: 'Tuần' },
                { id: 'month', label: 'Tháng' },
              ]}
              value={segment}
              onChange={setSegment}
            />
            <label className="flex items-center gap-2 text-ui text-muted-foreground">
              <input type="checkbox" className="size-4 accent-[var(--primary)]" defaultChecked />
              So với kỳ trước
            </label>
          </Sample>
        </BrandSection>

        <BrandSection id="tab" title="Tab" intro="Tab tách các việc khác nhau trên cùng một trang; tab đang mở có chữ cam và gạch cam phía dưới.">
          <Sample className="block p-0" rules={['Mỗi trang chỉ làm một việc mỗi lúc: hai chức năng khác nhau thì tách thành hai tab.', 'Số đếm bên cạnh tab chỉ hiện khi khác 0.']}>
            <nav aria-label="Ví dụ tab" className="flex gap-1 border-b border-grey-200 px-4">
              {[
                { id: 'new', label: 'Mới', count: 2 },
                { id: 'doing', label: 'Đang làm', count: 3 },
                { id: 'history', label: 'Lịch sử', count: 0 },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={tab === t.id}
                  className={cn(
                    '-mb-px flex h-11 items-center gap-2 rounded-t-md border-b-2 px-4 text-ui outline-none transition-colors hover:bg-grey-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring',
                    tab === t.id ? 'border-primary font-medium text-primary' : 'border-transparent text-muted-foreground',
                  )}
                >
                  {t.label}
                  {t.count > 0 ? <span className="rounded-full bg-grey-100 px-1.5 text-caption text-ink tabular-nums">{t.count}</span> : null}
                </button>
              ))}
            </nav>
            <p className="p-6 text-ui text-muted-foreground">Nội dung của tab đang mở.</p>
          </Sample>
        </BrandSection>

        <BrandSection id="nhan" title="Nhãn trạng thái" intro="Nhãn nhỏ cho trạng thái của một thứ: màu đi kèm chữ, không bao giờ chỉ có màu.">
          <Sample rules={['Trạng thái đơn luôn dùng đúng nhãn của đơn để khách, quán và quản trị viên nhìn giống nhau.', 'Không dùng màu trạng thái (xanh, vàng, đỏ) cho thứ không phải trạng thái.']}>
            {ORDER_STATUSES.map((s) => (
              <OrderStatusBadge key={s} status={s} />
            ))}
            <Badge variant="secondary">Nháp</Badge>
            <Badge variant="outline">Đã tắt</Badge>
          </Sample>
        </BrandSection>

        <BrandSection id="bang" title="Bảng và phân trang" intro="Bảng không khung riêng, kẻ dòng mảnh, tên cột xám nhỏ; dưới bảng là số dòng và các nút chuyển trang.">
          <Sample
            className="block p-0"
            rules={['Số tiền và số đếm căn phải, cùng độ rộng chữ số.', 'Mỗi trang 25 dòng; người xem đổi được 50 hoặc 75.', 'Bảng số liệu đặt trên nền be; bảng danh sách có viền mảnh.']}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn</TableHead>
                  <TableHead>Khách</TableHead>
                  <TableHead>Món</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Tổng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ORDERS.map((o) => (
                  <TableRow key={o.code}>
                    <TableCell className="font-medium">{o.code}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{o.items}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{vnd(o.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination paging={paging} total={132} className="border-t border-grey-200 px-4 py-3" />
          </Sample>
        </BrandSection>

        <BrandSection id="so-lieu" title="Số liệu và biểu đồ" intro="Số liệu và biểu đồ nằm trên nền be để nổi lên giữa các phần khác. Biểu đồ đổi được số liệu, kiểu cột, đường hoặc bảng.">
          <StatsPanel>
            <StatRow>
              <StatTile label="Đơn đã giao" value="47" hint="+12% so với kỳ trước" />
              <StatTile label="Doanh thu" value="6.631.000 ₫" hint="+8% so với kỳ trước" />
              <StatTile label="Giá trị đơn trung bình" value="141.085 ₫" />
            </StatRow>
          </StatsPanel>
          <StatsPanel>
            <Toolbar className="justify-between">
              <h3 className="text-h3 font-medium">Doanh thu 7 ngày</h3>
              <Segmented
                label="Kiểu biểu đồ"
                options={[
                  { id: 'bar', label: 'Cột' },
                  { id: 'line', label: 'Đường' },
                ]}
                value={kind}
                onChange={setKind}
              />
            </Toolbar>
            <TimeChart
              ariaLabel="Doanh thu 7 ngày, so với tuần trước"
              kind={kind}
              format={vnd}
              series={[
                { key: 'now', label: 'Tuần này' },
                { key: 'before', label: 'Tuần trước' },
              ]}
              points={WEEK}
            />
          </StatsPanel>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-ui text-ink marker:text-primary">
            <li>Màu chuỗi theo thứ tự cố định: cam, xanh dương, xanh ngọc. Một chuỗi giữ màu của nó dù đổi bộ lọc.</li>
            <li>Một trục duy nhất bắt đầu từ 0; từ hai chuỗi trở lên luôn có chú thích.</li>
            <li>Bộ lọc thời gian nằm một hàng trên đầu trang và áp cho mọi biểu đồ, bảng bên dưới.</li>
          </ul>
        </BrandSection>

        <BrandSection id="khoang-cach" title="Khoảng cách" intro="Thứ đi cùng nhau đứng sát; các nhóm khác nhau đứng xa, để mắt thấy ngay đâu là một cụm.">
          <Sample
            className="flex-col items-start gap-6"
            rules={['Trong một cụm thao tác (tìm kiếm và lọc, Lưu và Huỷ): cách nhau 8 px.', 'Giữa các cụm trên cùng một hàng: 24 px.', 'Giữa các phần của trang: 48 px.']}
          >
            <Toolbar>
              <ActionGroup>
                <Input className="w-56" placeholder="Tìm đơn" aria-label="Tìm đơn" />
                <Button variant="secondary">Lọc</Button>
              </ActionGroup>
              <ActionGroup>
                <Button>Lưu</Button>
                <Button variant="ghost">Huỷ</Button>
              </ActionGroup>
            </Toolbar>
          </Sample>
        </BrandSection>
      </div>
    </BrandFrame>
  )
}
