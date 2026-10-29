import { LoaderCircleIcon } from 'lucide-react'
import { t, tx } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { C, Code, DataTable, H3, List, P, Principle, Rules, Say } from '../doc'
import type { ResourceDoc } from '../doc'

const contentDesign: ResourceDoc = {
  summary: tx(
    'Chữ trên giao diện là một phần của thiết kế. Người dùng bonbon đọc lướt khi đang nấu, đang giao hoặc đang đói; chữ ngắn và rõ giúp họ làm xong việc.',
    'Interface text is part of the design. bonbon users skim while cooking, delivering or hungry; short, clear text gets their job done.',
  ),
  sections: [
    {
      id: 'voice',
      title: tx('Nói như một người hàng xóm giúp được việc', 'Sound like a helpful neighbour'),
      body: (
        <>
          <P>
            {tx(
              'Gọi người dùng là "bạn". Nói thẳng việc sẽ xảy ra, không khách sáo, không đùa khi người dùng đang gặp lỗi hay mất tiền.',
              'Address people as "you". Say plainly what will happen, without formality, and never joke when someone has an error or is losing money.',
            )}
          </P>
          <Say ok>{tx('"Quán sẽ được báo và đơn bị huỷ."', '"The shop is told and the order is cancelled."')}</Say>
          <Say ok={false}>{tx('"Yêu cầu huỷ đơn hàng của quý khách đã được hệ thống ghi nhận thành công."', '"Your order cancellation request has been successfully recorded by the system."')}</Say>
        </>
      ),
    },
    {
      id: 'by-element',
      title: tx('Viết theo từng loại chữ', 'Write for each kind of text'),
      body: (
        <DataTable
          head={[tx('Chỗ', 'Where'), tx('Cách viết', 'How'), tx('Ví dụ', 'Example')]}
          rows={[
            [tx('Nút', 'Button'), tx('Động từ + đối tượng, viết hoa chữ đầu, không dấu chấm', 'Verb + object, sentence case, no full stop'), tx('Nhận đơn · Thêm món', 'Accept order · Add dish')],
            [tx('Nhãn ô nhập', 'Field label'), tx('Danh từ ngắn, gọi đúng tên thứ cần nhập', 'A short noun naming what to enter'), tx('Số điện thoại', 'Phone number')],
            [tx('Nhãn trạng thái', 'Status badge'), tx('Một hai từ, không câu', 'One or two words, no sentence'), tx('Đang chuẩn bị', 'Preparing')],
            [tx('Lỗi', 'Error'), tx('Nói cách sửa, không đổ lỗi', 'Say how to fix it, never blame'), tx('Số điện thoại cần 10 chữ số, bắt đầu bằng 0.', 'The phone number needs 10 digits, starting with 0.')],
            [tx('Trạng thái trống', 'Empty state'), tx('Vì sao trống + việc làm tiếp', 'Why it is empty + what to do next'), tx('Thực đơn đang trống. Thêm món đầu tiên.', 'The menu is empty. Add your first dish.')],
            [tx('Xác nhận', 'Confirmation'), tx('Hỏi bằng việc sẽ làm; nút lặp lại động từ', 'Ask with the action; the button repeats the verb'), tx('Xoá món này? · Xoá / Huỷ', 'Delete this dish? · Delete / Cancel')],
          ]}
        />
      ),
    },
    {
      id: 'two-languages',
      title: tx('Viết cả hai ngôn ngữ cùng lúc', 'Write both languages at once'),
      body: (
        <>
          <P>
            {tx('Tiếng Việt là câu gốc trong mã; câu tiếng Anh nằm trong ', 'Vietnamese is the source text in the code; the English lives in ')}
            <C>en.ts</C>
            {tx(
              '. Câu tiếng Anh thường dài hơn 20–30 %: để chỗ cho nó, đừng cắt chữ. Không ghép câu từ nhiều mảnh, vì thứ tự từ hai ngôn ngữ khác nhau; dùng chỗ trống có tên.',
              '. English often runs 20–30% longer: leave room for it, never truncate. Do not build sentences from pieces, because word order differs between the languages; use named placeholders.',
            )}
          </P>
          <Code>{`t('Đã duyệt {v0}. Người bán sẽ nhận email.', { v0: shop.name })
// en.ts: 'Approved {v0}. The seller will get an email.'`}</Code>
          <Principle>{tx('Một câu là một khoá dịch.', 'One sentence, one translation key.')}</Principle>
        </>
      ),
    },
    {
      id: 'numbers',
      title: tx('Số, tiền và thời gian', 'Numbers, money and time'),
      body: (
        <List
          items={[
            tx('Tiền là đồng, không số lẻ, ký hiệu ₫ sau số: 129.000 ₫ (tiếng Anh: 129,000 ₫).', 'Money is in dong, no decimals, ₫ after the number: 129.000 ₫ (English: 129,000 ₫).'),
            tx('Giờ theo giờ Việt Nam, 24 giờ: 18:40.', 'Times in Vietnam time, 24-hour: 18:40.'),
            tx('So sánh luôn kèm mốc: "+12% so với kỳ trước".', 'Comparisons always state the baseline: "+12% vs previous period".'),
          ]}
        />
      ),
    },
  ],
  takeaway: tx(
    'Ngắn, nói việc sẽ xảy ra, nói cách sửa khi có lỗi, và luôn có câu tiếng Anh đi cùng.',
    'Short, saying what will happen, saying how to fix errors, and always paired with English.',
  ),
}

