import { API_REFERENCE_URL, OPENAPI_URL } from '@/shared/config/env'
import { tx } from '@/shared/i18n'
import { buttonClass } from '@/shared/ui/button'
import { C, Code, DataTable, List, P, Principle } from '../doc'
import type { ResourceDoc } from '../doc'

const referenceLinks = (
  <div className="flex flex-wrap gap-2">
    <a href={API_REFERENCE_URL} target="_blank" rel="noreferrer" className={buttonClass()}>
      {tx('Mở tài liệu API', 'Open the API reference')}
    </a>
    <a href={OPENAPI_URL} target="_blank" rel="noreferrer" className={buttonClass({ variant: 'secondary' })}>
      {tx('Tải OpenAPI JSON', 'Download OpenAPI JSON')}
    </a>
  </div>
)

const overview: ResourceDoc = {
  summary: tx(
    'bonbon có một API REST duy nhất cho ứng dụng điện thoại, kênh người bán và trang quản trị. Các trang này tóm tắt những gì cần biết trước khi gọi API; từng endpoint, tham số và mã lỗi nằm trong tài liệu API đầy đủ.',
    'bonbon has one REST API for the phone app, the seller channel and the admin site. These pages summarise what to know before calling it; every endpoint, parameter and error code is in the full API reference.',
  ),
  sections: [
    {
      id: 'audiences',
      title: tx('Endpoint theo người dùng', 'Endpoints by audience'),
      body: (
        <DataTable
          head={[tx('Nhóm', 'Group'), tx('Ai gọi', 'Who calls it'), tx('Ví dụ', 'Example')]}
          rows={[
            [tx('Chung', 'Common'), tx('Mọi người, kể cả chưa đăng nhập', 'Everyone, signed in or not'), <C>/api/auth/login</C>],
            [tx('Khách', 'Customer'), tx('Ứng dụng điện thoại', 'The phone app'), <C>/api/orders</C>],
            [tx('Người bán', 'Seller'), tx('Kênh người bán, web và điện thoại', 'The seller channel, web and phone'), <C>/api/merchant/orders</C>],
            [tx('Quản trị', 'Admin'), tx('Trang quản trị', 'The admin site'), <C>/api/admin/merchants</C>],
          ]}
        />
      ),
    },
    {
      id: 'start',
      title: tx('Bắt đầu gọi API', 'Start calling the API'),
      body: (
        <>
          <List
            ordered
            items={[
              tx('Đọc trang Xác thực để lấy access token.', 'Read Authentication to get an access token.'),
              tx('Đọc trang Gửi yêu cầu để biết header và định dạng dữ liệu.', 'Read Making requests for headers and data formats.'),
              tx('Thử từng endpoint trong tài liệu tương tác, hoặc sinh client từ OpenAPI.', 'Try each endpoint in the interactive reference, or generate a client from OpenAPI.'),
            ]}
          />
          {referenceLinks}
        </>
      ),
    },
  ],
  takeaway: tx('Một API cho mọi ứng dụng bonbon; tài liệu tương tác và OpenAPI là nguồn chính xác nhất.', 'One API for every bonbon app; the interactive reference and OpenAPI are the source of truth.'),
}

const authentication: ResourceDoc = {
  summary: tx(
    'Mọi lời gọi cần đăng nhập mang một access token. Token ngắn hạn, được làm mới bằng refresh token, và mang theo vai trò cùng quyền của người gọi.',
    'Every call that needs a signed-in user carries an access token. Tokens are short-lived, renewed with a refresh token, and carry the caller\'s role and permissions.',
  ),
  sections: [
    {
      id: 'tokens',
      title: tx('Lấy và làm mới token', 'Get and refresh tokens'),
      body: (
        <>
          <P>
            {tx(
              'Đăng nhập trả về một access token (JWT, sống 30 phút) và một refresh token (7 ngày). Gửi access token ở header Authorization; khi hết hạn, đổi refresh token lấy cặp mới.',
              'Signing in returns an access token (JWT, valid 30 minutes) and a refresh token (7 days). Send the access token in the Authorization header; when it expires, exchange the refresh token for a new pair.',
            )}
          </P>
          <Code>{`Authorization: Bearer eyJhbGciOiJIUzI1NiJ9…`}</Code>
          <Principle>
            {tx(
              'Refresh token chỉ dùng được một lần: dùng lại một token cũ sẽ thu hồi cả chuỗi phiên.',
              'A refresh token works only once: reusing an old one revokes the whole session chain.',
            )}
          </Principle>
        </>
      ),
    },
    {
      id: 'roles',
      title: tx('Vai trò và quyền', 'Roles and permissions'),
      body: (
        <List
          items={[
            tx('Một tài khoản có thể vừa là khách vừa là người bán; mỗi token mang đúng một vai trò.', 'One account can be both customer and seller; each token carries exactly one role.'),
            tx('Quyền (ví dụ order:read, earnings:read) nằm trong token; API kiểm tra quyền ở từng endpoint.', 'Permissions (e.g. order:read, earnings:read) are in the token; the API checks them on every endpoint.'),
            tx('Thao tác nhạy cảm (đổi mật khẩu, cấu hình) cần đã đăng nhập trong 10 phút gần nhất.', 'Sensitive actions (changing the password, configuration) require a sign-in within the last 10 minutes.'),
          ]}
        />
      ),
    },
  ],
}

