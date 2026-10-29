import { ArrowRightIcon, BellIcon, PlusIcon, SearchIcon, ShoppingBagIcon, TrashIcon } from 'lucide-react'
import { t, tx } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Stage } from '../components/parts'
import { LogoGrid, SwatchGrid } from '../assets'
import { BRAND_COLORS, CHART_COLORS, STATE_COLORS } from '../colors'
import { C, DataTable, H3, List, P, Principle, Rules } from '../doc'
import type { ResourceDoc } from '../doc'

const principles: ResourceDoc = {
  summary: tx(
    'Năm nguyên tắc mọi màn hình bonbon giữ, từ ứng dụng đặt món tới trang quản trị. Khi hai lựa chọn đều hợp lý, chọn cái giữ đúng các nguyên tắc này.',
    'Five principles every bonbon screen keeps, from the ordering app to the admin site. When two choices both seem reasonable, pick the one that keeps these.',
  ),
  sections: [
    {
      id: 'content-first',
      title: tx('Để nội dung nổi lên', 'Let the content stand out'),
      body: (
        <>
          <P>
            {tx(
              'Nền trắng và nhiều khoảng trống. Chữ nội dung màu đen; điều hướng, nhãn và mô tả màu xám. Người xem nhìn thấy món, đơn và con số trước, khung giao diện sau.',
              'White backgrounds and plenty of space. Content text is black; navigation, labels and descriptions are grey. People see the dishes, orders and numbers first, the interface frame second.',
            )}
          </P>
          <Principle>{tx('Nếu khung giao diện gây chú ý hơn nội dung, hãy bớt khung.', 'If the frame draws more attention than the content, remove some frame.')}</Principle>
        </>
      ),
    },
    {
      id: 'one-main-action',
      title: tx('Mỗi vùng một việc chính', 'One main action per region'),
      body: (
        <>
          <P>
            {tx(
              'Mỗi vùng có nhiều nhất một nút chính màu mực. Các việc khác là nút phụ hoặc nút chữ. Người xem không phải đoán bấm vào đâu.',
              'Each region has at most one ink primary button. Other actions are secondary or text buttons. People never have to guess what to press.',
            )}
          </P>
          <Rules
            items={[
              { ok: true, caption: tx('Một nút chính, một nút phụ', 'One primary, one secondary'), demo: <><Button>{t('Nhận đơn')}</Button><Button variant="secondary">{t('Từ chối đơn')}</Button></> },
              { ok: false, caption: tx('Hai nút chính tranh nhau', 'Two primary buttons competing'), demo: <><Button>{t('Nhận đơn')}</Button><Button>{t('Từ chối đơn')}</Button></> },
            ]}
          />
        </>
      ),
    },
    {
      id: 'selection-is-colour',
      title: tx('Đang chọn thì đổi màu chữ, không đổi khối', 'Selection changes the text colour, not the block'),
      body: (
        <P>
          {tx(
            'Mục đang chọn (tab, menu, lựa chọn nhanh) có chữ cam. Rê chuột lên bất kỳ mục nào cho nền xám nhẹ và chữ đen, kể cả mục đang chọn. Viền chỉ xuất hiện quanh thứ đang chọn hoặc thứ cần ranh giới, như bảng.',
            'The selected item (tab, menu, quick choice) has orange text. Hovering any item gives a light grey background and black text, the selected one included. Borders appear only around what is selected or what needs a boundary, like tables.',
          )}
        </P>
      ),
    },
    {
      id: 'everyone',
      title: tx('Dùng được cho mọi người', 'Usable by everyone'),
      body: (
        <List
          items={[
            tx('Chữ nội dung đạt tương phản ít nhất 4,5:1; biểu tượng và viền điều khiển đạt 3:1.', 'Content text reaches at least 4.5:1 contrast; icons and control borders 3:1.'),
            tx('Mọi thứ bấm được cũng dùng được bằng bàn phím, với vòng viền khi chọn luôn hiện.', 'Everything clickable also works with the keyboard, with a focus ring that is always visible.'),
            tx('Không dựa vào màu một mình: trạng thái có chữ, liên kết có gạch chân.', 'Never rely on colour alone: statuses have words, links have underlines.'),
            tx('Ứng dụng điện thoại đổi được cỡ chữ 100, 125 và 150 %; trang web chịu được trình duyệt phóng to 200 %, bố cục không vỡ.', 'The phone app offers 100, 125 and 150% text; the web survives 200% browser zoom without breaking the layout.'),
            tx('Tiếng Việt và tiếng Anh đều đầy đủ.', 'Vietnamese and English are both complete.'),
          ]}
        />
      ),
    },
    {
      id: 'one-product',
      title: tx('Một sản phẩm trên mọi màn hình', 'One product on every screen'),
      body: (
        <P>
          {tx(
            'Khách đặt món trên điện thoại, chủ quán làm việc trên cả điện thoại và web, quản trị viên trên web. Cùng một trạng thái đơn phải có cùng tên, cùng màu ở cả ba nơi.',
            'Customers order on their phones, shop owners work on both phone and web, administrators on the web. The same order status must have the same name and colour in all three places.',
          )}
        </P>
      ),
    },
  ],
  takeaway: tx(
    'Nội dung trước, một việc chính mỗi vùng, chọn bằng màu chữ, dùng được cho mọi người, và giống nhau trên mọi nền tảng.',
    'Content first, one main action per region, selection by text colour, usable by everyone, and the same on every platform.',
  ),
}

