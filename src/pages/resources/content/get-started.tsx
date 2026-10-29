import { tx } from '@/shared/i18n'
import { C, Code, DataTable, List, P, Principle } from '../doc'
import type { ResourceDoc } from '../doc'

const whatsNew: ResourceDoc = {
  summary: tx(
    'Những thay đổi của hệ thống thiết kế bonbon, mới nhất ở trên. Mỗi mục nói cái gì đổi, vì sao, và bạn cần làm gì với màn hình đang có.',
    'Changes to the bonbon design system, newest first. Each entry says what changed, why, and what you need to do with existing screens.',
  ),
  sections: [
    {
      id: '2026-10-29',
      title: tx('29/10/2026 · Hai ngôn ngữ, tên component tiếng Anh', '29 Oct 2026 · Two languages, English component names'),
      body: (
        <>
          <List
            items={[
              tx('Mọi trang web có tiếng Việt và tiếng Anh. Ngôn ngữ mặc định theo trình duyệt, đổi bằng nút VI/EN và được nhớ trên thiết bị.', 'Every web page has Vietnamese and English. The language follows the browser, can be switched with VI/EN and is remembered on the device.'),
              tx('Tên component luôn là tiếng Anh và trùng tên trong mã nguồn (Button, PageTabs, StatTile…), để sau này tách thành thư viện UI riêng.', 'Component names are always English and match the source code (Button, PageTabs, StatTile…), so they can become a separate UI library later.'),
              tx('Tài nguyên thiết kế được sắp lại theo năm phần: Bắt đầu, Ngôn ngữ thiết kế, Khung và hướng dẫn UX, Token cho web và Thành phần.', 'The brand site is reorganised into five parts: Get started, Design language, UX frameworks and guidelines, Web tokens and Components.'),
            ]}
          />
          <Principle>{tx('Viết chữ mới cho giao diện thì viết cả hai ngôn ngữ cùng lúc.', 'When you write new interface text, write both languages at once.')}</Principle>
        </>
      ),
    },
    {
      id: '2026-10-28',
      title: tx('28/10/2026 · Logo con gấu', '28 Oct 2026 · The bear logo'),
      body: (
        <P>
          {tx(
            'Logo dùng hình con gấu "Saving Bear Market" của Streamline Freehand (CC BY 4.0) cạnh chữ bonbon. Biểu tượng ứng dụng là gấu trắng trên nền cam. Mọi nơi đặt logo cần ghi nguồn theo giấy phép.',
            'The logo uses the "Saving Bear Market" bear from Streamline Freehand (CC BY 4.0) beside the bonbon wordmark. The app icon is a white bear on orange. Every place showing the logo must credit the source under the licence.',
          )}
        </P>
      ),
    },
    {
      id: '2026-10-27',
      title: tx('27/10/2026 · Tokens v4: cam, tĩnh', '27 Oct 2026 · Tokens v4: orange, quiet'),
      body: (
        <>
          <List
            items={[
              tx('Màu thương hiệu đổi sang cam #FE551B. Nút chính màu mực, cam dành cho liên kết, mục đang chọn và điểm nhấn.', 'The brand colour becomes orange #FE551B. Primary buttons are ink; orange is for links, selected items and accents.'),
              tx('Chữ nội dung đen, chữ điều hướng và mô tả xám. Viền chỉ dùng khi thật cần.', 'Content text is black, navigation and descriptions grey. Borders only when truly needed.'),
              tx('Nền be #FAFAF9 cho khối số liệu, biểu đồ và chân trang. Ba màu chuỗi biểu đồ cố định: cam, xanh dương, xanh ngọc.', 'Beige #FAFAF9 behind stats, charts and footers. Three fixed chart series colours: orange, blue, aqua.'),
            ]}
          />
          <P>
            {tx('Màn hình cũ dùng tên ', 'Older screens using the ')}
            <C>brand-*</C>
            {tx(' vẫn chạy vì các tên này giờ trỏ về cam; màn hình mới dùng ', ' names still work because they now point to orange; new screens use ')}
            <C>primary</C>, <C>button</C>, <C>muted-foreground</C>.
          </P>
        </>
      ),
    },
    {
      id: '2026-10-20',
      title: tx('20/10/2026 · Một hình dạng cho cả sản phẩm', '20 Oct 2026 · One shape for the whole product'),
      body: (
        <P>
          {tx(
            'Nút, chip, tab, nhãn và ô tìm kiếm là hình viên thuốc. Ô nhập bo 8 px, bề mặt (thẻ, sheet, ảnh) bo 12 px. Web và ứng dụng điện thoại dùng cùng các giá trị.',
            'Buttons, chips, tabs, badges and search fields are pills. Fields are rounded 8 px, surfaces (cards, sheets, photos) 12 px. The web and the phone app use the same values.',
          )}
        </P>
      ),
    },
  ],
}

