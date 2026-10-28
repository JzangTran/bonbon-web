import { PlusIcon, SearchIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ORDER_STATUSES, OrderStatusBadge } from '@/entities/order'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ActionGroup, StatRow, StatsPanel, StatTile } from '@/shared/ui/section'
import { Textarea } from '@/shared/ui/textarea'
import { ChartDemo, OrdersTable, PaginationDemo, SegmentedDemo, TabsDemo } from './demos'

export type ComponentDoc = {
  slug: string
  name: string
  group: string
  /** one sentence: what it is */
  summary: string
  /** when to use it, and what to use instead */
  when: ReactNode
  example: { demo: ReactNode; code: string }
  types?: { name: string; text: ReactNode; demo: ReactNode }[]
  behavior?: { title: string; text: ReactNode; demo?: ReactNode }[]
  layout?: { text: ReactNode[]; rules: { ok: boolean; caption: string; demo: ReactNode }[] }
  accessibility?: { title: string; text: ReactNode }[]
  content?: { title: string; text: ReactNode }[]
}

const field = 'flex w-full max-w-sm flex-col gap-2'
const star = (
  <span aria-hidden="true" className="text-destructive">
    *
  </span>
)

// ---------------------------------------------------------------- the components

export const COMPONENTS: ComponentDoc[] = [
  {
    slug: 'nut',
    name: 'Nút',
    group: 'Thao tác',
    summary: 'Nút thực hiện một hành động.',
    when: (
      <>
        Dùng nút cho việc làm thay đổi một thứ gì đó: nhận đơn, lưu, gửi, chuyển sang bước sau. Muốn đưa người xem sang trang khác thì dùng{' '}
        <a href="/bo-nhan-dien/components/lien-ket" className="text-link">
          liên kết
        </a>
        .
      </>
    ),
    example: {
      demo: <Button>Nhận đơn</Button>,
      code: `import { Button } from '@/shared/ui/button'\n\n<Button onClick={confirm}>Nhận đơn</Button>`,
    },
    types: [
      { name: 'Nút chính', text: 'Nền màu mực. Dành cho hành động quan trọng nhất của một vùng; mỗi vùng chỉ có một.', demo: <Button>Lưu</Button> },
      { name: 'Nút phụ', text: 'Nền xám nhạt. Cho hành động đi kèm nút chính hoặc nhiều hành động ngang hàng.', demo: <Button variant="secondary">Lưu nháp</Button> },
      { name: 'Nút chữ', text: 'Không nền, chữ xám. Cho hành động ít quan trọng hoặc lặp lại nhiều lần trong danh sách, như Huỷ hay Bỏ qua.', demo: <Button variant="ghost">Bỏ qua</Button> },
      { name: 'Nút nguy hiểm', text: 'Nền đỏ. Chỉ cho hành động không hoàn tác được, như từ chối đơn hay xoá tài khoản; thường đi qua một bước xác nhận.', demo: <Button variant="destructive">Từ chối đơn</Button> },
      {
        name: 'Nút có biểu tượng',
        text: 'Biểu tượng đứng trước chữ, giúp nhận ra hành động nhanh hơn. Biểu tượng không thay được chữ, trừ nút rất quen như đóng.',
        demo: (
          <Button>
            <PlusIcon />
            Thêm món
          </Button>
        ),
      },
    ],
    behavior: [
      {
        title: 'Rê chuột và chọn',
        text: 'Nút chính đậm hơn một chút khi rê chuột. Nút phụ, nút chữ, tab và mục menu có nền xám nhẹ và chữ đen khi rê chuột, dù đang được chọn hay không.',
        demo: (
          <>
            <Button variant="secondary">Lưu nháp</Button>
            <Button variant="ghost">Bỏ qua</Button>
          </>
        ),
      },
      {
        title: 'Đang xử lý và không dùng được',
        text: 'Khi đang gửi, nút mờ đi, đổi chữ (Đang gửi…) và không bấm được lần nữa, để không tạo hai đơn. Nút không dùng được cũng mờ; hãy nói lý do ngay cạnh nó.',
        demo: <Button disabled>Đang gửi…</Button>,
      },
    ],
    layout: {
      text: [
        'Mỗi vùng chỉ một nút chính cho việc quan trọng nhất. Các nút còn lại dùng nút phụ hoặc nút chữ để không rối mắt.',
        'Nút chính đứng trước (bên trái) các nút khác. Các nút đi cùng nhau cách nhau 8 px.',
      ],
      rules: [
        {
          ok: true,
          caption: 'Làm nổi nút chính',
          demo: (
            <ActionGroup>
              <Button>Lưu</Button>
              <Button variant="ghost">Huỷ</Button>
            </ActionGroup>
          ),
        },
        {
          ok: false,
          caption: 'Không để hành động phụ nặng ngang nút chính',
          demo: (
            <ActionGroup>
              <Button>Lưu</Button>
              <Button>Huỷ</Button>
            </ActionGroup>
          ),
        },
      ],
    },
    accessibility: [
      { title: 'Độ tương phản', text: 'Chữ trên nút đạt tối thiểu 4,5:1 với nền ở mọi trạng thái; biểu tượng đạt 3:1. Nút không dùng được không cần đạt.' },
      { title: 'Nút chỉ có biểu tượng', text: 'Luôn có aria-label nói việc nó làm (ví dụ "Đóng", "Mở menu"), vì trình đọc màn hình không đọc được hình.' },
      { title: 'Bàn phím', text: 'Nút nhận Tab và bấm bằng Enter hoặc Space; vòng viền khi chọn bằng bàn phím luôn hiện, không bị ẩn.' },
    ],
    content: [
      { title: 'Bắt đầu bằng động từ', text: 'Viết việc sẽ xảy ra: "Nhận đơn", "Thêm món", "Gửi yêu cầu". Ngắn, viết hoa chữ đầu, không dấu chấm cuối.' },
      { title: 'Trả lời đúng câu hỏi của tiêu đề', text: 'Hộp "Xoá món này?" có nút "Xoá" và "Huỷ", không phải "Đồng ý" và "Không".' },
      { title: 'Huỷ khác Đóng', text: '"Huỷ" dừng việc đang làm và bỏ thay đổi. "Đóng" chỉ đóng một thông tin không cần làm gì.' },
    ],
  },
  {
    slug: 'lien-ket',
    name: 'Liên kết',
    group: 'Thao tác',
    summary: 'Liên kết đưa người xem tới một trang hoặc một phần khác.',
    when: 'Dùng liên kết trong câu chữ để dẫn sang nơi khác. Muốn làm một việc (lưu, gửi, xoá) thì dùng nút.',
    example: {
      demo: (
        <p className="text-body">
          Đọc{' '}
          <a href="/bo-nhan-dien" className="text-link">
            quy tắc sử dụng logo
          </a>{' '}
          trước khi in logo lên bao bì.
        </p>
      ),
      code: `<a href="/bo-nhan-dien" className="text-link">quy tắc sử dụng logo</a>`,
    },
    behavior: [
      { title: 'Rê chuột', text: 'Gạch chân cam dày lên. Chữ không đổi màu và không xê dịch, vì độ dày tăng xuống phía dưới từ một khoảng cách cố định.' },
      { title: 'Giữ màu chữ xung quanh', text: 'Liên kết trong đoạn văn màu đen; trong chữ chú thích màu xám. Gạch chân cam là dấu hiệu duy nhất.' },
    ],
    layout: {
      text: ['Mục điều hướng (menu, breadcrumb, thanh bên, tab) không phải liên kết trong câu chữ: chúng không gạch chân mà đổi nền khi rê chuột.'],
      rules: [
        {
          ok: true,
          caption: 'Gạch chữ nói rõ nơi sẽ tới',
          demo: (
            <p className="text-ui">
              Xem{' '}
              <a href="/huong-dan" className="text-link">
                hướng dẫn mở quán
              </a>
            </p>
          ),
        },
        {
          ok: false,
          caption: 'Không gạch những chữ không nói gì',
          demo: (
            <p className="text-ui">
              Hướng dẫn mở quán:{' '}
              <a href="/huong-dan" className="text-link">
                bấm vào đây
              </a>
            </p>
          ),
        },
      ],
    },
    accessibility: [
      { title: 'Không dựa vào màu', text: 'Gạch chân luôn hiện, không chỉ khi rê chuột, để người không phân biệt màu vẫn thấy.' },
      { title: 'Mở trang mới', text: 'Liên kết mở thẻ mới thì nói rõ trong chữ hoặc có biểu tượng mũi tên chéo, và có rel="noreferrer".' },
    ],
    content: [{ title: 'Chữ của liên kết tự đủ nghĩa', text: 'Người dùng trình đọc màn hình thường nghe danh sách liên kết riêng; "bấm vào đây" không nói gì.' }],
  },
  {
    slug: 'o-nhap',
    name: 'Ô nhập',
    group: 'Nhập liệu',
    summary: 'Ô nhập cho người dùng gõ một đoạn chữ hoặc số.',
    when: 'Dùng cho thông tin người dùng tự gõ: tên quán, số điện thoại, ghi chú. Khi chỉ có vài lựa chọn biết trước, dùng lựa chọn nhanh hoặc ô chọn.',
    example: {
      demo: (
        <div className={field}>
          <Label htmlFor="ex-shop">{star} Tên quán</Label>
          <Input id="ex-shop" placeholder="Ví dụ: Mì Cay Cay" />
        </div>
      ),
      code: `<Label htmlFor="shop">Tên quán</Label>\n<Input id="shop" maxLength={100} showCount value={name} onChange={...} />`,
    },
    types: [
      {
        name: 'Một dòng',
        text: 'Cho tên, số, email. Có thể hiện số ký tự đã gõ ở góc phải (showCount).',
        demo: (
          <div className={field}>
            <Label htmlFor="ex-1">Tên món</Label>
            <Input id="ex-1" showCount maxLength={60} value="Mì cay hải sản" readOnly />
          </div>
        ),
      },
      {
        name: 'Nhiều dòng',
        text: 'Cho ghi chú, mô tả, nội dung phản hồi.',
        demo: (
          <div className={field}>
            <Label htmlFor="ex-2">Ghi chú cho quán</Label>
            <Textarea id="ex-2" rows={3} placeholder="Ví dụ: gọi điện khi tới sảnh" />
          </div>
        ),
      },
      {
        name: 'Ô tìm kiếm',
        text: 'Viên thuốc có biểu tượng kính lúp; kết quả lọc ngay khi gõ.',
        demo: (
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input className="rounded-full pl-9" placeholder="Tìm đơn" aria-label="Tìm đơn" />
          </div>
        ),
      },
    ],
    behavior: [
      {
        title: 'Lỗi',
        text: 'Kiểm tra khi người dùng rời ô hoặc bấm gửi, không phải khi đang gõ. Lỗi hiện ngay dưới ô, bằng một câu nói cách sửa.',
        demo: (
          <div className={field}>
            <Label htmlFor="ex-3">Số điện thoại</Label>
            <Input id="ex-3" defaultValue="0912" aria-invalid aria-describedby="ex-3-err" />
            <p id="ex-3-err" className="text-small text-destructive">
              Số điện thoại cần 10 chữ số, bắt đầu bằng 0.
            </p>
          </div>
        ),
      },
    ],
    layout: {
      text: ['Nhãn đặt trên ô, sát ô (8 px). Các ô của một biểu mẫu cách nhau 20 px; nhóm ô khác chủ đề cách xa hơn, có tiêu đề nhỏ.'],
      rules: [
        {
          ok: true,
          caption: 'Đánh dấu ô bắt buộc bằng * đỏ trước nhãn',
          demo: (
            <div className={field}>
              <Label htmlFor="ex-4">{star} Email nhận trả lời</Label>
              <Input id="ex-4" placeholder="ban@email.com" />
            </div>
          ),
        },
        {
          ok: false,
          caption: 'Không dùng chữ mờ trong ô thay cho nhãn',
          demo: (
            <div className={field}>
              <Input placeholder="Email nhận trả lời (bắt buộc)" aria-label="Email" />
            </div>
          ),
        },
      ],
    },
    accessibility: [
      { title: 'Nhãn gắn với ô', text: 'Mỗi ô có Label với htmlFor trùng id của ô, để bấm vào nhãn là vào ô và trình đọc màn hình đọc đúng tên.' },
      { title: 'Lỗi đọc được', text: 'Ô lỗi có aria-invalid và aria-describedby trỏ tới câu lỗi.' },
    ],
    content: [
      { title: 'Nhãn ngắn, gọi đúng tên thứ cần nhập', text: '"Số điện thoại", không phải "Vui lòng nhập số điện thoại của bạn".' },
      { title: 'Chữ mờ là ví dụ', text: 'Đặt một ví dụ thật trong ô ("Ví dụ: Mì Cay Cay"), không lặp lại nhãn.' },
    ],
  },
  {
    slug: 'lua-chon-nhanh',
    name: 'Lựa chọn nhanh',
    group: 'Nhập liệu',
    summary: 'Một viên xám chứa vài lựa chọn loại trừ nhau; chọn một là đổi ngay.',
    when: 'Dùng cho 2–5 lựa chọn ngắn đổi cách xem dữ liệu: kỳ thống kê, kiểu biểu đồ, cách sắp xếp. Nhiều lựa chọn hơn thì dùng ô chọn; bật/tắt một thứ thì dùng hộp kiểm.',
    example: { demo: <SegmentedDemo />, code: `import { Segmented } from '@/shared/ui/section'\n\n<Segmented label="Chia theo" options={[{ id: 'day', label: 'Ngày' }, ...]} value={step} onChange={setStep} />` },
    behavior: [
      { title: 'Chọn', text: 'Mục đang chọn có nền trắng và chữ cam. Các mục khác chữ xám; rê chuột thì nền xám đậm hơn một chút và chữ đen. Dữ liệu bên dưới đổi ngay, không cần nút Áp dụng.' },
    ],
    layout: {
      text: ['Đặt trong hàng bộ lọc trên đầu trang hoặc trên đầu một biểu đồ. Nhiều viên trên một hàng cách nhau 24 px.'],
      rules: [
        { ok: true, caption: 'Chữ ngắn, vài lựa chọn', demo: <SegmentedDemo /> },
        {
          ok: false,
          caption: 'Không nhồi nhiều lựa chọn dài',
          demo: (
            <div className="inline-flex flex-wrap gap-0.5 rounded-full bg-grey-100 p-0.5 text-small">
              {['Hôm nay', '7 ngày gần nhất', '30 ngày gần nhất', 'Quý này', 'Năm nay', 'Tuỳ chọn khoảng'].map((t) => (
                <span key={t} className="rounded-full px-3 py-1 text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          ),
        },
      ],
    },
    accessibility: [{ title: 'Nhóm có tên', text: 'Cả viên là một radiogroup có aria-label; mỗi lựa chọn là radio với aria-checked.' }],
    content: [{ title: 'Một hai từ', text: '"Ngày", "Tuần", "Tháng". Không lặp lại tên nhóm trong từng lựa chọn.' }],
  },
  {
    slug: 'tab',
    name: 'Tab',
    group: 'Điều hướng',
    summary: 'Tab chia một trang thành các phần khác nhau, xem từng phần một.',
    when: 'Dùng khi một trang có hai việc hoặc hai nhóm nội dung khác nhau, như "Sao kê" và "Sổ cái". Hai thứ cần nhìn cùng lúc thì đừng tách tab.',
    example: { demo: <TabsDemo />, code: `<PageTabs label="Đơn hàng" tabs={[{ id: 'new', label: 'Mới', count: 2 }, ...]} value={tab} onValueChange={setTab} />` },
    types: [
      { name: 'Tab có số đếm', text: 'Số đếm cạnh tên cho biết có bao nhiêu việc đang chờ; ẩn khi bằng 0.', demo: <TabsDemo /> },
      { name: 'Tab thường', text: 'Khi các phần không có gì để đếm.', demo: <TabsDemo withCounts={false} /> },
    ],
    behavior: [{ title: 'Chọn tab', text: 'Tab đang mở có chữ cam và gạch cam phía dưới. Rê chuột lên bất kỳ tab nào: nền xám nhẹ và chữ đen.' }],
    layout: {
      text: ['Hàng tab nằm ngay trên nội dung nó điều khiển, kéo dài hết chiều ngang, có đường kẻ mảnh phía dưới.'],
      rules: [
        { ok: true, caption: 'Mỗi tab một việc', demo: <TabsDemo withCounts={false} /> },
        {
          ok: false,
          caption: 'Không dùng tab cho từng bước của một quy trình',
          demo: (
            <div className="flex gap-1 rounded-lg bg-white px-2 text-ui text-muted-foreground">
              {['Bước 1', 'Bước 2', 'Bước 3'].map((t, i) => (
                <span key={t} className={cn('border-b-2 px-4 py-3', i === 0 ? 'border-primary text-primary' : 'border-transparent')}>
                  {t}
                </span>
              ))}
            </div>
          ),
        },
      ],
    },
    accessibility: [{ title: 'Vai trò', text: 'Hàng tab là tablist; mỗi tab là tab với aria-selected. Tab là đường dẫn riêng thì dùng liên kết với aria-current="page".' }],
    content: [{ title: 'Tên tab là danh từ ngắn', text: '"Mới", "Đang làm", "Lịch sử". Không viết động từ, không lặp tên trang.' }],
  },
  {
    slug: 'phan-trang',
    name: 'Phân trang',
    group: 'Điều hướng',
    summary: 'Phân trang chia một danh sách dài thành nhiều trang và cho chọn số dòng mỗi trang.',
    when: 'Dùng dưới mọi bảng và danh sách có thể dài hơn một trang. Danh sách luôn ngắn (dưới 25 dòng) thì không cần.',
    example: { demo: <PaginationDemo />, code: `const paging = usePaging()\n// gửi paging.page, paging.size khi tải dữ liệu\n<Pagination paging={paging} total={data.total} />` },
    behavior: [
      { title: 'Số dòng mỗi trang', text: 'Mặc định 25 dòng; người xem chọn được 50 hoặc 75. Đổi số dòng thì quay về trang đầu.' },
      { title: 'Đổi bộ lọc', text: 'Khi bộ lọc hoặc ô tìm kiếm đổi, danh sách quay về trang đầu (paging.reset()).' },
    ],
    layout: { text: ['Nằm ngay dưới danh sách, chiếm hết chiều ngang: bên trái là vị trí và số dòng, bên phải là các nút chuyển trang.'], rules: [] },
    accessibility: [{ title: 'Nút có tên', text: 'Các nút mũi tên có aria-label (Trang đầu, Trang trước…); trang hiện tại có aria-current="page".' }],
  },
  {
    slug: 'nhan-trang-thai',
    name: 'Nhãn trạng thái',
    group: 'Hiển thị',
    summary: 'Nhãn nhỏ cho biết một thứ đang ở trạng thái nào.',
    when: 'Dùng cho trạng thái của đơn, phiếu hỗ trợ, khu vực. Không dùng làm nút hay để trang trí.',
    example: { demo: <OrderStatusBadge status="PREPARING" />, code: `<OrderStatusBadge status={order.status} />` },
    types: [
      {
        name: 'Trạng thái đơn',
        text: 'Mỗi trạng thái có một màu cố định. Khách, quán và quản trị viên luôn thấy cùng một nhãn.',
        demo: (
          <div className="flex flex-wrap justify-center gap-2">
            {ORDER_STATUSES.map((s) => (
              <OrderStatusBadge key={s} status={s} />
            ))}
          </div>
        ),
      },
      {
        name: 'Nhãn trung tính',
        text: 'Cho trạng thái không cần màu: nháp, đã tắt.',
        demo: (
          <>
            <Badge variant="secondary">Nháp</Badge>
            <Badge variant="outline">Đã tắt</Badge>
          </>
        ),
      },
    ],
    layout: {
      text: ['Đặt cạnh tên của thứ nó mô tả, hoặc trong cột Trạng thái của bảng.'],
      rules: [
        { ok: true, caption: 'Màu đi kèm chữ', demo: <OrderStatusBadge status="DELIVERED" /> },
        { ok: false, caption: 'Không chỉ dùng màu', demo: <span className="size-3 rounded-full bg-success" aria-label="Đã giao" /> },
      ],
    },
    accessibility: [{ title: 'Không dựa vào màu', text: 'Chữ trong nhãn tự nói trạng thái; màu chỉ giúp nhìn nhanh.' }],
    content: [{ title: 'Ngắn, nói trạng thái', text: '"Đang chuẩn bị", "Đã giao". Không viết câu.' }],
  },
  {
    slug: 'bang',
    name: 'Bảng',
    group: 'Hiển thị',
    summary: 'Bảng xếp nhiều dòng cùng loại thành cột để so sánh.',
    when: 'Dùng khi người xem cần so sánh nhiều thứ theo cùng các thuộc tính: đơn, quán, khoản tiền. Ít cột và mỗi dòng nhiều chữ thì dùng danh sách thẻ.',
    example: { demo: <OrdersTable />, code: `<Table>\n  <TableHeader>...</TableHeader>\n  <TableBody>{rows.map(...)}</TableBody>\n</Table>\n<Pagination paging={paging} total={total} />` },
    layout: {
      text: [
        'Bảng không có khung riêng; trang đặt một viền mảnh quanh bảng danh sách, hoặc nền be quanh bảng số liệu. Dòng cách nhau bằng đường kẻ mảnh.',
        'Số tiền và số đếm căn phải, chữ số cùng độ rộng; chữ căn trái. Dưới bảng luôn có phân trang.',
      ],
      rules: [
        { ok: true, caption: 'Số căn phải, trạng thái dùng nhãn', demo: <OrdersTable /> },
        { ok: false, caption: 'Không để số lệch và mã trạng thái thô', demo: <OrdersTable messy /> },
      ],
    },
    accessibility: [{ title: 'Tiêu đề cột thật', text: 'Dùng thead và th để trình đọc màn hình đọc tên cột cùng giá trị.' }],
    content: [{ title: 'Tên cột ngắn', text: '"Tổng", "Khách", "Gửi lúc". Đơn vị đặt trong giá trị (129.000 ₫), không trong tên cột.' }],
  },
  {
    slug: 'so-lieu',
    name: 'Ô số liệu',
    group: 'Hiển thị',
    summary: 'Ô số liệu đưa một con số quan trọng lên đầu, kèm so sánh.',
    when: 'Dùng ở đầu trang thống kê cho vài con số chính. Nhiều con số cần so với nhau theo thời gian thì dùng biểu đồ.',
    example: {
      demo: (
        <StatsPanel className="w-full">
          <StatRow>
            <StatTile label="Đơn đã giao" value="47" hint="+12% so với kỳ trước" />
            <StatTile label="Doanh thu" value="6.631.000 ₫" hint="+8% so với kỳ trước" />
            <StatTile label="Giá trị đơn trung bình" value="141.085 ₫" />
          </StatRow>
        </StatsPanel>
      ),
      code: `<StatsPanel>\n  <StatRow>\n    <StatTile label="Đơn đã giao" value="47" hint="+12% so với kỳ trước" />\n  </StatRow>\n</StatsPanel>`,
    },
    layout: {
      text: ['Ô số liệu luôn nằm trên nền be để tách khỏi biểu mẫu và danh sách. Tối đa 3–4 ô một hàng, ngăn bằng đường kẻ mảnh.'],
      rules: [],
    },
    content: [
      { title: 'Nhãn nói con số là gì', text: '"Đơn đã giao", không chỉ "Đơn". Thêm khoảng thời gian vào hàng bộ lọc, không lặp lại trong từng ô.' },
      { title: 'So sánh có mốc', text: '"+12% so với kỳ trước", không chỉ "+12%".' },
    ],
  },
  {
    slug: 'bieu-do',
    name: 'Biểu đồ',
    group: 'Hiển thị',
    summary: 'Biểu đồ cho thấy một con số thay đổi thế nào theo thời gian.',
    when: 'Dùng khi xu hướng quan trọng hơn từng con số: doanh thu theo ngày, tỷ lệ đơn lỗi theo tuần. Chỉ một con số thì dùng ô số liệu.',
    example: { demo: <ChartDemo />, code: `<ChartPanel title="Theo ngày" metrics={METRICS} current={buckets} previous={compare ? before : undefined}\n  label={(b) => shortLabel(b.start)} full={(b) => periodLabel(b.start)} />` },
    types: [
      { name: 'Cột', text: 'So sánh độ lớn giữa các kỳ. Mặc định cho doanh thu, số đơn.', demo: <ChartDemo kind="bar" compare={false} /> },
      { name: 'Đường', text: 'Nhấn vào xu hướng, hợp với tỷ lệ hoặc nhiều kỳ.', demo: <ChartDemo kind="line" compare={false} /> },
    ],
    behavior: [
      { title: 'Xem từng kỳ', text: 'Rê chuột hoặc dùng phím mũi tên trên biểu đồ để hiện giá trị của mọi chuỗi tại kỳ đó.' },
      { title: 'Bộ lọc chung', text: 'Khoảng thời gian, chia theo ngày/tuần/tháng và so với kỳ trước nằm một hàng trên đầu trang, áp cho mọi biểu đồ và bảng bên dưới. Mỗi biểu đồ tự chọn số liệu và kiểu Cột/Đường/Bảng.' },
    ],
    layout: {
      text: ['Biểu đồ nằm trên nền be. Một trục duy nhất bắt đầu từ 0; từ hai chuỗi trở lên có chú thích ở trên.'],
      rules: [
        { ok: true, caption: 'Màu chuỗi cố định: cam, xanh dương, xanh ngọc', demo: <ChartDemo /> },
        {
          ok: false,
          caption: 'Không dùng hai trục cho hai đơn vị khác nhau',
          demo: <p className="max-w-xs text-center text-ui text-muted-foreground">Doanh thu (₫) và số đơn trên cùng một biểu đồ hai trục: tách thành hai biểu đồ.</p>,
        },
      ],
    },
    accessibility: [
      { title: 'Luôn có dạng bảng', text: 'Nút Bảng hiện cùng số liệu dạng bảng cho người không xem được biểu đồ.' },
      { title: 'Màu đã kiểm tra', text: 'Ba màu chuỗi được kiểm tra cho người mù màu trên nền be; chữ và nhãn không dùng màu của chuỗi.' },
    ],
  },
]

export const COMPONENT_GROUPS = ['Thao tác', 'Nhập liệu', 'Điều hướng', 'Hiển thị']