const logo: ResourceDoc = {
  summary: tx(
    'Logo bonbon là con gấu cạnh chữ bonbon. Tải bản đúng cho nền bạn dùng và giữ các quy tắc bên dưới để logo luôn rõ.',
    'The bonbon logo is the bear beside the bonbon wordmark. Download the right version for your background and keep the rules below so it always reads clearly.',
  ),
  sections: [
    {
      id: 'files',
      title: tx('Chọn bản theo nền', 'Pick the version for the background'),
      body: (
        <>
          <P>
            {tx(
              'Tất cả là SVG, phóng to không vỡ. Bản màu cho nền sáng, bản trắng cho nền tối. Hình con gấu là "Saving Bear Market" trong bộ Streamline Freehand, dùng theo giấy phép CC BY 4.0: nơi nào đặt logo cần ghi nguồn.',
              'All files are SVG and scale without blurring. The colour version is for light backgrounds, the white one for dark. The bear is "Saving Bear Market" from Streamline Freehand, used under CC BY 4.0: wherever the logo appears, credit the source.',
            )}
          </P>
          <LogoGrid />
        </>
      ),
    },
    {
      id: 'clear-space',
      title: tx('Giữ khoảng trống và cỡ tối thiểu', 'Keep clear space and minimum size'),
      body: (
        <List
          items={[
            t('Giữ khoảng trống quanh logo bằng ít nhất chiều cao của chữ “b”.'),
            t('Giữ logo ngang không nhỏ hơn 96 px chiều rộng, biểu tượng không nhỏ hơn 24 px.'),
            t('Dùng bản màu trên nền sáng, bản trắng trên nền tối.'),
          ]}
        />
      ),
    },
    {
      id: 'misuse',
      title: tx('Không biến đổi logo', 'Do not alter the logo'),
      body: (
        <>
          <List
            items={[
              t('Không kéo giãn, xoay hoặc đổi tỷ lệ logo.'),
              t('Không đổi màu logo sang màu khác ngoài hai bản màu và trắng.'),
              t('Không thêm bóng đổ, viền hay hiệu ứng lên logo.'),
              t('Không đặt logo lên nền ảnh rối khiến khó nhìn.'),
            ]}
          />
          <Principle>{tx('Logo chỉ có hai màu: mực và trắng.', 'The logo has only two colours: ink and white.')}</Principle>
        </>
      ),
    },
  ],
}