const design: ResourceDoc = {
  summary: tx(
    'Bắt đầu thiết kế một màn hình bonbon: đọc ngôn ngữ thiết kế, dựng bằng component có sẵn, rồi kiểm tra trước khi giao cho người làm.',
    'Start designing a bonbon screen: read the design language, build with existing components, then check before handing off.',
  ),
  sections: [
    {
      id: 'learn-the-language',
      title: tx('Hiểu ngôn ngữ thiết kế trước', 'Learn the design language first'),
      body: (
        <>
          <P>
            {tx(
              'bonbon trông giống nhau trên web và trên điện thoại vì mọi màn hình dùng chung một bộ màu, chữ, khoảng cách và hình dạng. Đọc theo thứ tự này:',
              'bonbon looks the same on the web and on phones because every screen shares one set of colours, type, spacing and shapes. Read in this order:',
            )}
          </P>
          <List
            ordered
            items={[
              tx('Nguyên tắc thiết kế: năm điều mọi màn hình phải giữ.', 'Design principles: the five things every screen keeps.'),
              tx('Màu sắc và Kiểu chữ: màu nào cho việc gì, cỡ chữ nào cho tầng nào.', 'Color and Typography: which colour for which job, which size for which level.'),
              tx('Bố cục và Hình dạng: khoảng cách, lưới, bo góc.', 'Layout and Shapes: spacing, grid, corners.'),
              tx('Thiết kế nội dung: cách viết chữ trên giao diện, bằng cả hai ngôn ngữ.', 'Content design: how to write interface text, in both languages.'),
            ]}
          />
        </>
      ),
    },
    {
      id: 'build-with-components',
      title: tx('Dựng bằng component, không vẽ lại', 'Build with components, do not redraw them'),
      body: (
        <>
          <P>
            {tx(
              'Mỗi component có trang riêng: nó là gì, khi nào dùng, các loại, hành vi, bố cục, trợ năng và cách viết chữ. Tên component trong bản thiết kế phải trùng tên trong mã (Button, không phải "Nút cam").',
              'Each component has its own page: what it is, when to use it, its types, behaviour, layout, accessibility and how to write for it. Component names in a design must match the code (Button, not "Orange button").',
            )}
          </P>
          <P>
            {tx(
              'Khi không component nào hợp, hãy ghép từ những cái có sẵn trước. Chỉ đề xuất component mới khi nó được dùng lại ở ít nhất hai nơi.',
              'When no component fits, combine existing ones first. Only propose a new component when it will be reused in at least two places.',
            )}
          </P>
          <Principle>{tx('Một thứ trông khác thì phải làm một việc khác.', 'Something that looks different must do something different.')}</Principle>
        </>
      ),
    },
    {
      id: 'check-before-handoff',
      title: tx('Kiểm tra trước khi giao', 'Check before you hand off'),
      body: (
        <DataTable
          head={[tx('Kiểm tra', 'Check'), tx('Đạt khi', 'Pass if')]}
          rows={[
            [tx('Màu', 'Colour'), tx('Chỉ dùng token, không mã màu tự đặt.', 'Only tokens, no made-up colour codes.')],
            [tx('Trạng thái', 'States'), tx('Có rê chuột, chọn bằng bàn phím, không dùng được, đang tải, trống, lỗi.', 'Hover, keyboard focus, disabled, loading, empty and error are all drawn.')],
            [tx('Ngôn ngữ', 'Language'), tx('Chữ có cả tiếng Việt và tiếng Anh; bố cục chịu được câu tiếng Anh dài hơn.', 'Text exists in Vietnamese and English; the layout survives longer English sentences.')],
            [tx('Cỡ chữ', 'Text size'), tx('Không vỡ ở cỡ chữ 125 % và 150 % trên điện thoại, và khi trình duyệt phóng to 200 %.', 'Nothing breaks at 125% and 150% text on phones, nor at 200% browser zoom.')],
            [tx('Giao diện tối', 'Dark theme'), tx('Ứng dụng điện thoại có giao diện tối; màu đọc qua token nên tự đổi.', 'The phone app has a dark theme; colours read through tokens switch on their own.')],
          ]}
        />
      ),
    },
  ],
  takeaway: tx(
    'Thiết kế bonbon là chọn đúng thứ đã có: token cho màu và khoảng cách, component cho mọi khối, và chữ viết bằng hai ngôn ngữ.',
    'Designing for bonbon means choosing the right existing pieces: tokens for colour and spacing, components for every block, and text in two languages.',
  ),
}

