import { ChevronRightIcon, BellIcon, PlusIcon, SearchIcon, ShoppingBagIcon, TrashIcon } from 'lucide-react'
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
              'Mỗi vùng có nhiều nhất một nút chính màu cam đậm. Các việc khác là nút viền, nút phụ hoặc nút chữ. Người xem không phải đoán bấm vào đâu.',
              'Each region has at most one orange primary button. Other actions are outline, secondary or text buttons. People never have to guess what to press.',
            )}
          </P>
          <Rules
            items={[
              { ok: true, caption: tx('Một nút chính, một nút phụ', 'One primary, one secondary'), demo: <><Button>{t('Nhận đơn')}</Button><Button variant="outline">{t('Từ chối đơn')}</Button></> },
              { ok: false, caption: tx('Hai nút chính tranh nhau', 'Two primary buttons competing'), demo: <><Button>{t('Nhận đơn')}</Button><Button>{t('Từ chối đơn')}</Button></> },
            ]}
          />
        </>
      ),
    },
    {
      id: 'selection-is-colour',
      title: tx('Thứ đang chọn luôn nhìn ra ngay', 'The selected thing is obvious at a glance'),
      body: (
        <P>
          {tx(
            'Mục đang chọn (chip, mục menu) có nền cam nhạt và chữ cam đậm; tab đang chọn có gạch dưới màu cam. Rê chuột lên mục khác cho nền nhạt. Viền chỉ xuất hiện quanh ô nhập, thẻ cần tách khỏi trang, và bảng.',
            'The selected item (chip, menu item) gets a pale orange fill and dark orange text; the selected tab an orange underline. Hovering other items gives a subtle fill. Borders only around inputs, cards that must stand apart, and tables.',
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
    'Màu giúp người xem biết đâu là nội dung, đâu là việc chính, đâu là thứ đang chọn và đâu là việc cần để ý. Màu theo ba lớp: thang màu gốc, vai trò (accent, textSecondary, warningSubtle…), rồi component. Màn hình chỉ dùng vai trò.',
    'Colour tells people what is content, what the main action is, what is selected and what needs attention. It comes in three layers: palettes, roles (accent, textSecondary, warningSubtle…), then components. Screens only use roles.',
  ),
  sections: [
    {
      id: 'brand-and-neutrals',
      title: tx('Cam Bếp và xám ấm', 'Kitchen orange and warm stone'),
      body: (
        <>
          <P>
            {tx(
              'Màu thương hiệu là cam, nối tiếp logo và chú gấu. Nút chính, mục đang chọn và viền focus dùng Orange 600 #CF430D: chữ trắng trên nền này đạt 4,71:1. Liên kết trong đoạn văn dùng Orange 700 #B33A0C, đọc rõ ở cỡ 14 px. Orange 500 chỉ cho logo và mảng lớn, không bao giờ cho chữ. Màu trung tính là xám ấm (stone), hơi ngả về cam để cả trang cùng một tông.',
              'The brand colour is orange, continuing the logo and the mascot. Primary buttons, selected items and focus rings use Orange 600 #CF430D: white text on it reaches 4.71:1. Links in running text use Orange 700 #B33A0C, readable at 14 px. Orange 500 is for the logo and large shapes only, never text. Neutrals are warm stone, tinted towards the orange so the whole page shares one tone.',
            )}
          </P>
          <SwatchGrid colors={BRAND_COLORS} />
          <Principle>{tx('Mỗi màn hình một nút cam. Màu cam trên mảng lớn làm mất thứ bậc.', 'One orange button per screen. Orange on large surfaces flattens the hierarchy.')}</Principle>
        </>
      ),
    },
    {
      id: 'states',
      title: tx('Màu trạng thái chỉ để báo trạng thái', 'State colours only report state'),
      body: (
        <>
          <P>
            {tx(
              'Mỗi trạng thái có ba sắc: màu chính (biểu tượng), nền nhạt (Subtle) và chữ trên nền nhạt (onSubtle). Cảnh báo dùng vàng hổ phách, không dùng cam, để không lẫn với thương hiệu. Trạng thái luôn có chữ hoặc biểu tượng đi kèm, không chỉ dựa vào màu.',
              'Each state has three shades: the main colour (icons), a pale fill (Subtle) and text on that fill (onSubtle). Warnings use amber, not orange, so they never read as the brand. A state always comes with words or an icon, never colour alone.',
            )}
          </P>
          <SwatchGrid colors={STATE_COLORS} />
          <Principle>{tx('Màu trạng thái không dùng để trang trí.', 'State colours are never decoration.')}</Principle>
        </>
      ),
    },
    {
      id: 'charts',
      title: tx('Biểu đồ dùng màu theo thứ tự cố định', 'Charts use colours in a fixed order'),
      body: (
        <>
          <P>
            {tx(
              'Chuỗi thứ nhất luôn là số liệu của chính quán, màu cam. Chữ và nhãn trên biểu đồ dùng màu chữ, không dùng màu chuỗi.',
              "The first series is always the shop's own figure, in orange. Text and labels on charts use text colours, never series colours.",
            )}
          </P>
          <SwatchGrid colors={CHART_COLORS} />
        </>
      ),
    },
    {
      id: 'tokens',
      title: tx('Một nguồn, hai giao diện, tự kiểm tra', 'One source, two themes, self-checking'),
      body: (
        <P>
          {tx('Giá trị nằm trong repo bonbon-design; lệnh npm run sync sinh ra token cho web (', 'Values live in the bonbon-design repo; npm run sync generates the web tokens (')}
          <C>--bb-accent</C>
          {tx(') và cho điện thoại (', ') and the phone tokens (')}
          <C>theme.accent</C>
          {tx('). Mỗi vai trò có giá trị sáng và tối, và bộ kiểm thử đo độ tương phản WCAG của từng cặp chữ và nền ở cả hai giao diện.', '). Every role has a light and a dark value, and the tests measure the WCAG contrast of every text and background pair in both themes.')}
        </P>
      ),
    },
  ],
  takeaway: tx(
    'Cam đậm cho việc chính và thứ đang chọn, xám ấm cho nội dung và khung, màu trạng thái chỉ cho trạng thái, và mọi cặp màu đều đạt chuẩn tương phản.',
    'Dark orange for the main action and selection, warm stone for content and frame, state colours only for states, and every pair passes contrast.',
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
            {[SearchIcon, ShoppingBagIcon, BellIcon, PlusIcon, TrashIcon, ChevronRightIcon].map((Icon, i) => (
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
    'Hình dạng cho biết một thứ là gì trước khi đọc chữ: góc 10 px là thứ để bấm hoặc nhập, góc 12 px là bề mặt chứa nội dung, hình tròn chỉ cho ảnh đại diện, công tắc và chấm trạng thái.',
    'Shape tells what something is before reading it: 10 px corners are something to press or type into, 12 px corners a surface holding content, circles only avatars, switches and status dots.',
  ),
  sections: [
    {
      id: 'radius',
      title: tx('Năm mức bo góc', 'Five corner radii'),
      body: (
        <>
          <Stage>
            {[
              { r: 'rounded-[20px]', name: 'sheet', px: '20' },
              { r: 'rounded-[12px]', name: 'card', px: '12' },
              { r: 'rounded-[10px]', name: 'control', px: '10' },
              { r: 'rounded-[4px]', name: 'xs', px: '4' },
            ].map((s) => (
              <div key={s.name} className="flex flex-col items-center gap-2">
                <div className={`h-16 w-24 border-2 border-ink bg-surface ${s.r}`} />
                <span className="text-body-sm">
                  {s.name} · {s.px}
                </span>
              </div>
            ))}
          </Stage>
          <DataTable
            head={[tx('Bo góc', 'Radius'), tx('Dùng cho', 'Used for')]}
            rows={[
              ['control · 10 px', tx('Nút, ô nhập, chọn, chip, tab, nút biểu tượng', 'Buttons, inputs, selects, chips, tabs, icon buttons')],
              ['card · 12 px', tx('Thẻ, ảnh, hộp thoại, menu, banner', 'Cards, images, dialogs, menus, banners')],
              ['sheet · 20 px', tx('Mép trên của bottom sheet', 'Top corners of a bottom sheet')],
              ['xs · 4 px', tx('Nhãn trạng thái, dấu rất nhỏ', 'Status badges, tiny marks')],
              ['full', tx('Chỉ ảnh đại diện, công tắc, chấm trạng thái', 'Only avatars, switches, status dots')],
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
              { ok: true, caption: tx('Nút và ô nhập cùng bo 10 px', 'Button and field share 10 px'), demo: <div className="flex w-full max-w-xs flex-col gap-2 rounded-card bg-surface p-3"><Input placeholder={t('Tìm')} /><Button>{t('Tìm')}</Button></div> },
              { ok: false, caption: tx('Nút tròn hai đầu giữa các nút bo 10 px', 'A pill among 10 px buttons'), demo: <><Button>{t('Lưu')}</Button><Button variant="outline" className="rounded-full">{t('Huỷ')}</Button></> },
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
    'Chữ mang hầu hết thông tin của bonbon. Một họ chữ, Be Vietnam Pro, với tám kiểu có tên dùng chung cho web và điện thoại, để mọi trang có cùng nhịp đọc.',
    "Type carries most of bonbon's information. One family, Be Vietnam Pro, with eight named styles shared by web and phone, so every page has the same reading rhythm.",
  ),
  sections: [
    {
      id: 'typeface',
      title: tx('Một họ chữ: Be Vietnam Pro', 'One family: Be Vietnam Pro'),
      body: (
        <>
          <P>
            {tx(
              'Be Vietnam Pro được vẽ riêng cho dấu tiếng Việt: dấu không chạm nhau ở cỡ nhỏ và không bị cắt ở dòng trên cùng. Chỉ dùng năm độ đậm: 400 cho nội dung, 500 cho chú thích, 600 cho nhãn và tiêu đề nhỏ, 700 cho tiêu đề trang, 800 chỉ cho chữ bonbon.',
              'Be Vietnam Pro is drawn for Vietnamese diacritics: marks never collide at small sizes and are not clipped on the top line. Only five weights: 400 body, 500 captions, 600 labels and small titles, 700 page titles, 800 the bonbon wordmark only.',
            )}
          </P>
          <a href="https://fonts.google.com/specimen/Be+Vietnam+Pro" target="_blank" rel="noreferrer" className="text-link w-fit">
            {t('Tải font trên Google Fonts')}
          </a>
        </>
      ),
    },
    {
      id: 'scale',
      title: tx('Tám kiểu chữ', 'Eight styles'),
      body: (
        <>
          <div className="flex flex-col divide-y divide-border rounded-card border">
            {[
              { cls: 'text-display', name: 'display', spec: '40 / 48 · 700', use: tx('Tiêu đề landing, một lần mỗi trang', 'Landing hero, once per page') },
              { cls: 'text-title-1', name: 'title-1', spec: '28 / 36 · 700', use: tx('Tiêu đề trang', 'Page title') },
              { cls: 'text-title-2', name: 'title-2', spec: '22 / 28 · 600', use: tx('Tiêu đề phần', 'Section title') },
              { cls: 'text-title-3', name: 'title-3', spec: '18 / 24 · 600', use: tx('Tiêu đề thẻ, hộp thoại', 'Card and dialog title') },
              { cls: 'text-body', name: 'body', spec: '16 / 24 · 400', use: tx('Nội dung, ô nhập', 'Running text, inputs') },
              { cls: 'text-body-sm', name: 'body-sm', spec: '14 / 20 · 400', use: tx('Mô tả, bảng, danh sách dày', 'Descriptions, tables, dense lists') },
              { cls: 'text-label', name: 'label', spec: '14 / 20 · 600', use: tx('Nút, tab, nhãn ô nhập, chip', 'Buttons, tabs, field labels, chips') },
              { cls: 'text-caption', name: 'caption', spec: '12 / 16 · 500', use: tx('Thời gian, nhãn trạng thái, gợi ý', 'Timestamps, badges, help text') },
            ].map((s) => (
              <div key={s.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3">
                <span className={`${s.cls} min-w-0`}>{t('Đặt món ngay trong khu')}</span>
                <span className="shrink-0 font-mono text-caption text-text-tertiary">
                  text-{s.name} · {s.spec} · {s.use}
                </span>
              </div>
            ))}
          </div>
          <P>
            {tx('Điện thoại dùng đúng tám kiểu này qua ', 'The phone app uses the same eight styles through ')}
            <C>{'<Text variant="title1">'}</C>
            {tx('; cỡ display chỉ dùng trên web.', '; display is web only.')}
          </P>
        </>
      ),
    },
    {
      id: 'emphasis',
      title: tx('Quy tắc nhấn mạnh', 'Emphasis rules'),
      body: (
        <>
          <DataTable
            head={[tx('Cách', 'How'), tx('Dùng khi', 'Use for'), tx('Không dùng khi', 'Never for')]}
            rows={[
              [tx('Đậm 600', 'Bold 600'), tx('Một con số hay tên người đọc cần thấy trước: tổng tiền, giờ giao', 'The one value read first: total, delivery time'), tx('Cả câu, cả đoạn', 'Whole sentences or paragraphs')],
              [tx('Nghiêng', 'Italic'), tx('Trích lời khách trong đánh giá', 'Quoting a customer review'), tx('Chữ giao diện: dấu tiếng Việt khó đọc khi nghiêng', 'Interface text: diacritics lose legibility')],
              [tx('Gạch chân', 'Underline'), tx('Liên kết trong đoạn văn', 'Links in running text'), tx('Nhấn mạnh: người đọc tưởng là liên kết', 'Emphasis: it reads as a link')],
              [tx('Màu chữ', 'Text colour'), tx('Ba mức: chính, phụ, chú thích; màu liên kết', 'Three levels: primary, secondary, tertiary; link colour'), tx('Tô màu để nhấn mạnh; chữ đỏ không phải lỗi', 'Tinting for emphasis; red text that is not an error')],
              [tx('Chữ hoa', 'Capitals'), tx('Không dùng; viết hoa chữ đầu câu', 'Never; sentence case'), tx('Nhãn nút, tiêu đề mục', 'Button labels, section titles')],
            ]}
          />
          <H3>{tx('Chữ phóng to', 'Enlarged text')}</H3>
          <P>
            {tx(
              'Mọi cỡ tính bằng rem nên phóng cùng nhau khi người dùng phóng to trình duyệt; trên điện thoại người dùng chọn 100, 120 hoặc 140 %. Đừng cố định chiều cao khối chứa chữ.',
              'Every size is in rem so they grow together when people zoom; on phones people pick 100, 120 or 140%. Never fix the height of a box holding text.',
            )}
          </P>
        </>
      ),
    },
  ],
  takeaway: tx('Be Vietnam Pro, tám kiểu có tên, ba mức màu chữ, in đậm có chừng mực, và mọi khối chịu được chữ phóng to.', 'Be Vietnam Pro, eight named styles, three text levels, sparing bold, and every block survives enlarged text.'),
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