const color: ResourceDoc = {
  summary: tx(
    'Màu giúp người xem biết đâu là nội dung, đâu là thứ đang chọn và đâu là việc cần để ý. bonbon dùng ít màu: trắng, mực, hai sắc xám, cam thương hiệu và bốn màu trạng thái.',
    'Colour tells people what is content, what is selected and what needs attention. bonbon uses few colours: white, ink, two greys, the brand orange and four state colours.',
  ),
  sections: [
    {
      id: 'brand-and-neutrals',
      title: tx('Màu thương hiệu và màu trung tính', 'Brand and neutral colours'),
      body: (
        <>
          <P>
            {tx(
              'Cam #FE551B đạt 3,22:1 trên nền trắng: đủ cho chữ lớn và các phần điều khiển, nhưng chưa đủ cho chữ nhỏ. Vì vậy nút chính màu mực; cam dành cho liên kết, mục đang chọn và điểm nhấn. Cần chữ cam nhỏ thì dùng Orange 600 #CC3D0B (4,95:1).',
              'Orange #FE551B reaches 3.22:1 on white: enough for large text and controls, not for small text. So primary buttons are ink; orange is for links, selected items and accents. For small orange text use Orange 600 #CC3D0B (4.95:1).',
            )}
          </P>
          <SwatchGrid colors={BRAND_COLORS} />
        </>
      ),
    },
    {
      id: 'states',
      title: tx('Màu trạng thái nói một việc', 'State colours say one thing'),
      body: (
        <>
          <P>
            {tx(
              'Mỗi màu trạng thái có ba sắc: màu chính, nền nhạt (-subtle) và chữ trên nền nhạt (-fg). Nhãn trạng thái dùng nền nhạt và chữ đậm, không dùng màu chính làm nền.',
              'Each state colour has three shades: the main colour, a pale background (-subtle) and text on that background (-fg). Status badges use the pale background with dark text, never the main colour as a background.',
            )}
          </P>
          <SwatchGrid colors={STATE_COLORS} />
          <Principle>{tx('Màu trạng thái không dùng để trang trí.', 'State colours are never decoration.')}</Principle>
        </>
      ),
    },
    {
      id: 'charts',
      title: tx('Biểu đồ dùng ba màu theo thứ tự cố định', 'Charts use three colours in a fixed order'),
      body: (
        <>
          <P>
            {tx(
              'Ba màu chuỗi được kiểm tra cho người mù màu trên nền be. Chuỗi thứ nhất luôn là cam. Chữ và nhãn trên biểu đồ không dùng màu chuỗi.',
              'The three series colours are checked for colour blindness on the beige background. The first series is always orange. Text and labels on charts never use series colours.',
            )}
          </P>
          <SwatchGrid colors={CHART_COLORS} />
        </>
      ),
    },
    {
      id: 'dark',
      title: tx('Giao diện tối đổi giá trị, không đổi tên', 'The dark theme changes values, not names'),
      body: (
        <P>
          {tx('Mỗi token có giá trị cho giao diện sáng và tối. Màn hình chỉ gọi tên token (', 'Every token has a light and a dark value. Screens only name the token (')}
          <C>bg-primary</C>, <C>theme.text</C>
          {tx('), nên tự đổi khi giao diện đổi. Bảng đầy đủ ở Token cho web › Token màu.', '), so they switch with the theme. The full table is in Web tokens › Color tokens.')}
        </P>
      ),
    },
  ],
  takeaway: tx(
    'Mực cho nội dung và nút chính, xám cho khung, cam cho thứ đang chọn và liên kết, màu trạng thái chỉ cho trạng thái.',
    'Ink for content and primary buttons, grey for the frame, orange for selection and links, state colours only for states.',
  ),
}

const elevation: ResourceDoc = {
  summary: tx(
    'Độ nổi cho biết một lớp nằm trên trang hay nằm trong trang. bonbon gần như phẳng: chỉ những lớp nổi lên trên nội dung mới có bóng.',
    'Elevation tells whether a layer sits on top of the page or within it. bonbon is almost flat: only layers floating above the content get a shadow.',
  ),
  sections: [
    {
      id: 'flat-by-default',
      title: tx('Phẳng là mặc định', 'Flat by default'),
      body: (
        <>
          <P>
            {tx(
              'Thẻ, bảng và khối số liệu nằm trong trang nên không có bóng. Chúng tách khỏi nhau bằng khoảng trống, nền be hoặc một đường kẻ mảnh.',
              'Cards, tables and stats sit within the page, so they have no shadow. They are separated by space, a beige background or a thin line.',
            )}
          </P>
          <Rules
            items={[
              { ok: true, caption: tx('Thẻ phẳng, tách bằng nền', 'A flat card, separated by background'), demo: <div className="w-56 rounded-xl bg-white p-4 text-ui">{t('Đơn #{v0}', { v0: 1042 })}</div> },
              { ok: false, caption: tx('Bóng đổ cho thứ không nổi', 'A shadow on something that does not float'), demo: <div className="w-56 rounded-xl bg-white p-4 text-ui shadow-xl">{t('Đơn #{v0}', { v0: 1042 })}</div> },
            ]}
          />
        </>
      ),
    },
    {
      id: 'one-shadow',
      title: tx('Một bóng cho mọi lớp nổi', 'One shadow for every floating layer'),
      body: (
        <>
          <DataTable
            head={[tx('Lớp', 'Layer'), tx('Ví dụ', 'Examples'), 'Token']}
            rows={[
              [tx('Trang', 'Page'), tx('Nội dung, thẻ, bảng', 'Content, cards, tables'), tx('không bóng', 'no shadow')],
              [tx('Thanh dính', 'Sticky bar'), tx('Đầu trang khi cuộn', 'The header while scrolling'), <C>bg-white/90 backdrop-blur</C>],
              [tx('Lớp nổi', 'Floating'), tx('Menu, popover, hộp thoại, sheet', 'Menus, popovers, dialogs, sheets'), <C>shadow-float</C>],
            ]}
          />
          <Stage>
            <div className="w-60 rounded-xl bg-white p-4 text-ui shadow-float">
              <p className="font-medium">shadow-float</p>
              <p className="text-muted-foreground">0 8px 28px / 8% · 0 1px 3px / 6%</p>
            </div>
          </Stage>
          <Principle>{tx('Nếu nó không che lên thứ khác, nó không có bóng.', 'If it does not cover something else, it has no shadow.')}</Principle>
        </>
      ),
    },
    {
      id: 'mobile',
      title: tx('Trên điện thoại', 'On phones'),
      body: (
        <P>
          {tx(
            'Sheet trượt từ dưới lên trên một lớp nền tối 40 %, không cần bóng. Thanh tab nổi ở đáy màn hình là lớp nổi duy nhất luôn hiện.',
            'Sheets slide up over a 40% dark scrim and need no shadow. The floating tab bar at the bottom is the only floating layer that is always visible.',
          )}
        </P>
      ),
    },
  ],
  takeaway: tx('Khoảng trống và nền tách các khối; bóng chỉ dành cho thứ nổi lên trên.', 'Space and backgrounds separate blocks; shadows are only for what floats above.'),
}