const makingRequests: ResourceDoc = {
  summary: tx(
    'Cách gửi yêu cầu tới API: định dạng dữ liệu, các header bonbon đọc, cách gửi lại an toàn và cách phân trang.',
    'How to send requests to the API: data formats, the headers bonbon reads, safe retries and paging.',
  ),
  sections: [
    {
      id: 'format',
      title: tx('Định dạng dữ liệu', 'Data format'),
      body: (
        <List
          items={[
            tx('Gửi và nhận JSON, mã hoá UTF-8.', 'Send and receive JSON, UTF-8 encoded.'),
            tx('Thời gian theo ISO 8601; tiền là số nguyên đồng, không số lẻ.', 'Times are ISO 8601; money is whole dong, no decimals.'),
          ]}
        />
      ),
    },
    {
      id: 'headers',
      title: tx('Header bonbon đọc', 'Headers bonbon reads'),
      body: (
        <DataTable
          head={['Header', tx('Dùng để', 'Purpose')]}
          rows={[
            [<C>Authorization</C>, tx('Access token của người gọi', 'The caller\'s access token')],
            [<C>Accept-Language</C>, tx('vi hoặc en: ngôn ngữ của câu lỗi trả về (đang triển khai)', 'vi or en: the language of returned error messages (rolling out)')],
            [<C>X-Client-Channel</C>, tx('WEB hoặc MOBILE, để ghi nhận nguồn gọi', 'WEB or MOBILE, to record where calls come from')],
            [<C>X-App-Platform</C>, tx('ANDROID hoặc IOS; web không gửi', 'ANDROID or IOS; the web does not send it')],
            [<C>X-App-Version</C>, tx('Phiên bản ứng dụng điện thoại; thấp hơn bản tối thiểu thì nhận 426 APP_UPDATE_REQUIRED', 'The phone app version; below the minimum, calls get 426 APP_UPDATE_REQUIRED')],
            [<C>Idempotency-Key</C>, tx('Bắt buộc khi đặt đơn và ghi nhận tiền', 'Required when placing orders and recording money')],
          ]}
        />
      ),
    },
    {
      id: 'idempotency',
      title: tx('Gửi lại an toàn', 'Retry safely'),
      body: (
        <>
          <P>
            {tx(
              'Đặt đơn và ghi nhận tiền cần header Idempotency-Key. Gửi lại cùng khoá trả lại đúng kết quả cũ, không tạo bản thứ hai.',
              'Placing orders and recording money need an Idempotency-Key header. Resending the same key returns the earlier result instead of creating a second one.',
            )}
          </P>
          <Principle>{tx('Tạo khoá mới cho mỗi lần người dùng bấm, không cho mỗi lần thử lại.', 'Create a new key for each user action, not for each retry.')}</Principle>
        </>
      ),
    },
    {
      id: 'paging',
      title: tx('Phân trang', 'Paging'),
      body: (
        <P>
          {tx('Danh sách nhận ', 'Lists take ')}
          <C>page</C>
          {tx(' (từ 0) và ', ' (from 0) and ')}
          <C>size</C>
          {tx(' (1–100); kết quả có ', ' (1–100); results include ')}
          <C>total</C>
          {tx(' để tính số trang.', ' to work out the number of pages.')}
        </P>
      ),
    },
  ],
}

