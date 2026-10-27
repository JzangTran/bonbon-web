import type { Article } from '../types'

const UPDATED = '2026-10-20'

/** "Bắt đầu": from an account to the first order, one page per step; each ends with cards to the next steps (two at most). */
export const START: Article[] = [
  {
    collection: 'bat-dau',
    slug: 'tao-tai-khoan',
    title: 'Bước 1: Tạo tài khoản người bán',
    description: 'Đăng ký tài khoản người bán trên bonbon, xác thực email và đăng nhập lần đầu: mất khoảng năm phút.',
    image: '/guides/dang-ky.jpg',
    imageAlt: 'Trang đăng ký tài khoản người bán của bonbon',
    tags: ['Bắt đầu', 'Tài khoản', '5 phút'],
    updated: UPDATED,
    next: ['bat-dau/mo-cua-hang'],
    blocks: [
      { t: 'p', text: 'Tài khoản người bán là nơi bạn đăng nhập để mở cửa hàng, nhận đơn và theo dõi doanh thu. Mỗi tài khoản người bán quản lý đúng một cửa hàng.' },
      { t: 'h2', text: 'Chuẩn bị trước khi đăng ký' },
      {
        t: 'ul',
        items: [
          'Một địa chỉ email bạn đọc được thường xuyên: bonbon gửi email xác thực, kết quả duyệt hồ sơ và thông báo quan trọng về cửa hàng vào đây.',
          'Số điện thoại của quán (số di động Việt Nam) để điền vào hồ sơ ở bước sau.',
          'Căn cước công dân hoặc chứng minh nhân dân của chủ quán, dùng cho bước định danh.',
        ],
      },
      { t: 'h2', text: 'Đăng ký' },
      {
        t: 'ol',
        items: [
          'Mở trang đăng ký người bán và chọn “Đăng ký”.',
          'Điền họ tên, email và mật khẩu (tối thiểu 8 ký tự).',
          'Đọc và đồng ý Điều khoản dành cho người bán, rồi bấm “Đăng ký”.',
        ],
      },
      { t: 'img', src: '/guides/dang-ky.jpg', alt: 'Biểu mẫu đăng ký người bán', caption: 'Biểu mẫu đăng ký người bán.' },
      { t: 'note', text: 'Bạn cũng có thể tiếp tục bằng tài khoản Google. Khi đó vẫn cần đồng ý điều khoản trước khi mở cửa hàng.' },
      { t: 'h2', text: 'Xác thực email' },
      {
        t: 'p',
        text: 'Ngay sau khi đăng ký, bonbon gửi một email có liên kết xác thực, hiệu lực 24 giờ. Mở email và bấm vào liên kết. Nếu không thấy email, hãy xem mục thư rác, hoặc dùng nút gửi lại ngay trên trang xác thực.',
      },
      { t: 'h2', text: 'Đăng nhập lần đầu' },
      {
        t: 'p',
        text: 'Sau khi email được xác thực, đăng nhập bằng email và mật khẩu vừa tạo. Vì chưa có cửa hàng được duyệt, bonbon đưa bạn thẳng tới biểu mẫu mở cửa hàng. Bạn có thể lưu nháp và quay lại điền tiếp bất cứ lúc nào.',
      },
      { t: 'img', src: '/guides/dang-nhap.jpg', alt: 'Trang đăng nhập người bán', caption: 'Đăng nhập tại trang người bán.' },
    ],
  },
  {
    collection: 'bat-dau',
    slug: 'mo-cua-hang',
    title: 'Bước 2: Điền hồ sơ mở cửa hàng',
    description:
      'Năm phần của hồ sơ mở cửa hàng: thông tin quán, giao hàng và thời gian, thuế và nhận tiền, định danh, xác nhận. Lưu nháp từng phần.',
    image: '/guides/mo-shop-1.jpg',
    imageAlt: 'Biểu mẫu mở cửa hàng, phần Thông tin quán',
    tags: ['Bắt đầu', 'Hồ sơ', 'Mở cửa hàng'],
    updated: UPDATED,
    next: ['bat-dau/cho-duyet-nhan-don', 'quan-ly-cua-hang/thiet-lap-ho-so'],
    blocks: [
      {
        t: 'p',
        text: 'Hồ sơ gồm năm phần. Mỗi phần được lưu nháp riêng, nên bạn có thể dừng giữa chừng. Ô nào có dấu * đỏ trước tên là bắt buộc, và mỗi ô nhập chữ đều hiện số ký tự đã gõ trên số ký tự tối đa.',
      },
      { t: 'h2', text: '1. Thông tin quán' },
      {
        t: 'ul',
        items: [
          'Tên cửa hàng, số điện thoại (di động Việt Nam) và email của quán.',
          'Địa chỉ: chọn Tỉnh/Thành phố và Phường/Xã, gõ số nhà và tên đường, rồi bấm “Định vị” để ghim đúng vị trí quán trên bản đồ.',
          'Vị trí của quán phải nằm trong một khu vực bonbon đang phục vụ. Khu vực này quyết định bán kính giao tối đa của quán.',
        ],
      },
      { t: 'img', src: '/guides/mo-shop-1.jpg', alt: 'Phần Thông tin quán', caption: 'Phần 1: Thông tin quán.' },
      { t: 'h2', text: '2. Giao hàng và thời gian' },
      {
        t: 'p',
        text: 'Bạn xem khu vực phục vụ của quán, đặt bán kính giao (không vượt mức tối đa của khu vực), phí giao hàng, mức miễn phí giao và đơn tối thiểu (hai mục sau là tuỳ chọn), rồi đặt giờ mở cửa cho từng ngày trong tuần.',
      },
      { t: 'img', src: '/guides/mo-shop-2.jpg', alt: 'Phần Giao hàng và thời gian', caption: 'Phần 2: Giao hàng và thời gian.' },
      { t: 'h2', text: '3. Thuế và nhận tiền' },
      {
        t: 'p',
        text: 'Chọn loại hình kinh doanh (cá nhân hoặc hộ kinh doanh), điền mã số thuế, địa chỉ đăng ký kinh doanh và tối đa năm email nhận hoá đơn điện tử. Hộ kinh doanh cần tải lên giấy phép kinh doanh. Cuối cùng là tài khoản ngân hàng nhận tiền: tên chủ tài khoản phải trùng với chủ cửa hàng.',
      },
      { t: 'h2', text: '4. Định danh chủ cửa hàng' },
      {
        t: 'p',
        text: 'Chọn loại giấy tờ (CCCD hoặc CMND), nhập số giấy tờ và họ tên như trên giấy tờ, tải ảnh mặt trước và ảnh bạn cầm giấy tờ. Sau đó tích ba ô cam kết: thông tin chính xác, đồng ý Điều khoản người bán và đồng ý cho bonbon xử lý dữ liệu định danh. Giấy tờ được mã hoá, chỉ quản trị viên có quyền riêng mới xem được và mỗi lần xem đều được ghi lại.',
      },
      { t: 'note', text: 'Ảnh tải lên là ảnh JPG, PNG hoặc WebP. Nếu ảnh quá lớn hoặc sai định dạng, biểu mẫu báo ngay tại ô đó để bạn chọn lại.' },
      { t: 'h2', text: '5. Xác nhận và gửi duyệt' },
      {
        t: 'p',
        text: 'Phần cuối liệt kê từng phần đã đủ hay còn thiếu gì, kèm nút “Bổ sung” để quay lại đúng phần cần sửa. Khi mọi phần đã đủ, bấm “Gửi duyệt”. Hồ sơ đã gửi không sửa được cho tới khi có kết quả.',
      },
    ],
  },
  {
    collection: 'bat-dau',
    slug: 'cho-duyet-nhan-don',
    title: 'Bước 3: Chờ duyệt, thêm thực đơn và nhận đơn đầu tiên',
    description: 'Sau khi gửi hồ sơ: cách bonbon duyệt, việc cần làm khi được duyệt và cách bật nhận đơn để bán đơn đầu tiên.',
    image: '/guides/tong-quan.jpg',
    imageAlt: 'Trang tổng quan của người bán',
    tags: ['Bắt đầu', 'Duyệt hồ sơ', 'Đơn đầu tiên'],
    updated: UPDATED,
    next: ['quan-ly-cua-hang/them-mon-an', 'quan-ly-cua-hang/nhan-va-xu-ly-don'],
    blocks: [
      { t: 'h2', text: 'Chờ duyệt' },
      { t: 'p', text: 'Quản trị viên xem hồ sơ và bạn nhận email khi có kết quả. Trong lúc chờ, trang mở cửa hàng chỉ cho xem, không sửa được.' },
      {
        t: 'ul',
        items: [
          'Được duyệt: cửa hàng được mở bán, bạn vào được trang người bán đầy đủ.',
          'Chưa được duyệt: email nêu lý do. Bạn sửa hồ sơ và gửi lại ở phần “Xác nhận”.',
        ],
      },
      { t: 'h2', text: 'Thêm thực đơn' },
      {
        t: 'p',
        text: 'Khách chỉ thấy quán khi quán có món. Vào “Quản lý thực đơn”, thêm vài món đầu tiên với tên, giá và ảnh. Mỗi món thuộc một ngành hàng, vì hoa hồng tính theo ngành hàng của món.',
      },
      { t: 'h2', text: 'Bật nhận đơn' },
      {
        t: 'p',
        text: 'Công tắc “Đang nhận đơn” ở thanh trên cùng cho phép bạn tạm nghỉ ngay lập tức. Quán chỉ hiện là đang mở khi công tắc bật và đang trong khung giờ mở cửa đã đặt.',
      },
      { t: 'img', src: '/guides/tong-quan.jpg', alt: 'Công tắc Đang nhận đơn và danh sách việc cần làm', caption: 'Công tắc “Đang nhận đơn” và danh sách việc cần làm.' },
      { t: 'h2', text: 'Đơn đầu tiên' },
      {
        t: 'p',
        text: 'Khi khách đặt món, bạn nhận thông báo ngay. Hãy xác nhận đơn trong vài phút, nếu không đơn sẽ tự bị từ chối. Sau đó chuẩn bị món, tự mang tới khách trong khu và cập nhật trạng thái đơn theo từng bước.',
      },
    ],
  },
]