const iconography: ResourceDoc = {
  summary: tx(
    'Biểu tượng giúp nhận ra hành động và loại nội dung nhanh hơn. bonbon dùng bộ Lucide nét mảnh trên cả web và điện thoại.',
    'Icons help people recognise actions and kinds of content faster. bonbon uses the thin-stroke Lucide set on both web and phone.',
  ),
  sections: [
    {
      id: 'library',
      title: tx('Một bộ biểu tượng', 'One icon set'),
      body: (
        <>
          <DataTable
            head={[tx('Nền tảng', 'Platform'), tx('Thư viện', 'Library'), tx('Ví dụ', 'Example')]}
            rows={[
              ['Web', <C>lucide-react</C>, <C>{"<SearchIcon aria-hidden=\"true\" />"}</C>],
              ['Android / iOS', <C>lucide-react-native</C>, <C>{'<Search color={theme.text} />'}</C>],
            ]}
          />
          <Stage>
            {[SearchIcon, ShoppingBagIcon, BellIcon, PlusIcon, TrashIcon, ArrowRightIcon].map((Icon, i) => (
              <Icon key={i} className="size-6 text-ink" strokeWidth={1.75} aria-hidden="true" />
            ))}
          </Stage>
        </>
      ),
    },
    {
      id: 'size-and-stroke',
      title: tx('Cỡ đi theo chữ bên cạnh', 'Size follows the text beside it'),
      body: (
        <DataTable
          head={[tx('Cỡ', 'Size'), tx('Dùng với', 'Used with'), tx('Nét', 'Stroke')]}
          rows={[
            ['16 px', tx('Chữ 14 px: nút, menu, bảng', '14 px text: buttons, menus, tables'), '2'],
            ['18–20 px', tx('Đầu trang, nút lớn', 'Header, large buttons'), '1.75'],
            ['24 px', tx('Biểu tượng đứng riêng, thanh tab điện thoại', 'Standalone icons, the phone tab bar'), '1.75'],
          ]}
        />
      ),
    },
    {
      id: 'meaning',
      title: tx('Biểu tượng đi cùng chữ', 'Icons come with words'),
      body: (
        <>
          <P>
            {tx(
              'Biểu tượng đứng trước chữ và mang màu của chữ. Biểu tượng chỉ đứng một mình khi ý nghĩa rất quen (đóng, tìm, thêm) và luôn có aria-label nói việc nó làm. Biểu tượng trang trí có aria-hidden.',
              'Icons sit before the text and take its colour. An icon stands alone only when its meaning is very familiar (close, search, add), and then always has an aria-label saying what it does. Decorative icons have aria-hidden.',
            )}
          </P>
          <Rules
            items={[
              { ok: true, caption: tx('Biểu tượng cùng chữ', 'Icon with text'), demo: <Button><PlusIcon />{t('Thêm món')}</Button> },
              { ok: false, caption: tx('Biểu tượng lạ đứng một mình', 'An unfamiliar icon on its own'), demo: <Button size="icon" aria-label={t('Thêm món')}><ShoppingBagIcon /></Button> },
            ]}
          />
        </>
      ),
    },
    {
      id: 'illustrations',
      title: tx('Hình minh hoạ cho trạng thái trống', 'Illustrations for empty states'),
      body: (
        <P>
          {tx('Hình minh hoạ nét vẽ tay nằm ở ', 'The hand-drawn illustrations live in ')}
          <C>shared/ui/illustrations</C>
          {tx(
            ' trên cả hai nền tảng, dùng cho trạng thái trống và màn hình chào. Không dùng hình minh hoạ làm nút hay để lấp chỗ trống trong trang có nội dung.',
            ' on both platforms, for empty states and welcome screens. Never use illustrations as buttons or to fill space on a page that has content.',
          )}
        </P>
      ),
    },
  ],
  takeaway: tx('Lucide, nét mảnh, cùng màu và cùng cỡ với chữ bên cạnh, và luôn có tên cho trình đọc màn hình.', 'Lucide, thin strokes, the same colour and size as the text beside it, and always named for screen readers.'),
}