const errors: ResourceDoc = {
  summary: tx(
    'Mọi lỗi theo chuẩn Problem Details (RFC 9457): một mã ổn định cho chương trình và một câu cho người đọc.',
    'Every error follows Problem Details (RFC 9457): a stable code for programs and a sentence for people.',
  ),
  sections: [
    {
      id: 'shape',
      title: tx('Hình dạng một lỗi', 'The shape of an error'),
      body: (
        <>
          <Code>{`{
  "status": 422,
  "code": "OUT_OF_DELIVERY_RADIUS",
  "detail": "…",
  "errors": [{ "field": "addressId", "message": "…" }]
}`}</Code>
          <DataTable
            head={[tx('Trường', 'Field'), tx('Ý nghĩa', 'Meaning')]}
            rows={[
              [<C>code</C>, tx('Mã ổn định để chương trình xử lý, không đổi giữa các phiên bản', 'A stable code for programs, unchanged across versions')],
              [<C>detail</C>, tx('Câu hiển thị được cho người dùng', 'A sentence that can be shown to users')],
              [<C>errors</C>, tx('Lỗi theo từng trường của biểu mẫu, nếu có', 'Per-field form errors, when there are any')],
            ]}
          />
          <Principle>{tx('Chương trình rẽ nhánh theo code, không theo chữ trong detail.', 'Programs branch on code, never on the words in detail.')}</Principle>
        </>
      ),
    },
  ],
}

const rateLimits: ResourceDoc = {
  summary: tx(
    'Đăng nhập, đăng ký, gửi liên hệ và tải ảnh có giới hạn theo địa chỉ IP hoặc theo tài khoản để chặn lạm dụng.',
    'Sign-in, sign-up, contact forms and image uploads are limited by IP address or account to stop abuse.',
  ),
  sections: [
    {
      id: 'when-limited',
      title: tx('Khi vượt giới hạn', 'When you hit a limit'),
      body: (
        <>
          <P>
            {tx('API trả về ', 'The API returns ')}
            <C>429</C>
            {tx(' kèm header ', ' with a ')}
            <C>Retry-After</C>
            {tx(' (số giây nên chờ).', ' header (seconds to wait).')}
          </P>
          <Principle>{tx('Chờ đúng Retry-After rồi mới gửi lại; đừng thử lại liên tục.', 'Wait for Retry-After before resending; never retry in a tight loop.')}</Principle>
        </>
      ),
    },
  ],
}

const realtimeOrders: ResourceDoc = {
  summary: tx(
    'Kênh WebSocket đẩy thay đổi trạng thái đơn tới khách và quán ngay khi xảy ra, để không phải hỏi lại liên tục.',
    'A WebSocket channel pushes order status changes to customers and shops as they happen, so nobody has to poll.',
  ),
  sections: [
    {
      id: 'connect',
      title: tx('Kết nối', 'Connect'),
      body: (
        <List
          ordered
          items={[
            <>
              {tx('Mở kết nối tới ', 'Open a connection to ')}
              <C>/ws/orders</C>.
            </>,
            tx('Tin nhắn đầu tiên mang access token.', 'The first message carries the access token.'),
            tx('Mỗi tin sau đó là một thay đổi trạng thái của một đơn bạn được xem.', 'Each following message is a status change of an order you may see.'),
          ]}
        />
      ),
    },
    {
      id: 'reconnect',
      title: tx('Khi mất kết nối', 'When the connection drops'),
      body: (
        <Principle>
          {tx('Tải lại danh sách đơn rồi mới kết nối lại, để không bỏ sót thay đổi trong lúc mất kết nối.', 'Reload the order list before reconnecting, so no change made while disconnected is missed.')}
        </Principle>
      ),
    },
  ],
}

const apiReference: ResourceDoc = {
  summary: tx(
    'Tài liệu đầy đủ của từng endpoint, sinh từ chính mã nguồn backend nên luôn khớp với API đang chạy.',
    'The full reference of every endpoint, generated from the backend source so it always matches the running API.',
  ),
  sections: [
    {
      id: 'interactive',
      title: tx('Tài liệu tương tác và OpenAPI', 'Interactive reference and OpenAPI'),
      body: (
        <>
          <List
            items={[
              tx('Tài liệu tương tác: xem và thử gọi từng endpoint ngay trên trình duyệt.', 'Interactive reference: browse and try every endpoint right in the browser.'),
              tx('Tài liệu OpenAPI 3 (JSON): dùng để sinh mã client cho ngôn ngữ của bạn.', 'OpenAPI 3 document (JSON): use it to generate a client for your language.'),
            ]}
          />
          {referenceLinks}
          <P>{tx('Cần hỗ trợ tích hợp? Gửi yêu cầu ở trang Liên hệ hỗ trợ và chọn chủ đề Khác.', 'Need help integrating? Send a request on the Contact support page and choose the topic Other.')}</P>
        </>
      ),
    },
  ],
}

export const DEVELOPERS: Record<string, Record<string, ResourceDoc>> = {
  'get-started': { overview, authentication, 'making-requests': makingRequests },
  api: { errors, 'rate-limits': rateLimits, 'realtime-orders': realtimeOrders },
  reference: { 'api-reference': apiReference },
}
