import { BellIcon, HeartIcon, MapPinIcon, PlusIcon, SearchIcon, XIcon } from 'lucide-react'
import { t } from '@/shared/i18n'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Price, Rating } from '@/shared/ui/commerce'
import { IconButton } from '@/shared/ui/icon-button'
import { ListItem } from '@/shared/ui/list-item'
import { Banner, InlineMessage } from '@/shared/ui/message'
import { ResultPage } from '@/shared/ui/result-page'
import { showSnackbar } from '@/shared/ui/snackbar'
import { Spinner } from '@/shared/ui/spinner'
import { Text } from '@/shared/ui/text'
import { ChipDemo, FieldDemo, StepperDemo, SwitchDemo } from './demos-v5'
import type { ComponentDoc } from './registry'

// ---------------------------------------------------------------- the docs

export const V5_COMPONENTS: ComponentDoc[] = [
  {
    slug: 'text',
    name: 'Text',
    summary: t('Chữ theo một trong tám kiểu có tên và một mức nhấn.'),
    when: t('Dùng cho mọi chữ trên trang thay vì đặt cỡ chữ hay độ đậm riêng. Mỗi trang chỉ dùng 3–5 kiểu.'),
    example: {
      demo: (
        <div className="flex flex-col gap-1 text-left">
          <Text variant="title-1">Đơn hàng của bạn</Text>
          <Text variant="title-3">Cơm nhà Bếp Sen</Text>
          <Text>{t('Quán sẽ nhận đơn trong vài phút.')}</Text>
          <Text variant="caption" tone="tertiary">
            {t('Cập nhật 2 phút trước')}
          </Text>
        </div>
      ),
      code: `import { Text } from '@/shared/ui/text'

<Text variant="title-1">Đơn hàng của bạn</Text>
<Text variant="caption" tone="tertiary">Cập nhật 2 phút trước</Text>`,
    },
    accessibility: [{ title: t('Đúng cấp tiêu đề'), text: t('Tiêu đề tự là h1, h2, h3 theo kiểu chữ; truyền as khi trang cần cấp khác.') }],
    content: [{ title: t('Nhấn mạnh có chừng mực'), text: t('Chỉ in đậm con số hay tên người đọc cần thấy trước. Không in nghiêng, không viết hoa toàn bộ, không tô màu để nhấn mạnh.') }],
  },
  {
    slug: 'icon-button',
    name: 'IconButton',
    summary: t('Nút chỉ có biểu tượng, cho các ký hiệu ai cũng hiểu.'),
    when: t('Chỉ dùng cho quay lại, đóng, tìm, thêm, thêm lựa chọn, thông báo, giỏ hàng, cài đặt. Hành động khác phải có chữ.'),
    example: {
      demo: (
        <>
          <IconButton label={t('Tìm')} icon={<SearchIcon />} />
          <IconButton label={t('Thông báo')} icon={<BellIcon />} variant="secondary" />
          <IconButton label={t('Thêm')} icon={<PlusIcon />} variant="outline" />
          <IconButton label={t('Đóng')} icon={<XIcon />} size="sm" />
        </>
      ),
      code: `<IconButton label="Đóng" icon={<XIcon />} />`,
    },
    accessibility: [{ title: t('Luôn có tên'), text: t('label là tên đọc cho trình đọc màn hình và là chú thích khi rê chuột.') }],
  },
  {
    slug: 'text-field',
    name: 'TextField',
    summary: t('Ô nhập có nhãn, gợi ý và thông báo lỗi đi cùng.'),
    when: t('Dùng cho mọi ô nhập chữ trong form. Nhãn luôn nằm trên ô; gợi ý ví dụ đặt trong placeholder, không thay nhãn.'),
    example: { demo: <FieldDemo />, code: `<TextField id="phone" label="Số điện thoại" required help="Quán gọi số này khi giao tới." />` },
    types: [{ name: t('Có lỗi'), text: t('Lỗi thay chỗ gợi ý, có biểu tượng, được đọc lên, nối với ô nhập; giá trị đã gõ vẫn giữ nguyên.'), demo: <FieldDemo withError /> }],
    content: [{ title: t('Lỗi nói cách sửa'), text: t('"Số điện thoại cần 10 chữ số", không viết "Không hợp lệ".') }],
  },
  {
    slug: 'chip',
    name: 'Chip',
    summary: t('Lựa chọn bật tắt được: bộ lọc, câu trả lời nhanh.'),
    when: t('Dùng cho bộ lọc và thẻ chọn nhanh. Chọn một trong nhiều trong form thì dùng radio; một cài đặt bật tắt dùng Switch.'),
    example: { demo: <ChipDemo />, code: `<Chip selected={on} onSelectedChange={setOn}>Gần nhất</Chip>` },
    accessibility: [{ title: t('Trạng thái được đọc'), text: t('Chip là nút có aria-pressed; chip đang chọn có nền cam nhạt và chữ cam đậm.') }],
  },
  {
    slug: 'switch',
    name: 'Switch',
    summary: t('Cài đặt bật tắt có hiệu lực ngay.'),
    when: t('Dùng khi bật là có tác dụng luôn (nhận đơn, loại thông báo). Lựa chọn chờ bấm Lưu thì dùng Checkbox.'),
    example: { demo: <SwitchDemo />, code: `<Switch checked={on} onCheckedChange={setOn} aria-labelledby="label-id" />` },
    content: [{ title: t('Nhãn nói trạng thái'), text: t('Nhãn cạnh công tắc nói điều đang xảy ra: "Đang nhận đơn".') }],
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    summary: t('Ô tích cho lựa chọn chờ lưu hoặc chọn nhiều.'),
    when: t('Dùng trong form có nút Lưu, hoặc khi được chọn nhiều mục. Bấm vào chữ cũng tích được.'),
    example: { demo: <Checkbox id="demo-check" label={t('Nhận thông báo khuyến mãi')} description={t('Tối đa một tin mỗi tuần.')} />, code: `<Checkbox id="promo" label="Nhận thông báo khuyến mãi" />` },
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    summary: t('Ảnh của người hoặc quán, hoặc chữ cái đầu khi chưa có ảnh.'),
    when: t('Dùng cạnh tên trong danh sách, hội thoại, đánh giá.'),
    example: {
      demo: (
        <>
          <Avatar name="Bếp Sen" size="sm" />
          <Avatar name="Hoàng Minh Anh" />
          <Avatar name="Quán Cơm Demo" size="lg" />
        </>
      ),
      code: `<Avatar name="Bếp Sen" src={logoUrl} />`,
    },
  },
  {
    slug: 'list-item',
    name: 'ListItem',
    summary: t('Một dòng trong danh sách: hình hoặc biểu tượng, tên, mô tả, giá trị.'),
    when: t('Dùng cho danh sách cài đặt, địa chỉ, giao dịch. Cả dòng là một vùng bấm; không đặt hai nút cạnh tranh trong một dòng.'),
    example: {
      demo: (
        <div className="w-full max-w-md divide-y rounded-card border">
          <ListItem leading={<MapPinIcon />} title={t('Địa chỉ giao hàng')} description="Toà S2.05, Vinhomes Smart City" onClick={() => {}} />
          <ListItem leading={<HeartIcon />} title={t('Quán yêu thích')} trailing="12" onClick={() => {}} />
          <ListItem title={t('Phí giao')} trailing={<Price amount={10000} size="sm" />} />
        </div>
      ),
      code: `<ListItem leading={<MapPinIcon />} title="Địa chỉ giao hàng" description="Toà S2.05" onClick={open} />`,
    },
  },
  {
    slug: 'price',
    name: 'Price',
    summary: t('Số tiền viết kiểu Việt Nam, kèm giá cũ khi giảm giá.'),
    when: t('Dùng cho mọi số tiền: giá món, phí, tổng. Không tự định dạng tiền ở trang.'),
    example: {
      demo: (
        <>
          <Price amount={45000} />
          <Price amount={38000} original={45000} />
          <Price amount={95000} size="lg" />
        </>
      ),
      code: `<Price amount={38000} original={45000} />`,
    },
  },
  {
    slug: 'rating',
    name: 'Rating',
    summary: t('Điểm đánh giá trên 5 và số lượt.'),
    when: t('Dùng trên thẻ quán, trang quán. Khi chưa có lượt nào, nói "Chưa có đánh giá" thay vì 0.'),
    example: {
      demo: (
        <>
          <Rating score={4.8} count={126} />
          <Rating score={null} count={0} />
        </>
      ),
      code: `<Rating score={4.8} count={126} />`,
    },
  },
  {
    slug: 'quantity-stepper',
    name: 'QuantityStepper',
    summary: t('Tăng giảm số lượng trong giới hạn.'),
    when: t('Dùng trong giỏ hàng và khi chọn món.'),
    example: { demo: <StepperDemo />, code: `<QuantityStepper value={n} onChange={setN} min={0} max={20} label="Cơm gà" />` },
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    summary: t('Báo đang xử lý, đặt đúng chỗ kết quả sẽ hiện.'),
    when: t('Dưới 1 giây: không hiện gì. 1–10 giây: spinner hoặc skeleton tại chỗ. Trên 10 giây: nói đang làm gì.'),
    example: { demo: <Spinner />, code: `<Spinner label="Đang tải đơn hàng" />` },
  },
  {
    slug: 'inline-message',
    name: 'InlineMessage',
    summary: t('Thông điệp nằm ngay trong vùng nó nói tới.'),
    when: t('Bậc 2 của thang phản hồi: lỗi khi gửi form, kết quả gắn với một khu vực. Viết theo công thức: chuyện gì xảy ra · có nghĩa gì · làm gì tiếp.'),
    example: {
      demo: (
        <div className="flex w-full max-w-md flex-col gap-3">
          <InlineMessage tone="danger" title={t('Chưa lưu được món')} action={<Button size="sm">{t('Thử lại')}</Button>}>
            {t('Máy chủ không phản hồi. Nội dung vẫn còn trên trang; thử lại sau ít phút.')}
          </InlineMessage>
          <InlineMessage tone="success" title={t('Đã lưu nháp lúc 14:02')}>
            {t('Khách chưa thấy món này cho tới khi bạn bấm Đăng bán.')}
          </InlineMessage>
        </div>
      ),
      code: `<InlineMessage tone="success" title="Đã lưu nháp lúc 14:02">Khách chưa thấy món này…</InlineMessage>`,
    },
  },
  {
    slug: 'banner',
    name: 'Banner',
    summary: t('Tình trạng ảnh hưởng cả trang, ở lại tới khi hết.'),
    when: t('Bậc 3 của thang phản hồi: quán tạm ngưng, nợ phí, mất mạng, đang chờ duyệt. Luôn có một hành động để giải quyết.'),
    example: {
      demo: (
        <Banner tone="warning" title={t('Quán đang tạm ngưng nhận đơn đến 12:30')} action={<Button size="sm" variant="outline">{t('Nhận đơn lại')}</Button>}>
          {t('Khách vẫn thấy quán nhưng không đặt được.')}
        </Banner>
      ),
      code: `<Banner tone="warning" title="Quán đang tạm ngưng…" action={<Button>Nhận đơn lại</Button>} />`,
    },
  },
  {
    slug: 'snackbar',
    name: 'Snackbar',
    summary: t('Báo một việc vừa làm ở nền và cho hoàn tác.'),
    when: t('Bậc 4, chỉ cho việc hoàn tác được: "Đã xoá món Trà đá · Hoàn tác". Không dùng cho lỗi hay thông tin phải đọc.'),
    example: {
      demo: (
        <Button variant="outline" onClick={() => showSnackbar({ message: t('Đã xoá món Trà đá'), onUndo: () => {} })}>
          {t('Xoá món thử')}
        </Button>
      ),
      code: `showSnackbar({ message: 'Đã xoá món Trà đá', onUndo: restore })`,
    },
  },
  {
    slug: 'result-page',
    name: 'ResultPage',
    summary: t('Trang cuối một luồng: chuyện gì xảy ra, việc gì tiếp theo.'),
    when: t('Bậc 5: đặt món xong, gửi hồ sơ mở quán, thanh toán thất bại. Không bao giờ chỉ ghi "Thành công".'),
    example: {
      demo: (
        <ResultPage
          className="py-4"
          title={t('Đã gửi đơn #1025 tới Bếp Sen')}
          description={t('Bạn có thể huỷ miễn phí trước khi quán nhận.')}
          next={[t('Quán nhận đơn, thường trong 3 phút'), t('Bạn thấy giờ giao dự kiến'), t('Món tới sảnh toà S2.05')]}
          primary={<Button>{t('Theo dõi đơn')}</Button>}
        />
      ),
      code: `<ResultPage title="Đã gửi đơn #1025" next={[…]} primary={<Button>Theo dõi đơn</Button>} />`,
    },
  },
]