const layout: ResourceDoc = {
  summary: tx(
    'Bố cục quyết định người xem đọc theo thứ tự nào. bonbon dùng lưới 4 px, vài khung trang cố định và khoảng trống rộng giữa các nhóm.',
    'Layout decides the order people read in. bonbon uses a 4 px grid, a few fixed page frames and generous space between groups.',
  ),
  sections: [
    {
      id: 'spacing',
      title: tx('Khoảng cách theo bước 4 px', 'Spacing in 4 px steps'),
      body: (
        <>
          <DataTable
            head={[tx('Bước', 'Step'), tx('Giá trị', 'Value'), tx('Dùng cho', 'Used for')]}
            rows={[
              ['xs', '4', tx('Biểu tượng và chữ trong nhãn', 'Icon and text inside a badge')],
              ['sm', '8', tx('Nhãn và ô nhập; các nút đi cùng nhau', 'Label and field; buttons that go together')],
              ['md / lg', '12 / 16', tx('Trong thẻ; lề trang trên điện thoại', 'Inside cards; page margins on phones')],
              ['xl', '20', tx('Giữa các ô của một biểu mẫu', 'Between fields in a form')],
              ['xxl / xxxl', '24 / 32', tx('Giữa các nhóm; giữa các phần trong trang', 'Between groups; between sections of a page')],
            ]}
          />
          <P>
            {tx('Trên điện thoại các bước là token ', 'On phones the steps are the ')}
            <C>spacing</C>
            {tx('; trên web là lớp Tailwind theo bội số 4 px (', ' tokens; on the web they are Tailwind classes in 4 px multiples (')}
            <C>gap-2</C> = 8 px, <C>gap-6</C> = 24 px).
          </P>
        </>
      ),
    },
    {
      id: 'frames',
      title: tx('Ba khung trang', 'Three page frames'),
      body: (
        <DataTable
          head={[tx('Khung', 'Frame'), tx('Ở đâu', 'Where'), tx('Cấu trúc', 'Structure')]}
          rows={[
            [tx('Trang công khai', 'Public site'), tx('Trang chủ, blog', 'Home, blog'), tx('Đầu trang dính, nội dung rộng tối đa 1440 px, chân trang be', 'Sticky header, content up to 1440 px wide, beige footer')],
            [tx('Trang tài liệu', 'Docs'), tx('Trợ giúp, thương hiệu', 'Help center, brand'), tx('Tab ở trên, mục lục trái, nội dung giữa, tiêu đề phải', 'Tabs on top, menu on the left, content in the middle, headings on the right')],
            [tx('Khu làm việc', 'Workspace'), tx('Người bán, quản trị', 'Seller, admin'), tx('Đầu trang, thanh trái theo nhóm, nội dung, chân trang mỏng', 'Header, grouped left rail, content, thin footer')],
          ]}
        />
      ),
    },
    {
      id: 'touch',
      title: tx('Vùng chạm đủ lớn', 'Touch targets big enough'),
      body: (
        <>
          <P>
            {tx(
              'Trên điện thoại mọi thứ bấm được cao ít nhất 48 (touchTarget.min), lớn hơn mức 44 pt của iOS và bằng 48 dp của Android. Nút chuyển trạng thái đơn của người bán cao 56 (touchTarget.large) vì họ bấm khi tay bận.',
              'On phones everything tappable is at least 48 tall (touchTarget.min), above the iOS 44 pt minimum and equal to the Android 48 dp. The seller\'s next-status button is 56 tall (touchTarget.large) because they press it with busy hands.',
            )}
          </P>
          <Principle>{tx('Khoảng cách gần nghĩa là liên quan; muốn tách nhóm thì tăng khoảng trống trước khi thêm đường kẻ.', 'Close means related; to separate groups, add space before adding lines.')}</Principle>
        </>
      ),
    },
  ],
  takeaway: tx('Bước 4 px, ba khung trang, nhóm bằng khoảng trống, và vùng chạm 48 trở lên.', '4 px steps, three page frames, grouping by space, and touch targets of 48 or more.'),
}