const designTokens: ResourceDoc = {
  summary: tx(
    'Token là tên đặt cho một quyết định thiết kế: một màu, một bo góc, một khoảng cách. Màn hình gọi tên token thay vì giá trị, để đổi một quyết định là đổi ở một chỗ.',
    'A token is a name for a design decision: a colour, a radius, a spacing. Screens call the token by name instead of its value, so changing a decision means changing one place.',
  ),
  sections: [
    {
      id: 'layers',
      title: tx('Ba tầng token', 'Three layers of tokens'),
      body: (
        <>
          <DataTable
            head={[tx('Tầng', 'Layer'), tx('Ví dụ web', 'Web example'), tx('Ví dụ điện thoại', 'Phone example'), tx('Ai dùng', 'Who uses it')]}
            rows={[
              [tx('Bảng màu', 'Palette'), <C>--orange-500</C>, <C>palette.orange500</C>, tx('Chỉ tầng ngữ nghĩa', 'Only the semantic layer')],
              [tx('Ngữ nghĩa', 'Semantic'), <C>--primary</C>, <C>colors.light.primary</C>, tx('Component và màn hình', 'Components and screens')],
              [tx('Lớp dùng', 'Usage'), <C>bg-primary</C>, <C>theme.primary</C>, tx('Mã màn hình', 'Screen code')],
            ]}
          />
          <Principle>{tx('Màn hình không bao giờ gọi thẳng tầng bảng màu.', 'Screens never call the palette layer directly.')}</Principle>
        </>
      ),
    },
    {
      id: 'naming',
      title: tx('Đặt tên theo vai trò, không theo màu', 'Name by role, not by colour'),
      body: (
        <>
          <P>
            {tx(
              'Tên ngữ nghĩa nói thứ đó dùng để làm gì: primary, muted-foreground, danger-subtle. Khi màu thương hiệu đổi từ xanh sang cam, không màn hình nào phải sửa.',
              'Semantic names say what something is for: primary, muted-foreground, danger-subtle. When the brand colour changed from green to orange, no screen had to change.',
            )}
          </P>
          <Say ok><C>text-muted-foreground</C></Say>
          <Say ok={false}><C>text-[#6E6E6E]</C></Say>
        </>
      ),
    },
    {
      id: 'where',
      title: tx('Token nằm ở đâu', 'Where tokens live'),
      body: (
        <DataTable
          head={[tx('Nền tảng', 'Platform'), tx('Tệp', 'File'), tx('Giao diện tối', 'Dark theme')]}
          rows={[
            ['Web', <C>web/src/shared/ui/tokens.css</C>, tx('lớp .dark ghi đè cùng tên', 'the .dark class overrides the same names')],
            ['Android / iOS', <C>mobile/src/shared/ui/tokens.ts</C>, <><C>colors.dark</C>{tx(', đọc qua useTheme()', ', read through useTheme()')}</>],
          ]}
        />
      ),
    },
    {
      id: 'change',
      title: tx('Đổi một token', 'Changing a token'),
      body: (
        <List
          ordered
          items={[
            tx('Đổi giá trị ở cả tokens.css và tokens.ts, giữ hai bên bằng nhau.', 'Change the value in both tokens.css and tokens.ts, keeping them equal.'),
            tx('Kiểm tra lại độ tương phản với các cặp chữ/nền dùng token đó.', 'Recheck contrast for the text/background pairs that use it.'),
            tx('Ghi vào Có gì mới: đổi gì, vì sao, màn hình cũ cần làm gì.', "Record it in What's new: what changed, why, what older screens need."),
          ]}
        />
      ),
    },
  ],
  takeaway: tx('Gọi token bằng vai trò, giữ web và điện thoại cùng giá trị, và để tầng bảng màu cho riêng tầng ngữ nghĩa.', 'Call tokens by role, keep web and phone values equal, and leave the palette to the semantic layer.'),
}

const handoffs: ResourceDoc = {
  summary: tx(
    'Bàn giao là lúc một thiết kế thành mã. Bàn giao tốt nghĩa là người làm không phải đoán: mọi trạng thái, mọi câu chữ và mọi tên đều đã có.',
    'A handoff is when a design becomes code. A good handoff means the developer never has to guess: every state, every piece of text and every name is already there.',
  ),
  sections: [
    {
      id: 'checklist',
      title: tx('Gửi kèm đủ những thứ này', 'Send all of these'),
      body: (
        <DataTable
          head={[tx('Mục', 'Item'), tx('Cần có', 'Must include')]}
          rows={[
            [tx('Tên', 'Names'), tx('Tên component đúng như trong mã (Button, PageTabs, StatTile)', 'Component names exactly as in code (Button, PageTabs, StatTile)')],
            [tx('Token', 'Tokens'), tx('Tên token cho mọi màu, bo góc, khoảng cách', 'Token names for every colour, radius, spacing')],
            [tx('Trạng thái', 'States'), tx('Mặc định, rê chuột, chọn bằng bàn phím, không dùng được, đang tải, trống, lỗi', 'Default, hover, keyboard focus, disabled, loading, empty, error')],
            [tx('Chữ', 'Text'), tx('Câu tiếng Việt và tiếng Anh cuối cùng, kể cả câu lỗi', 'Final Vietnamese and English text, error messages included')],
            [tx('Trợ năng', 'Accessibility'), tx('Tên cho nút chỉ có biểu tượng, thứ tự Tab, cái gì được đọc khi thay đổi', 'Names for icon-only buttons, Tab order, what is announced on change')],
            [tx('Nền tảng', 'Platforms'), tx('Web, Android, iOS khác nhau ở đâu', 'Where web, Android and iOS differ')],
          ]}
        />
      ),
    },
    {
      id: 'new-components',
      title: tx('Component mới cần lý do', 'A new component needs a reason'),
      body: (
        <>
          <P>
            {tx(
              'Nếu thiết kế cần một component chưa có, ghi rõ: nó làm gì mà component có sẵn không làm được, và sẽ dùng ở hai nơi nào. Đặt tên tiếng Anh theo kiểu PascalCase trước khi bàn giao.',
              'If a design needs a component that does not exist, state what it does that existing ones cannot, and the two places it will be used. Give it an English PascalCase name before handing off.',
            )}
          </P>
          <Principle>{tx('Không có tên trong mã thì chưa phải component.', 'Without a name in code, it is not a component yet.')}</Principle>
        </>
      ),
    },
    {
      id: 'review',
      title: tx('Duyệt lại trên bản chạy thật', 'Review on the running build'),
      body: (
        <P>
          {tx(
            'Người thiết kế xem lại trên bản chạy thật ở cả hai ngôn ngữ, cỡ chữ 150 % và trên điện thoại thật, trước khi đóng việc.',
            'The designer reviews the running build in both languages, at 150% text size and on a real phone, before closing the task.',
          )}
        </P>
      ),
    },
  ],
  takeaway: tx('Bàn giao gồm tên, token, mọi trạng thái, chữ hai ngôn ngữ và trợ năng, rồi duyệt trên bản thật.', 'A handoff carries names, tokens, every state, text in two languages and accessibility, then a review on the real build.'),
}

const onboarding: ResourceDoc = {
  summary: tx(
    'Làm quen là những phút đầu tiên của một người với bonbon: mở quán, đặt món đầu tiên. Mục tiêu là đưa họ tới việc có ích đầu tiên nhanh nhất, không phải giải thích mọi thứ.',
    'Onboarding is someone\'s first minutes with bonbon: opening a shop, placing a first order. The goal is to get them to their first useful result fast, not to explain everything.',
  ),
  sections: [
    {
      id: 'do-not-tour',
      title: tx('Dạy bằng việc làm, không bằng chuyến tham quan', 'Teach by doing, not by touring'),
      body: (
        <>
          <P>
            {tx(
              'bonbon không có màn hình giới thiệu nhiều trang. Mỗi màn hình tự giải thích bằng tiêu đề, một câu mô tả và trạng thái trống có hướng dẫn.',
              'bonbon has no multi-page intro carousel. Each screen explains itself with its title, one line of description and an empty state that guides.',
            )}
          </P>
          <Say ok>{tx('Thực đơn đang trống. Bắt đầu bằng một mục như "Cơm", rồi thêm món vào đó.', 'The menu is empty. Start with a section like "Rice", then add dishes to it.')}</Say>
          <Say ok={false}>{tx('Năm trang giới thiệu tính năng trước khi vào được ứng dụng.', 'Five pages of feature tour before reaching the app.')}</Say>
        </>
      ),
    },
    {
      id: 'long-forms',
      title: tx('Chia biểu mẫu dài thành bước và lưu nháp', 'Split long forms into steps and save drafts'),
      body: (
        <>
          <P>
            {tx(
              'Mở quán cần năm bước: thông tin quán, giao hàng và giờ mở cửa, thuế và tài khoản nhận tiền, định danh, xác nhận. Mỗi bước lưu nháp, nên chủ quán có thể dừng và quay lại.',
              'Opening a shop takes five steps: shop details, delivery and hours, tax and payout account, identity, confirmation. Each step saves a draft, so owners can stop and come back.',
            )}
          </P>
          <List
            items={[
              tx('Hiện bước đang ở và tổng số bước.', 'Show the current step and the total.'),
              tx('Nói trước cần chuẩn bị gì (giấy tờ, số tài khoản).', 'Say up front what to have ready (documents, account number).'),
              tx('Sau khi gửi, nói rõ việc tiếp theo và bao lâu.', 'After submitting, say what happens next and how long it takes.'),
            ]}
          />
          <Principle>{tx('Không bao giờ để người dùng mất dữ liệu đã nhập vì phải dừng giữa chừng.', 'Never let people lose what they typed because they had to stop halfway.')}</Principle>
        </>
      ),
    },
    {
      id: 'first-success',
      title: tx('Đánh dấu lần thành công đầu tiên', 'Mark the first success'),
      body: (
        <P>
          {tx(
            'Khi hồ sơ được duyệt hoặc đơn đầu tiên được giao, báo bằng một câu và việc nên làm tiếp (bật nhận đơn, xem đơn). Không dùng pháo giấy hay hoạt hình dài.',
            'When an application is approved or a first order is delivered, say so in one sentence with the next useful step (start taking orders, view the order). No confetti or long animations.',
          )}
        </P>
      ),
    },
  ],
  takeaway: tx('Không tham quan; mỗi màn hình tự giải thích, biểu mẫu dài chia bước và lưu nháp, và luôn nói việc tiếp theo.', 'No tours; every screen explains itself, long forms are stepped with drafts, and the next step is always stated.'),
}

const waitUx: ResourceDoc = {
  summary: tx(
    'Chờ là lúc hệ thống đang tải, đang gửi hoặc đang chờ người khác (quán nhận đơn, quản trị viên duyệt). Chờ được thiết kế tốt nói rõ điều gì đang xảy ra và giữ người dùng ở nguyên chỗ.',
    'Waiting is when the system is loading, sending or waiting on someone else (a shop accepting, an administrator reviewing). A well-designed wait says clearly what is happening and keeps people where they are.',
  ),
  sections: [
    {
      id: 'thresholds',
      title: tx('Chọn chỉ báo theo thời gian chờ', 'Pick the indicator by wait time'),
      body: (
        <>
          <DataTable
            head={[tx('Thời gian', 'Wait'), tx('Hiện gì', 'Show'), tx('Ví dụ trong bonbon', 'Example in bonbon')]}
            rows={[
              [tx('Dưới 1 giây', 'Under 1 s'), tx('Không hiện gì', 'Nothing'), tx('Đổi tab, lọc danh sách', 'Switching tabs, filtering')],
              [tx('1–3 giây', '1–3 s'), tx('Nút đổi chữ và không bấm được nữa, hoặc vòng quay nhỏ', 'The button changes its text and locks, or a small spinner'), tx('Đang gửi…', 'Sending…')],
              [tx('Tải nội dung', 'Loading content'), tx('Khung xương (Skeleton) theo hình nội dung', 'A Skeleton shaped like the content'), tx('Danh sách đơn, thống kê', 'Order list, statistics')],
              [tx('Chờ người khác', 'Waiting on people'), tx('Trạng thái rõ + thời hạn + sẽ được báo thế nào', 'A clear status + the deadline + how they will be told'), tx('Chờ quán xác nhận; hồ sơ chờ duyệt', 'Waiting for the shop to confirm; application pending review')],
            ]}
          />
        </>
      ),
    },
    {
      id: 'patterns',
      title: tx('Các mẫu chờ', 'Wait patterns'),
      body: (
        <>
          <H3>{tx('Nút đang gửi', 'Sending button')}</H3>
          <P>
            {tx(
              'Nút mờ đi, đổi chữ sang động từ đang làm và không bấm lại được, để không tạo hai đơn. Trên điện thoại, Button có loading hiện vòng quay thay cho chữ.',
              'The button fades, its text becomes the in-progress verb and it cannot be pressed again, so no duplicate orders are made. On phones, Button with loading shows a spinner instead of the text.',
            )}
          </P>
          <Rules
            items={[
              { ok: true, caption: tx('Nói việc đang làm', 'Says what is happening'), demo: <Button disabled><LoaderCircleIcon className="animate-spin" />{t('Đang gửi…')}</Button> },
              { ok: false, caption: tx('Vòng quay không lời', 'A spinner with no words'), demo: <Button disabled size="icon" aria-label={t('Đang tải…')}><LoaderCircleIcon className="animate-spin" /></Button> },
            ]}
          />
          <H3>Skeleton</H3>
          <P>
            {tx(
              'Khung xương giữ đúng hình nội dung sắp hiện, để trang không nhảy khi dữ liệu tới. Không để trang trắng.',
              'Skeletons keep the shape of the content about to appear, so the page does not jump when data arrives. Never leave a blank page.',
            )}
          </P>
          <div className="flex flex-col gap-2 rounded-xl border border-grey-200 p-4">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <H3>{tx('Cập nhật trực tiếp', 'Live updates')}</H3>
          <P>
            {tx(
              'Trạng thái đơn đến qua kết nối trực tiếp. Khi mất kết nối, nói điều đó và cách hệ thống tự xử lý: "Mất kết nối trực tiếp, đang tự tải lại mỗi 10 giây."',
              'Order statuses arrive over a live connection. When it drops, say so and how the system copes: "Live connection lost, reloading every 10 seconds."',
            )}
          </P>
        </>
      ),
    },
    {
      id: 'words',
      title: tx('Chữ khi chờ', 'Words while waiting'),
      body: (
        <>
          <List
            items={[
              tx('Đang làm: động từ + dấu ba chấm: "Đang gửi…", "Đang tải…".', 'In progress: an -ing verb + ellipsis: "Sending…", "Loading…".'),
              tx('Xong: nói kết quả: "Đã lưu món."', 'Done: state the result: "Dish saved."'),
              tx('Chờ người khác: nói ai, tới khi nào: "Chờ quán xác nhận".', 'Waiting on people: say who and until when: "Waiting for the shop to confirm".'),
            ]}
          />
          <P>
            {tx('Vùng thông báo kết quả có ', 'The area announcing the result has ')}
            <C>role="status"</C>
            {tx(' hoặc ', ' or ')}
            <C>aria-live="polite"</C>
            {tx(' để trình đọc màn hình đọc lên.', ' so screen readers read it out.')}
          </P>
          <Principle>{tx('Người dùng luôn biết đang chờ cái gì, và chờ tới bao giờ.', 'People always know what they are waiting for, and until when.')}</Principle>
        </>
      ),
    },
  ],
  takeaway: tx('Không hiện gì dưới 1 giây, khoá nút khi gửi, Skeleton khi tải, và nói rõ ai đang làm gì khi chờ người khác.', 'Show nothing under 1 second, lock buttons while sending, Skeleton while loading, and say who is doing what when waiting on people.'),
}

export const UX: Record<string, ResourceDoc> = { 'content-design': contentDesign, 'design-tokens': designTokens, handoffs, onboarding, 'wait-ux': waitUx }
