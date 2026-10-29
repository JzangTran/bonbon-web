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
import { ChartDemo, PaginationDemo, SampleTable, SegmentedDemo, TabsDemo } from './demos'
import { t, tx } from '@/shared/i18n'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

export type ComponentDoc = {
  slug: string
  name: string
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
    slug: 'button',
    name: 'Button',
    summary: t('Nút thực hiện một hành động.'),
    when: (
      <>
        {t('Dùng nút cho việc làm thay đổi một thứ gì đó: nhận đơn, lưu, gửi, chuyển sang bước sau. Muốn đưa người xem sang trang khác thì dùng')}{' '}
        <a href="/resources/design/components/text-link" className="text-link">
          {t('liên kết')}
        </a>
        .
      </>
    ),
    example: {
      demo: <Button>Button</Button>,
      code: `import { Button } from '@/shared/ui/button'

<Button onClick={…}>Button</Button>`,
    },
    types: [
      { name: t('Nút chính'), text: t('Nền màu mực. Dành cho hành động quan trọng nhất của một vùng; mỗi vùng chỉ có một.'), demo: <Button>Button</Button> },
      { name: t('Nút phụ'), text: t('Nền xám nhạt. Cho hành động đi kèm nút chính hoặc nhiều hành động ngang hàng.'), demo: <Button variant="secondary">Button</Button> },
      { name: t('Nút chữ'), text: t('Không nền, chữ xám. Cho hành động ít quan trọng hoặc lặp lại nhiều lần trong danh sách, như Huỷ hay Bỏ qua.'), demo: <Button variant="ghost">Button</Button> },
      { name: t('Nút nguy hiểm'), text: t('Nền đỏ. Chỉ cho hành động không hoàn tác được, như từ chối đơn hay xoá tài khoản; thường đi qua một bước xác nhận.'), demo: <Button variant="destructive">Button</Button> },
      {
        name: t('Nút có biểu tượng'),
        text: t('Biểu tượng đứng trước chữ, giúp nhận ra hành động nhanh hơn. Biểu tượng không thay được chữ, trừ nút rất quen như đóng.'),
        demo: (
          <Button>
            <PlusIcon />
            Button
          </Button>
        ),
      },
    ],
    behavior: [
      {
        title: t('Rê chuột và chọn'),
        text: t('Nút chính đậm hơn một chút khi rê chuột. Nút phụ, nút chữ, tab và mục menu có nền xám nhẹ và chữ đen khi rê chuột, dù đang được chọn hay không.'),
        demo: (
          <>
            <Button variant="secondary">Button</Button>
            <Button variant="ghost">Button</Button>
          </>
        ),
      },
      {
        title: t('Đang xử lý và không dùng được'),
        text: t('Khi đang gửi, nút mờ đi, đổi chữ (Đang gửi…) và không bấm được lần nữa, để không tạo hai đơn. Nút không dùng được cũng mờ; hãy nói lý do ngay cạnh nó.'),
        demo: <Button disabled>Button</Button>,
      },
    ],
    layout: {
      text: [
        t('Mỗi vùng chỉ một nút chính cho việc quan trọng nhất. Các nút còn lại dùng nút phụ hoặc nút chữ để không rối mắt.'),
        t('Nút chính đứng trước (bên trái) các nút khác. Các nút đi cùng nhau cách nhau 8 px.'),
      ],
      rules: [
        {
          ok: true,
          caption: t('Làm nổi nút chính'),
          demo: (
            <ActionGroup>
              <Button>Button</Button>
              <Button variant="ghost">Button</Button>
            </ActionGroup>
          ),
        },
        {
          ok: false,
          caption: t('Không để hành động phụ nặng ngang nút chính'),
          demo: (
            <ActionGroup>
              <Button>Button</Button>
              <Button>Button</Button>
            </ActionGroup>
          ),
        },
      ],
    },
    accessibility: [
      { title: t('Độ tương phản'), text: t('Chữ trên nút đạt tối thiểu 4,5:1 với nền ở mọi trạng thái; biểu tượng đạt 3:1. Nút không dùng được không cần đạt.') },
      { title: t('Nút chỉ có biểu tượng'), text: t('Luôn có aria-label nói việc nó làm (ví dụ "Đóng", "Mở menu"), vì trình đọc màn hình không đọc được hình.') },
      { title: t('Bàn phím'), text: t('Nút nhận Tab và bấm bằng Enter hoặc Space; vòng viền khi chọn bằng bàn phím luôn hiện, không bị ẩn.') },
    ],
    content: [
      { title: t('Bắt đầu bằng động từ'), text: t('Viết việc sẽ xảy ra: "Nhận đơn", "Thêm món", "Gửi yêu cầu". Ngắn, viết hoa chữ đầu, không dấu chấm cuối.') },
      { title: t('Trả lời đúng câu hỏi của tiêu đề'), text: t('Hộp "Xoá món này?" có nút "Xoá" và "Huỷ", không phải "Đồng ý" và "Không".') },
      { title: t('Huỷ khác Đóng'), text: t('"Huỷ" dừng việc đang làm và bỏ thay đổi. "Đóng" chỉ đóng một thông tin không cần làm gì.') },
    ],
  },
  {
    slug: 'text-link',
    name: 'TextLink',
    summary: t('Liên kết đưa người xem tới một trang hoặc một phần khác.'),
    when: t('Dùng liên kết trong câu chữ để dẫn sang nơi khác. Muốn làm một việc (lưu, gửi, xoá) thì dùng nút.'),
    example: {
      demo: (
        <p className="text-body">
          A{' '}
          <a href="#example" className="text-link">
            link
          </a>{' '}
          in a sentence
        </p>
      ),
      code: `<a href="…" className="text-link">link</a>`,
    },
    behavior: [
      { title: t('Rê chuột'), text: t('Gạch chân cam dày lên. Chữ không đổi màu và không xê dịch, vì độ dày tăng xuống phía dưới từ một khoảng cách cố định.') },
      { title: t('Giữ màu chữ xung quanh'), text: t('Liên kết trong đoạn văn màu đen; trong chữ chú thích màu xám. Gạch chân cam là dấu hiệu duy nhất.') },
    ],
    layout: {
      text: [t('Mục điều hướng (menu, breadcrumb, thanh bên, tab) không phải liên kết trong câu chữ: chúng không gạch chân mà đổi nền khi rê chuột.')],
      rules: [
        {
          ok: true,
          caption: t('Gạch chữ nói rõ nơi sẽ tới'),
          demo: (
            <p className="text-ui">
              {t('Xem')}{' '}
              <a href="/guides" className="text-link">
                {t('hướng dẫn mở quán')}
              </a>
            </p>
          ),
        },
        {
          ok: false,
          caption: t('Không gạch những chữ không nói gì'),
          demo: (
            <p className="text-ui">
              {t('Hướng dẫn mở quán:')}{' '}
              <a href="/guides" className="text-link">
                {t('bấm vào đây')}
              </a>
            </p>
          ),
        },
      ],
    },
    accessibility: [
      { title: t('Không dựa vào màu'), text: t('Gạch chân luôn hiện, không chỉ khi rê chuột, để người không phân biệt màu vẫn thấy.') },
      { title: t('Mở trang mới'), text: t('Liên kết mở thẻ mới thì nói rõ trong chữ hoặc có biểu tượng mũi tên chéo, và có rel="noreferrer".') },
    ],
    content: [{ title: t('Chữ của liên kết tự đủ nghĩa'), text: t('Người dùng trình đọc màn hình thường nghe danh sách liên kết riêng; "bấm vào đây" không nói gì.') }],
  },
  {
    slug: 'input',
    name: 'Input',
    summary: t('Ô nhập cho người dùng gõ một đoạn chữ hoặc số.'),
    when: t('Dùng cho thông tin người dùng tự gõ: tên quán, số điện thoại, ghi chú. Khi chỉ có vài lựa chọn biết trước, dùng lựa chọn nhanh hoặc ô chọn.'),
    example: {
      demo: (
        <div className={field}>
          <Label htmlFor="ex-shop">Label</Label>
          <Input id="ex-shop" placeholder="Placeholder" />
        </div>
      ),
      code: `import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

<Label htmlFor="name">Label</Label>
<Input id="name" maxLength={100} showCount value={value} onChange={…} />`,
    },
    types: [
      {
        name: t('Một dòng'),
        text: t('Cho tên, số, email. Có thể hiện số ký tự đã gõ ở góc phải (showCount).'),
        demo: (
          <div className={field}>
            <Label htmlFor="ex-1">Label</Label>
            <Input id="ex-1" showCount maxLength={60} value="Value" readOnly />
          </div>
        ),
      },
      {
        name: t('Nhiều dòng'),
        text: t('Cho ghi chú, mô tả, nội dung phản hồi.'),
        demo: (
          <div className={field}>
            <Label htmlFor="ex-2">Label</Label>
            <Textarea id="ex-2" rows={3} placeholder="Placeholder" />
          </div>
        ),
      },
      {
        name: t('Ô tìm kiếm'),
        text: t('Viên thuốc có biểu tượng kính lúp; kết quả lọc ngay khi gõ.'),
        demo: (
          <div className="relative w-full max-w-sm">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input className="rounded-full pl-9" placeholder="Search" aria-label="Search" />
          </div>
        ),
      },
    ],
    behavior: [
      {
        title: t('Lỗi'),
        text: t('Kiểm tra khi người dùng rời ô hoặc bấm gửi, không phải khi đang gõ. Lỗi hiện ngay dưới ô, bằng một câu nói cách sửa.'),
        demo: (
          <div className={field}>
            <Label htmlFor="ex-3">Label</Label>
            <Input id="ex-3" defaultValue="Value" aria-invalid aria-describedby="ex-3-err" />
            <p id="ex-3-err" className="text-small text-destructive">
              Error message
            </p>
          </div>
        ),
      },
    ],
    layout: {
      text: [t('Nhãn đặt trên ô, sát ô (8 px). Các ô của một biểu mẫu cách nhau 20 px; nhóm ô khác chủ đề cách xa hơn, có tiêu đề nhỏ.')],
      rules: [
        {
          ok: true,
          caption: t('Đánh dấu ô bắt buộc bằng * đỏ trước nhãn'),
          demo: (
            <div className={field}>
              <Label htmlFor="ex-4">{star} Label</Label>
              <Input id="ex-4" placeholder="Placeholder" />
            </div>
          ),
        },
        {
          ok: false,
          caption: t('Không dùng chữ mờ trong ô thay cho nhãn'),
          demo: (
            <div className={field}>
              <Input placeholder="Label (required)" aria-label="Label" />
            </div>
          ),
        },
      ],
    },
    accessibility: [
      { title: t('Nhãn gắn với ô'), text: t('Mỗi ô có Label với htmlFor trùng id của ô, để bấm vào nhãn là vào ô và trình đọc màn hình đọc đúng tên.') },
      { title: t('Lỗi đọc được'), text: t('Ô lỗi có aria-invalid và aria-describedby trỏ tới câu lỗi.') },
    ],
    content: [
      { title: t('Nhãn ngắn, gọi đúng tên thứ cần nhập'), text: t('"Số điện thoại", không phải "Vui lòng nhập số điện thoại của bạn".') },
      { title: t('Chữ mờ là ví dụ'), text: t('Đặt một ví dụ thật trong ô ("Ví dụ: Mì Cay Cay"), không lặp lại nhãn.') },
    ],
  },
  {
    slug: 'segmented',
    name: 'Segmented',
    summary: t('Một viên xám chứa vài lựa chọn loại trừ nhau; chọn một là đổi ngay.'),
    when: t('Dùng cho 2–5 lựa chọn ngắn đổi cách xem dữ liệu: kỳ thống kê, kiểu biểu đồ, cách sắp xếp. Nhiều lựa chọn hơn thì dùng ô chọn; bật/tắt một thứ thì dùng hộp kiểm.'),
    example: { demo: <SegmentedDemo />, code: `import { Segmented } from '@/shared/ui/section'

<Segmented label="Segmented" options={[{ id: '1', label: 'Option 1' }, …]} value={value} onChange={setValue} />` },
    behavior: [
      { title: t('Chọn'), text: t('Mục đang chọn có nền trắng và chữ cam. Các mục khác chữ xám; rê chuột thì nền xám đậm hơn một chút và chữ đen. Dữ liệu bên dưới đổi ngay, không cần nút Áp dụng.') },
    ],
    layout: {
      text: [t('Đặt trong hàng bộ lọc trên đầu trang hoặc trên đầu một biểu đồ. Nhiều viên trên một hàng cách nhau 24 px.')],
      rules: [
        { ok: true, caption: t('Chữ ngắn, vài lựa chọn'), demo: <SegmentedDemo /> },
        {
          ok: false,
          caption: t('Không nhồi nhiều lựa chọn dài'),
          demo: (
            <div className="inline-flex flex-wrap gap-0.5 rounded-full bg-grey-100 p-0.5 text-small">
              {['A long option 1', 'A long option 2', 'A long option 3', 'A long option 4', 'A long option 5', 'A long option 6'].map((tItem) => (
                <span key={tItem} className="rounded-full px-3 py-1 text-muted-foreground">
                  {tItem}
                </span>
              ))}
            </div>
          ),
        },
      ],
    },
    accessibility: [{ title: t('Nhóm có tên'), text: t('Cả viên là một radiogroup có aria-label; mỗi lựa chọn là radio với aria-checked.') }],
    content: [{ title: t('Một hai từ'), text: t('"Ngày", "Tuần", "Tháng". Không lặp lại tên nhóm trong từng lựa chọn.') }],
  },
  {
    slug: 'page-tabs',
    name: 'PageTabs',
    summary: t('Tab chia một trang thành các phần khác nhau, xem từng phần một.'),
    when: t('Dùng khi một trang có hai việc hoặc hai nhóm nội dung khác nhau, như "Sao kê" và "Sổ cái". Hai thứ cần nhìn cùng lúc thì đừng tách tab.'),
    example: { demo: <TabsDemo />, code: `import { PageTabs } from '@/shared/ui/workspace-slots'

<PageTabs label="PageTabs" tabs={[{ id: '1', label: 'Tab 1', count: 2 }, …]} value={tab} onValueChange={setTab} />` },
    types: [
      { name: t('Tab có số đếm'), text: t('Số đếm cạnh tên cho biết có bao nhiêu việc đang chờ; ẩn khi bằng 0.'), demo: <TabsDemo /> },
      { name: t('Tab thường'), text: t('Khi các phần không có gì để đếm.'), demo: <TabsDemo withCounts={false} /> },
    ],
    behavior: [{ title: t('Chọn tab'), text: t('Tab đang mở có chữ cam và gạch cam phía dưới. Rê chuột lên bất kỳ tab nào: nền xám nhẹ và chữ đen.') }],
    layout: {
      text: [t('Hàng tab nằm ngay trên nội dung nó điều khiển, kéo dài hết chiều ngang, có đường kẻ mảnh phía dưới.')],
      rules: [
        { ok: true, caption: t('Mỗi tab một việc'), demo: <TabsDemo withCounts={false} /> },
        {
          ok: false,
          caption: t('Không dùng tab cho từng bước của một quy trình'),
          demo: (
            <div className="flex gap-1 rounded-lg bg-white px-2 text-ui text-muted-foreground">
              {['Step 1', 'Step 2', 'Step 3'].map((tItem, i) => (
                <span key={tItem} className={cn('border-b-2 px-4 py-3', i === 0 ? 'border-primary text-primary' : 'border-transparent')}>
                  {tItem}
                </span>
              ))}
            </div>
          ),
        },
      ],
    },
    accessibility: [{ title: t('Vai trò'), text: t('Hàng tab là tablist; mỗi tab là tab với aria-selected. Tab là đường dẫn riêng thì dùng liên kết với aria-current="page".') }],
    content: [{ title: t('Tên tab là danh từ ngắn'), text: t('"Mới", "Đang làm", "Lịch sử". Không viết động từ, không lặp tên trang.') }],
  },
  {
    slug: 'pagination',
    name: 'Pagination',
    summary: t('Phân trang chia một danh sách dài thành nhiều trang và cho chọn số dòng mỗi trang.'),
    when: t('Dùng dưới mọi bảng và danh sách có thể dài hơn một trang. Danh sách luôn ngắn (dưới 25 dòng) thì không cần.'),
    example: { demo: <PaginationDemo />, code: `const paging = usePaging()
// send paging.page and paging.size when loading data
<Pagination paging={paging} total={data.total} />` },
    behavior: [
      { title: t('Số dòng mỗi trang'), text: t('Mặc định 25 dòng; người xem chọn được 50 hoặc 75. Đổi số dòng thì quay về trang đầu.') },
      { title: t('Đổi bộ lọc'), text: t('Khi bộ lọc hoặc ô tìm kiếm đổi, danh sách quay về trang đầu (paging.reset()).') },
    ],
    layout: { text: [t('Nằm ngay dưới danh sách, chiếm hết chiều ngang: bên trái là vị trí và số dòng, bên phải là các nút chuyển trang.')], rules: [] },
    accessibility: [{ title: t('Nút có tên'), text: t('Các nút mũi tên có aria-label (Trang đầu, Trang trước…); trang hiện tại có aria-current="page".') }],
  },
  {
    slug: 'badge',
    name: 'Badge',
    summary: t('Nhãn nhỏ cho biết một thứ đang ở trạng thái nào.'),
    when: t('Dùng cho trạng thái của đơn, phiếu hỗ trợ, khu vực. Không dùng làm nút hay để trang trí.'),
    example: {
      demo: (
        <>
          <Badge>Badge</Badge>
          <Badge variant="secondary">Badge</Badge>
          <Badge variant="outline">Badge</Badge>
          <Badge variant="destructive">Badge</Badge>
        </>
      ),
      code: `import { Badge } from '@/shared/ui/badge'

<Badge variant="secondary">Badge</Badge>`,
    },
    types: [
      {
        name: t('Trạng thái đơn'),
        text: t('Mỗi trạng thái có một màu cố định. Khách, quán và quản trị viên luôn thấy cùng một nhãn.'),
        demo: (
          <div className="flex flex-wrap justify-center gap-2">
            {ORDER_STATUSES.map((s) => (
              <OrderStatusBadge key={s} status={s} />
            ))}
          </div>
        ),
      },
      {
        name: t('Nhãn trung tính'),
        text: t('Cho trạng thái không cần màu: nháp, đã tắt.'),
        demo: (
          <>
            <Badge variant="secondary">Badge</Badge>
            <Badge variant="outline">Badge</Badge>
          </>
        ),
      },
    ],
    layout: {
      text: [t('Đặt cạnh tên của thứ nó mô tả, hoặc trong cột Trạng thái của bảng.')],
      rules: [
        { ok: true, caption: t('Màu đi kèm chữ'), demo: <Badge>Badge</Badge> },
        { ok: false, caption: t('Không chỉ dùng màu'), demo: <span className="size-3 rounded-full bg-success" aria-label="Badge" /> },
      ],
    },
    accessibility: [{ title: t('Không dựa vào màu'), text: t('Chữ trong nhãn tự nói trạng thái; màu chỉ giúp nhìn nhanh.') }],
    content: [{ title: t('Ngắn, nói trạng thái'), text: t('"Đang chuẩn bị", "Đã giao". Không viết câu.') }],
  },
  {
    slug: 'table',
    name: 'Table',
    summary: t('Bảng xếp nhiều dòng cùng loại thành cột để so sánh.'),
    when: t('Dùng khi người xem cần so sánh nhiều thứ theo cùng các thuộc tính: đơn, quán, khoản tiền. Ít cột và mỗi dòng nhiều chữ thì dùng danh sách thẻ.'),
    example: { demo: <SampleTable />, code: `<Table>\n  <TableHeader>...</TableHeader>\n  <TableBody>{rows.map(...)}</TableBody>\n</Table>\n<Pagination paging={paging} total={total} />` },
    layout: {
      text: [
        t('Bảng không có khung riêng; trang đặt một viền mảnh quanh bảng danh sách, hoặc nền be quanh bảng số liệu. Dòng cách nhau bằng đường kẻ mảnh.'),
        t('Số tiền và số đếm căn phải, chữ số cùng độ rộng; chữ căn trái. Dưới bảng luôn có phân trang.'),
      ],
      rules: [
        { ok: true, caption: t('Số căn phải, trạng thái dùng nhãn'), demo: <SampleTable /> },
        { ok: false, caption: t('Không để số lệch và mã trạng thái thô'), demo: <SampleTable messy /> },
      ],
    },
    accessibility: [{ title: t('Tiêu đề cột thật'), text: t('Dùng thead và th để trình đọc màn hình đọc tên cột cùng giá trị.') }],
    content: [{ title: t('Tên cột ngắn'), text: t('"Tổng", "Khách", "Gửi lúc". Đơn vị đặt trong giá trị (129.000 ₫), không trong tên cột.') }],
  },
  {
    slug: 'stat-tile',
    name: 'StatTile',
    summary: t('Ô số liệu đưa một con số quan trọng lên đầu, kèm so sánh.'),
    when: t('Dùng ở đầu trang thống kê cho vài con số chính. Nhiều con số cần so với nhau theo thời gian thì dùng biểu đồ.'),
    example: {
      demo: (
        <StatsPanel className="w-full">
          <StatRow>
            <StatTile label="Label" value="1,234" hint="Hint" />
            <StatTile label="Label" value="56%" hint="Hint" />
            <StatTile label="Label" value="7,890" />
          </StatRow>
        </StatsPanel>
      ),
      code: `import { StatRow, StatsPanel, StatTile } from '@/shared/ui/section'

<StatsPanel>
  <StatRow>
    <StatTile label="Label" value="1,234" hint="Hint" />
  </StatRow>
</StatsPanel>`,
    },
    layout: {
      text: [t('Ô số liệu luôn nằm trên nền be để tách khỏi biểu mẫu và danh sách. Tối đa 3–4 ô một hàng, ngăn bằng đường kẻ mảnh.')],
      rules: [],
    },
    content: [
      { title: t('Nhãn nói con số là gì'), text: t('"Đơn đã giao", không chỉ "Đơn". Thêm khoảng thời gian vào hàng bộ lọc, không lặp lại trong từng ô.') },
      { title: t('So sánh có mốc'), text: t('"+12% so với kỳ trước", không chỉ "+12%".') },
    ],
  },
  {
    slug: 'chart-panel',
    name: 'ChartPanel',
    summary: t('Biểu đồ cho thấy một con số thay đổi thế nào theo thời gian.'),
    when: t('Dùng khi xu hướng quan trọng hơn từng con số: doanh thu theo ngày, tỷ lệ đơn lỗi theo tuần. Chỉ một con số thì dùng ô số liệu.'),
    example: { demo: <ChartDemo />, code: `import { ChartPanel } from '@/widgets/chart-panel'

<ChartPanel title="Title" metrics={METRICS} current={buckets} previous={compare ? before : undefined}
  label={(b) => shortLabel(b.start)} full={(b) => periodLabel(b.start)} />` },
    types: [
      { name: t('Cột'), text: t('So sánh độ lớn giữa các kỳ. Mặc định cho doanh thu, số đơn.'), demo: <ChartDemo kind="bar" compare={false} /> },
      { name: t('Đường'), text: t('Nhấn vào xu hướng, hợp với tỷ lệ hoặc nhiều kỳ.'), demo: <ChartDemo kind="line" compare={false} /> },
    ],
    behavior: [
      { title: t('Xem từng kỳ'), text: t('Rê chuột hoặc dùng phím mũi tên trên biểu đồ để hiện giá trị của mọi chuỗi tại kỳ đó.') },
      { title: t('Bộ lọc chung'), text: t('Khoảng thời gian, chia theo ngày/tuần/tháng và so với kỳ trước nằm một hàng trên đầu trang, áp cho mọi biểu đồ và bảng bên dưới. Mỗi biểu đồ tự chọn số liệu và kiểu Cột/Đường/Bảng.') },
    ],
    layout: {
      text: [t('Biểu đồ nằm trên nền be. Một trục duy nhất bắt đầu từ 0; từ hai chuỗi trở lên có chú thích ở trên.')],
      rules: [
        { ok: true, caption: t('Màu chuỗi cố định: cam, xanh dương, xanh ngọc'), demo: <ChartDemo /> },
        {
          ok: false,
          caption: t('Không dùng hai trục cho hai đơn vị khác nhau'),
          demo: <p className="max-w-xs text-center text-ui text-muted-foreground">{t('Doanh thu (₫) và số đơn trên cùng một biểu đồ hai trục: tách thành hai biểu đồ.')}</p>,
        },
      ],
    },
    accessibility: [
      { title: t('Luôn có dạng bảng'), text: t('Nút Bảng hiện cùng số liệu dạng bảng cho người không xem được biểu đồ.') },
      { title: t('Màu đã kiểm tra'), text: t('Ba màu chuỗi được kiểm tra cho người mù màu trên nền be; chữ và nhãn không dùng màu của chuỗi.') },
    ],
  },
  {
    slug: 'card',
    name: 'Card',
    summary: tx('Card gom một mục nội dung và các hành động của nó trên một bề mặt.', 'A Card groups one item of content and its actions on one surface.'),
    when: tx(
      'Dùng cho một mục đứng riêng: một đơn, một cài đặt, một biểu mẫu nhỏ. Nhiều mục cùng loại cần so sánh thì dùng Table; một con số quan trọng thì dùng StatTile.',
      'Use it for one standalone item: an order, a setting, a small form. Many items of the same kind to compare need a Table; one important number needs a StatTile.',
    ),
    example: {
      demo: (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary">Button</Button>
          </CardContent>
        </Card>
      ),
      code: `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

<Card>
  <CardHeader>
    <CardTitle>…</CardTitle>
    <CardDescription>…</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>`,
    },
    layout: {
      text: [tx('Card bo 12 px, không bóng. Các card trong một trang cách nhau 24–48 px; đừng lồng card trong card.', 'Cards are rounded 12 px with no shadow. Cards on a page are 24–48 px apart; never nest a card inside a card.')],
      rules: [],
    },
    accessibility: [{ title: tx('Tiêu đề thật', 'A real title'), text: tx('CardTitle là tiêu đề của mục; trang có nhiều card thì mỗi card một tiêu đề để người dùng trình đọc màn hình nhảy giữa chúng.', 'CardTitle titles the item; on a page with many cards, give each one a title so screen reader users can jump between them.') }],
  },
  {
    slug: 'sheet',
    name: 'Sheet',
    summary: tx('Sheet là một lớp trượt ra từ cạnh màn hình để xem hoặc sửa một mục mà không rời trang.', 'A Sheet is a layer that slides in from the edge to view or edit one item without leaving the page.'),
    when: tx(
      'Dùng để mở chi tiết một đơn hay sửa một món ngay trên danh sách. Câu hỏi xác nhận ngắn dùng Dialog; việc nhiều bước dùng một trang riêng.',
      "Use it to open an order's details or edit a dish right on the list. Short confirmation questions use a Dialog; multi-step work gets its own page.",
    ),
    example: {
      demo: (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet title</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ),
      code: `import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'

<Sheet>
  <SheetTrigger asChild><Button variant="secondary">…</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>…</SheetTitle></SheetHeader>
  </SheetContent>
</Sheet>`,
    },
    behavior: [
      {
        title: tx('Mở và đóng', 'Opening and closing'),
        text: tx(
          'Trên web sheet trượt từ phải, có nút đóng ở góc; Esc hoặc bấm ra ngoài cũng đóng. Trên điện thoại sheet trượt từ dưới lên.',
          'On the web the sheet slides in from the right with a close button in the corner; Esc or clicking outside also closes it. On phones it slides up from the bottom.',
        ),
      },
    ],
    accessibility: [
      {
        title: tx('Giữ tiêu điểm', 'Focus is kept'),
        text: tx(
          'Khi mở, tiêu điểm vào trong sheet và không thoát ra trang phía sau; khi đóng, tiêu điểm trở về nút đã mở nó.',
          'When open, focus moves into the sheet and cannot leave to the page behind; when closed, it returns to the button that opened it.',
        ),
      },
    ],
  },
  {
    slug: 'empty-state',
    name: 'EmptyState',
    summary: tx(
      'EmptyState là thứ một danh sách hiện khi chưa có gì: một hình, một câu nói vì sao, và việc nên làm tiếp.',
      'An EmptyState is what a list shows when it has nothing: a picture, a sentence saying why, and what to do next.',
    ),
    when: tx(
      'Dùng thay cho một danh sách hoặc bảng trống. Kết quả tìm kiếm không có gì thì dùng hình no-result và gợi ý đổi bộ lọc.',
      'Use it in place of an empty list or table. When a search finds nothing, use the no-result picture and suggest changing filters.',
    ),
    example: {
      demo: (
        <EmptyState title="Title" className="w-full max-w-md">
          Description
        </EmptyState>
      ),
      code: `import { EmptyState } from '@/shared/ui/empty-state'

<EmptyState illustration="empty" title="…">…</EmptyState>`,
    },
    types: [
      { name: 'empty', text: tx('Chưa có gì, và đó là bình thường.', 'Nothing yet, and that is normal.'), demo: <EmptyState title="Title" className="w-full" /> },
      { name: 'no-result', text: tx('Có dữ liệu nhưng bộ lọc không khớp.', 'There is data but the filters match none of it.'), demo: <EmptyState illustration="no-result" title="Title" className="w-full" /> },
    ],
    content: [
      {
        title: tx('Nói vì sao và làm gì', 'Say why and what to do'),
        text: tx('Tiêu đề nói tình trạng; câu phụ nói việc tiếp theo. Đừng chỉ viết "Không có dữ liệu".', 'The title states the situation; the second line says the next step. Never just write "No data".'),
      },
    ],
  },
]