const material: ResourceDoc = {
  summary: tx(
    'Chất liệu là các bề mặt nội dung nằm lên. bonbon có bốn bề mặt, mỗi cái một vai trò; không dùng kính mờ hay chuyển màu trừ đầu trang dính.',
    'Materials are the surfaces content sits on. bonbon has four surfaces, each with one role; no frosted glass or gradients except the sticky header.',
  ),
  sections: [
    {
      id: 'surfaces',
      title: tx('Bốn bề mặt', 'Four surfaces'),
      body: (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              { cls: 'bg-white ring-1 ring-grey-200', name: 'background', use: tx('Trang, thẻ, hộp thoại', 'Page, cards, dialogs') },
              { cls: 'bg-beige-50', name: 'beige-50', use: tx('Số liệu, biểu đồ, chân trang', 'Stats, charts, footer') },
              { cls: 'bg-grey-100', name: 'muted', use: tx('Ô nhập, nút phụ, rê chuột', 'Fields, secondary buttons, hover') },
              { cls: 'bg-ink text-white', name: 'button', use: tx('Nút chính', 'Primary button') },
            ].map((s) => (
              <div key={s.name} className="flex flex-col gap-2">
                <div className={`flex h-24 items-end rounded-xl p-3 font-mono text-small ${s.cls}`}>{s.name}</div>
                <p className="text-ui text-muted-foreground">{s.use}</p>
              </div>
            ))}
          </div>
          <Principle>{tx('Nền be nghĩa là "đây là số liệu để đọc", không phải "đây là vùng để nhập".', 'Beige means "figures to read", never "a place to type".')}</Principle>
        </>
      ),
    },
    {
      id: 'translucency',
      title: tx('Trong suốt chỉ ở đầu trang dính', 'Translucency only on the sticky header'),
      body: (
        <P>
          {tx(
            'Đầu trang công khai trắng 90 % và làm mờ nội dung cuộn bên dưới để giữ người xem biết mình đang ở đâu. Không bề mặt nào khác trong suốt.',
            'The public header is 90% white and blurs the content scrolling beneath, so people keep their place. No other surface is translucent.',
          )}
        </P>
      ),
    },
    {
      id: 'images',
      title: tx('Ảnh là một bề mặt', 'Images are a surface'),
      body: (
        <P>
          {tx(
            'Ảnh món và ảnh quán bo 12 px như thẻ. Khi chưa có ảnh, ô ảnh để trống màu image-slot (#F2F2F2), không đặt ảnh mẫu.',
            'Dish and shop photos are rounded 12 px like cards. When there is no photo, the slot stays empty in image-slot (#F2F2F2), never a placeholder picture.',
          )}
        </P>
      ),
    },
  ],
}

