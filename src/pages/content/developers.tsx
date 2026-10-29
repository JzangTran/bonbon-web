import type { Block } from '@/entities/article'
import { API_REFERENCE_URL, OPENAPI_URL } from '@/shared/config/env'
import { ArticleView, DocsSidebar } from '@/widgets/article/article-view'
import { PageSeo } from '@/widgets/article/seo'
import { buttonClass } from '@/shared/ui/button'
import { t } from '@/shared/i18n'

const PATH = '/nha-phat-trien'

const BLOCKS: Block[] = [
  { t: 'p', text: t('bonbon có một API REST duy nhất cho ứng dụng điện thoại, kênh người bán và trang quản trị. Trang này tóm tắt những gì cần biết trước khi gọi API; từng endpoint, tham số và mã lỗi nằm trong tài liệu API đầy đủ.') },
  { t: 'h2', text: t('Tài liệu API') },
  { t: 'ul', items: [
    t('**Tài liệu tương tác**: xem và thử gọi từng endpoint ngay trên trình duyệt.'),
    t('**Tài liệu OpenAPI 3** (JSON): dùng để sinh mã client cho ngôn ngữ của bạn.'),
    t('Các endpoint được nhóm theo người dùng: Chung, Khách, Người bán, Quản trị.'),
  ] },
  { t: 'h2', text: t('Xác thực') },
  { t: 'p', text: t('Đăng nhập trả về một **access token** (JWT, sống 30 phút) và một **refresh token** (7 ngày). Gửi access token ở header **Authorization: Bearer …**; khi hết hạn, đổi refresh token lấy cặp mới. Refresh token chỉ dùng được một lần: dùng lại một token cũ sẽ thu hồi cả chuỗi phiên.') },
  { t: 'ul', items: [
    t('Một tài khoản có thể vừa là khách vừa là người bán; mỗi token mang đúng một vai trò.'),
    t('Quyền (ví dụ **order:read**, **earnings:read**) nằm trong token; API kiểm tra quyền ở từng endpoint.'),
    t('Một số thao tác nhạy cảm (đổi mật khẩu, cấu hình) cần đã đăng nhập trong 10 phút gần nhất.'),
  ] },
  { t: 'h2', text: t('Gửi yêu cầu') },
  { t: 'ul', items: [
    t('Dữ liệu gửi và nhận là JSON, mã hoá UTF-8; thời gian theo ISO 8601, tiền là số nguyên đồng.'),
    t('Header **X-Client-Channel** (WEB hoặc MOBILE) và **X-App-Version** giúp ghi nhận nguồn gọi.'),
    t('Đặt đơn và ghi nhận tiền cần header **Idempotency-Key**: gửi lại cùng khoá trả lại đúng kết quả cũ, không tạo bản thứ hai.'),
    t('Danh sách phân trang bằng **page** (từ 0) và **size** (1–100); kết quả có **total** để tính số trang.'),
  ] },
  { t: 'h2', text: t('Lỗi') },
  { t: 'p', text: t('Mọi lỗi theo chuẩn **Problem Details** (RFC 9457): mã HTTP, **detail** là câu tiếng Việt hiển thị được cho người dùng, **code** là mã ổn định để chương trình xử lý (ví dụ **OUT_OF_DELIVERY_RADIUS**, **TOO_MANY_OPEN_TICKETS**). Lỗi theo từng trường có thêm **errors**.') },
  { t: 'h2', text: t('Giới hạn tần suất') },
  { t: 'p', text: t('Đăng nhập, đăng ký, gửi liên hệ và tải ảnh có giới hạn theo địa chỉ IP hoặc theo tài khoản. Vượt giới hạn trả về **429** kèm header **Retry-After** (số giây nên chờ).') },
  { t: 'h2', text: t('Cập nhật đơn theo thời gian thực') },
  { t: 'p', text: t('Kênh WebSocket **/ws/orders** đẩy thay đổi trạng thái đơn tới khách và quán ngay khi xảy ra. Tin nhắn đầu tiên sau khi kết nối mang access token; khi mất kết nối, tải lại danh sách đơn rồi kết nối lại.') },
  { t: 'note', text: t('Cần hỗ trợ tích hợp? Gửi yêu cầu ở trang Liên hệ hỗ trợ và chọn chủ đề Khác.') },
]

const GROUPS = [
  {
    title: t('Nhà phát triển'),
    items: [
      { label: t('Tài liệu API'), to: `${PATH}#tai-lieu-api` },
      { label: t('Xác thực'), to: `${PATH}#xac-thuc` },
      { label: t('Gửi yêu cầu'), to: `${PATH}#gui-yeu-cau` },
      { label: t('Lỗi'), to: `${PATH}#loi` },
      { label: t('Giới hạn tần suất'), to: `${PATH}#gioi-han-tan-suat` },
      { label: t('Thời gian thực'), to: `${PATH}#cap-nhat-don-theo-thoi-gian-thuc` },
    ],
  },
]

/** /nha-phat-trien: what to know before calling the bonbon API, with links to the full reference. */
export function DevelopersPage() {
  const trail = [
    { name: t('Trang chủ'), path: '/' },
    { name: t('Tài nguyên'), path: PATH },
    { name: t('Nhà phát triển'), path: PATH },
  ]
  return (
    <>
      <PageSeo title={t('Nhà phát triển')} description={t('Tổng quan API của bonbon: xác thực, cách gửi yêu cầu, lỗi, giới hạn và tài liệu API đầy đủ.')} path={PATH} trail={trail} />
      <ArticleView trail={trail} title={t('Nhà phát triển')} meta={t('API REST của bonbon')} blocks={BLOCKS} tags={['API', t('Nhà phát triển')]} sidebar={<DocsSidebar groups={GROUPS} current={PATH} />}
        after={
          <div className="mt-10 flex flex-wrap gap-2">
            <a href={API_REFERENCE_URL} target="_blank" rel="noreferrer" className={buttonClass()}>
              {t('Mở tài liệu API')}
            </a>
            <a href={OPENAPI_URL} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'secondary' })}>
              {t('Tải OpenAPI JSON')}
            </a>
          </div>
        }
      />
    </>
  )
}