const develop: ResourceDoc = {
  summary: tx(
    'Dùng hệ thống thiết kế trong mã: web (React, Tailwind) và ứng dụng điện thoại (React Native) đọc cùng giá trị token và dùng component cùng tên.',
    'Use the design system in code: the web (React, Tailwind) and the phone app (React Native) read the same token values and use components with the same names.',
  ),
  sections: [
    {
      id: 'web',
      title: tx('Web: import từ shared/ui', 'Web: import from shared/ui'),
      body: (
        <>
          <P>
            {tx('Component nằm ở ', 'Components live in ')}
            <C>web/src/shared/ui</C>
            {tx(', mỗi component một tệp. Màu và bo góc đến từ ', ', one file each. Colours and corners come from ')}
            <C>tokens.css</C>
            {tx(' qua lớp Tailwind, không viết mã màu trực tiếp.', ' through Tailwind classes, never raw colour codes.')}
          </P>
          <Code>{`import { Button } from '@/shared/ui/button'
import { t } from '@/shared/i18n'

<Button variant="secondary" className="text-muted-foreground">{t('Lưu nháp')}</Button>`}</Code>
          <List
            items={[
              tx('Chữ trên giao diện luôn qua t(); câu tiếng Anh nằm ở src/shared/i18n/en.ts.', 'Interface text always goes through t(); the English is in src/shared/i18n/en.ts.'),
              tx('Theo Feature-Sliced Design: shared/ui không import từ entities, features hay pages.', 'Follow Feature-Sliced Design: shared/ui never imports from entities, features or pages.'),
              tx('Chạy npm run lint và npm run build trước khi mở PR.', 'Run npm run lint and npm run build before opening a PR.'),
            ]}
          />
        </>
      ),
    },
    {
      id: 'mobile',
      title: tx('Android và iOS: một mã React Native', 'Android and iOS: one React Native codebase'),
      body: (
        <>
          <P>
            {tx('Ứng dụng điện thoại dùng chung một bộ component cho Android và iOS, export từ ', 'The phone app shares one set of components for Android and iOS, exported from ')}
            <C>mobile/src/shared/ui</C>
            {tx('. Màn hình đọc màu qua ', '. Screens read colours through ')}
            <C>useTheme()</C>
            {tx(' để giao diện tối tự đổi.', ' so the dark theme switches on its own.')}
          </P>
          <Code>{`import { Button, Text, useTheme } from '@/shared/ui'

const theme = useTheme()
<Text variant="title" color={theme.text}>…</Text>
<Button title="…" variant="outline" />`}</Code>
        </>
      ),
    },
    {
      id: 'same-names',
      title: tx('Giữ tên giống nhau giữa các nền tảng', 'Keep names the same across platforms'),
      body: (
        <>
          <DataTable
            head={['Component', 'Web', 'Android / iOS']}
            rows={[
              ['Button', <C>@/shared/ui/button</C>, <C>@/shared/ui</C>],
              ['Input', <C>@/shared/ui/input</C>, <C>@/shared/ui</C>],
              ['Card', <C>@/shared/ui/card</C>, <C>@/shared/ui</C>],
              ['Sheet', <C>@/shared/ui/sheet</C>, <C>@/shared/ui</C>],
              ['EmptyState', <C>@/shared/ui/empty-state</C>, <C>@/shared/ui</C>],
            ]}
          />
          <Principle>
            {tx(
              'Một component có mặt trên nhiều nền tảng thì mang cùng một tên, dù cách dựng bên trong khác nhau.',
              'A component that exists on several platforms carries one name, however differently it is built inside.',
            )}
          </Principle>
        </>
      ),
    },
  ],
  takeaway: tx(
    'Import component theo đúng tên, đọc màu qua token, và đưa mọi chữ qua t(): ba việc đó giữ web và điện thoại nhìn như một.',
    'Import components by their names, read colours through tokens, and send all text through t(): those three keep the web and the phone looking like one product.',
  ),
}

export const GET_STARTED: Record<string, ResourceDoc> = { 'whats-new': whatsNew, design, develop }