const motion: ResourceDoc = {
  summary: tx(
    'Chuyển động cho biết điều gì vừa thay đổi. bonbon dùng chuyển động ngắn và ít; người xem không phải chờ hiệu ứng xong mới làm tiếp.',
    'Motion shows what just changed. bonbon uses short, few movements; people never wait for an effect to finish before they can continue.',
  ),
  sections: [
    {
      id: 'feedback',
      title: tx('Chuyển động là phản hồi, không phải trang trí', 'Motion is feedback, not decoration'),
      body: (
        <DataTable
          head={[tx('Chuyển động', 'Motion'), tx('Khi nào', 'When'), tx('Thời gian', 'Duration')]}
          rows={[
            [tx('Đổi màu', 'Colour change'), tx('Rê chuột, chọn', 'Hover, selection'), '150 ms (transition-colors)'],
            [tx('Mũi tên dịch 2 px', 'Arrow shifts 2 px'), tx('Rê chuột lên thẻ dẫn sang trang khác', 'Hovering a card that leads elsewhere'), '150 ms'],
            [tx('Ảnh phóng 3 %', 'Image zooms 3%'), tx('Rê chuột lên thẻ bài viết', 'Hovering an article card'), '300 ms'],
            [tx('Sheet trượt lên', 'Sheet slides up'), tx('Mở sheet trên điện thoại', 'Opening a sheet on the phone'), tx('mặc định hệ thống', 'system default')],
          ]}
        />
      ),
    },
    {
      id: 'reduced-motion',
      title: tx('Tôn trọng "giảm chuyển động"', 'Respect "reduce motion"'),
      body: (
        <>
          <P>
            {tx('Khi thiết bị bật giảm chuyển động, hiệu ứng xuất hiện dần và phóng ảnh tắt (', 'When the device asks for reduced motion, reveal and zoom effects are off (')}
            <C>prefers-reduced-motion</C>, <C>motion-reduce:</C>
            {tx('). Nội dung vẫn hiện đầy đủ, chỉ không di chuyển.', '). Content still appears in full, it just does not move.')}
          </P>
          <Principle>{tx('Nếu bỏ chuyển động mà người xem vẫn hiểu, chuyển động đó phải ngắn hơn 300 ms.', 'If people still understand without the motion, it must be shorter than 300 ms.')}</Principle>
        </>
      ),
    },
  ],
}

const shapes: ResourceDoc = {
  summary: tx(
    'Hình dạng cho biết một thứ là gì trước khi đọc chữ: viên thuốc là thứ bấm được, góc 8 px là ô để nhập, góc 12 px là bề mặt chứa nội dung.',
    'Shape tells what something is before reading it: a pill is something to press, 8 px corners are a field to type in, 12 px corners are a surface holding content.',
  ),
  sections: [
    {
      id: 'radius',
      title: tx('Bốn mức bo góc', 'Four corner radii'),
      body: (
        <>
          <Stage>
            {[
              { r: 'rounded-full', name: 'pill', px: '999' },
              { r: 'rounded-[12px]', name: 'lg / card', px: '12' },
              { r: 'rounded-[8px]', name: 'md', px: '8' },
              { r: 'rounded-[4px]', name: 'xs / sm', px: '4' },
            ].map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div className={`h-16 w-24 border-2 border-ink bg-white ${s.r}`} />
                <span className="text-small">
                  {s.name} · {s.px}
                </span>
              </div>
            ))}
          </Stage>
          <DataTable
            head={[tx('Bo góc', 'Radius'), tx('Dùng cho', 'Used for')]}
            rows={[
              ['pill', tx('Nút, chip, tab, nhãn, ô tìm kiếm, lựa chọn nhanh', 'Buttons, chips, tabs, badges, search fields, quick choices')],
              ['12 px', tx('Thẻ, sheet, hộp thoại, ảnh, khối số liệu', 'Cards, sheets, dialogs, photos, stats blocks')],
              ['8 px', tx('Ô nhập, nút chỉ có biểu tượng', 'Fields, icon-only buttons')],
              ['4 px', tx('Dấu rất nhỏ, mã trong dòng chữ', 'Tiny marks, inline code')],
            ]}
          />
        </>
      ),
    },
    {
      id: 'consistency',
      title: tx('Cùng loại thì cùng hình', 'Same kind, same shape'),
      body: (
        <>
          <Rules
            items={[
              { ok: true, caption: tx('Nút viên thuốc, ô nhập góc 8 px', 'Pill button, 8 px field'), demo: <div className="flex w-full max-w-xs flex-col gap-2 rounded-xl bg-white p-3"><Input placeholder={t('Tìm')} /><Button>{t('Tìm')}</Button></div> },
              { ok: false, caption: tx('Nút vuông góc giữa các nút tròn', 'A square button among pills'), demo: <><Button>{t('Lưu')}</Button><Button className="rounded-none">{t('Huỷ')}</Button></> },
            ]}
          />
          <Principle>{tx('Đừng đổi bo góc của một component để nó "nổi bật"; dùng loại khác của nó.', 'Never change a component\'s corners to make it "stand out"; use another of its types.')}</Principle>
        </>
      ),
    },
  ],
}

const typography: ResourceDoc = {
  summary: tx(
    'Chữ mang hầu hết thông tin của bonbon. Một font, Inter, với một thang cỡ chữ cố định, để mọi trang có cùng nhịp đọc.',
    'Type carries most of bonbon\'s information. One font, Inter, with a fixed type scale, so every page has the same reading rhythm.',
  ),
  sections: [
    {
      id: 'typeface',
      title: tx('Một font: Inter', 'One typeface: Inter'),
      body: (
        <>
          <P>
            {tx(
              'Inter có đủ dấu tiếng Việt và đọc rõ ở cỡ nhỏ. Font miễn phí trên Google Fonts. Tiêu đề đậm vừa (600), chữ thường 400, nhãn và nút 500. Đậm 800 chỉ cho chữ bonbon và tiêu đề rất lớn.',
              'Inter has every Vietnamese diacritic and stays clear at small sizes. It is free on Google Fonts. Headings are semibold (600), body 400, labels and buttons 500. Extra bold 800 is only for the bonbon wordmark and very large headlines.',
            )}
          </P>
          <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noreferrer" className="text-link w-fit">
            {t('Tải font trên Google Fonts')}
          </a>
        </>
      ),
    },
    {
      id: 'scale',
      title: tx('Thang cỡ chữ', 'Type scale'),
      body: (
        <>
          <div className="flex flex-col divide-y divide-grey-200 rounded-xl border border-grey-200">
            {[
              { cls: 'text-display', name: 'display', spec: '48 / 56 · 600' },
              { cls: 'text-h1', name: 'h1', spec: '36 / 44 · 600' },
              { cls: 'text-h2', name: 'h2', spec: '24 / 32 · 600' },
              { cls: 'text-h3', name: 'h3', spec: '18 / 28 · 600' },
              { cls: 'text-lead', name: 'lead', spec: '18 / 28 · 400' },
              { cls: 'text-body', name: 'body', spec: '16 / 26 · 400' },
              { cls: 'text-ui', name: 'ui', spec: '14 / 20 · 400–500' },
              { cls: 'text-small', name: 'small', spec: '13 / 20 · 400' },
              { cls: 'text-caption', name: 'caption', spec: '12 / 16 · 400' },
            ].map((s) => (
              <div key={s.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3">
                <span className={`${s.cls} min-w-0`}>{t('Đặt món ngay trong khu')}</span>
                <span className="shrink-0 font-mono text-small text-muted-foreground">
                  text-{s.name} · {s.spec}
                </span>
              </div>
            ))}
          </div>
          <P>
            {tx('Ứng dụng điện thoại dùng thang riêng gọn hơn trong ', 'The phone app uses a tighter scale in ')}
            <C>typography</C>
            {tx(': caption 12, bodySm 14, body 16, titleSm 18, title 20, headline 24, display 30.', ': caption 12, bodySm 14, body 16, titleSm 18, title 20, headline 24, display 30.')}
          </P>
        </>
      ),
    },
    {
      id: 'hierarchy',
      title: tx('Tạo tầng bằng cỡ và màu, không bằng chữ in hoa', 'Build hierarchy with size and colour, not capitals'),
      body: (
        <>
          <List
            items={[
              tx('Mỗi trang một h1. Tiêu đề phần là h2, nhóm nhỏ trong phần là h3.', 'One h1 per page. Section titles are h2, small groups within a section h3.'),
              tx('Chữ nội dung màu mực; mô tả và nhãn màu xám 600.', 'Content text in ink; descriptions and labels in grey 600.'),
              tx('Chữ in hoa chỉ cho tên nhóm nhỏ trong menu (caption, giãn chữ).', 'Capitals only for small group names in menus (caption, tracked out).'),
              tx('Số trong bảng và ô số liệu dùng chữ số cùng độ rộng (tabular-nums).', 'Numbers in tables and stat tiles use tabular figures (tabular-nums).'),
            ]}
          />
          <H3>{tx('Chữ phóng to', 'Enlarged text')}</H3>
          <P>
            {tx(
              'Trên điện thoại người dùng chọn cỡ chữ 125 % hoặc 150 %; trên web họ phóng to bằng trình duyệt. Mọi cỡ trong thang tính bằng rem nên phóng cùng nhau; đừng cố định chiều cao khối chứa chữ.',
              'On phones people pick 125% or 150% text; on the web they zoom with the browser. Every size in the scale is in rem so they grow together; never fix the height of a box holding text.',
            )}
          </P>
        </>
      ),
    },
  ],
  takeaway: tx('Inter, chín cỡ cố định, tầng bằng cỡ và màu, và mọi khối chịu được chữ phóng 150 %.', 'Inter, nine fixed sizes, hierarchy through size and colour, and every block survives 150% text.'),
}

export const DESIGN_LANGUAGE: Record<string, ResourceDoc> = {
  'design-principles': principles,
  logo,
  color,
  elevation,
  iconography,
  layout,
  material,
  motion,
  shapes,
  typography,
}
