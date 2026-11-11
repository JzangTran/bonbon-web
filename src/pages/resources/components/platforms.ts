import { tx } from '@/shared/i18n'

/**
 * Where each component lives on each platform. Android and iOS share one React Native component in bonbon-mobile, so they share the
 * source and the example; only the platform notes differ. A component missing on the phone says what the app uses instead.
 */
export type PlatformInfo = {
  web: string
  mobile?: { source: string; code: string; notes: string[]; android: string; ios: string }
  /** when there is no phone version: what the app does instead */
  mobileInstead?: string
}

const press = {
  android: tx(
    'Android: TalkBack đọc tên và vai trò "nút"; nút Back của hệ thống không bấm nút này. Nền đổi khi nhấn, không có hiệu ứng gợn sóng.',
    'Android: TalkBack reads the name and the "button" role; the system Back button never presses it. The background changes on press, there is no ripple.',
  ),
  ios: tx(
    'iOS: VoiceOver đọc tên, vai trò và trạng thái "bận" khi đang tải. Vùng chạm 48 lớn hơn mức 44 pt tối thiểu của iOS.',
    'iOS: VoiceOver reads the name, the role and the "busy" state while loading. The 48 touch target is above the iOS 44 pt minimum.',
  ),
}

export const PLATFORMS: Record<string, PlatformInfo> = {
  button: {
    web: "import { Button } from '@/shared/ui/button'",
    mobile: {
      source: "import { Button } from '@/shared/ui'",
      code: `<Button title="Nhận đơn" onPress={confirm} />
<Button title="Lưu nháp" variant="outline" />
<Button title="Chuyển sang Đang giao" size="lg" loading={saving} fullWidth />`,
      notes: [
        tx('Chữ nằm trong prop title, không phải children.', 'The text goes in the title prop, not children.'),
        tx('Loại: primary, outline (bằng secondary trên web), ghost, destructive.', 'Types: primary, outline (the web secondary), ghost, destructive.'),
        tx('Cỡ md cao 48, lg cao 56 cho nút chuyển trạng thái đơn của người bán.', 'Size md is 48 tall, lg is 56 for the seller\'s order status button.'),
        tx('loading thay chữ bằng vòng quay và khoá nút.', 'loading replaces the text with a spinner and locks the button.'),
      ],
      ...press,
    },
  },
  'text-link': {
    web: '<a href="…" className="text-link">…</a>',
    mobileInstead: tx(
      'Chưa có trên Android/iOS. Ứng dụng dùng Button variant="ghost" cho việc dẫn sang màn hình khác.',
      'Not on Android/iOS yet. The app uses Button variant="ghost" to lead to another screen.',
    ),
  },
  input: {
    web: "import { Input } from '@/shared/ui/input'\nimport { Label } from '@/shared/ui/label'",
    mobile: {
      source: "import { Input } from '@/shared/ui'",
      code: `<Input label="Số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} error={errors.phone} />`,
      notes: [
        tx('Nhãn và câu lỗi là prop của Input (label, error), không cần Label riêng.', 'The label and the error are Input props (label, error), no separate Label.'),
        tx('Có giới hạn độ dài mặc định theo loại bàn phím nếu không đặt maxLength.', 'Has a default length limit by keyboard type when maxLength is not set.'),
        tx('Chọn keyboardType đúng (phone-pad, email-address, number-pad) để bàn phím hợp nội dung.', 'Pick the right keyboardType (phone-pad, email-address, number-pad) so the keyboard fits the content.'),
      ],
      android: tx('Android: đặt biểu mẫu trong vùng cuộn để bàn phím không che ô cuối.', 'Android: put forms in a scroll area so the keyboard never covers the last field.'),
      ios: tx('iOS: dùng textContentType (telephoneNumber, emailAddress) để iOS gợi ý tự điền.', 'iOS: set textContentType (telephoneNumber, emailAddress) so iOS can offer autofill.'),
    },
  },
  segmented: {
    web: "import { Segmented } from '@/shared/ui/section'",
    mobileInstead: tx('Chưa có trên Android/iOS.', 'Not on Android/iOS yet.'),
  },
  'page-tabs': {
    web: "import { PageTabs } from '@/shared/ui/workspace-slots'",
    mobileInstead: tx(
      'Chưa có trên Android/iOS. Các phần lớn của ứng dụng nằm trên FloatingTabBar ở đáy màn hình, đó là điều hướng chính chứ không phải tab trong trang.',
      'Not on Android/iOS yet. The app\'s main sections sit on the FloatingTabBar at the bottom, which is the main navigation rather than tabs within a page.',
    ),
  },
  pagination: {
    web: "import { Pagination } from '@/shared/ui/pagination'\nimport { usePaging } from '@/shared/lib/use-paging'",
    mobileInstead: tx('Chưa có trên Android/iOS.', 'Not on Android/iOS yet.'),
  },
  badge: {
    web: "import { Badge } from '@/shared/ui/badge'",
    mobileInstead: tx(
      'Chưa có Badge chung trên Android/iOS. Trạng thái đơn dùng OrderStatusBadge từ entities/order, cùng tên và cùng màu với web.',
      'No shared Badge on Android/iOS yet. Order statuses use OrderStatusBadge from entities/order, with the same names and colours as the web.',
    ),
  },
  table: {
    web: "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'",
    mobileInstead: tx('Không dùng trên điện thoại: màn hình hẹp hiện danh sách Card thay cho bảng.', 'Not used on phones: narrow screens show a list of Cards instead of a table.'),
  },
  'stat-tile': {
    web: "import { StatRow, StatsPanel, StatTile } from '@/shared/ui/section'",
    mobileInstead: tx('Chưa có trên Android/iOS.', 'Not on Android/iOS yet.'),
  },
  'chart-panel': {
    web: "import { ChartPanel } from '@/widgets/chart-panel'",
    mobileInstead: tx('Chưa có trên Android/iOS: thống kê của người bán xem trên web.', 'Not on Android/iOS yet: sellers see their statistics on the web.'),
  },
  card: {
    web: "import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'",
    mobile: {
      source: "import { Card } from '@/shared/ui'",
      code: `<Card>
  <Text variant="titleSm">Đơn #1042</Text>
  <Text muted>2 món · 129.000 ₫</Text>
</Card>`,
      notes: [
        tx('Một View bo 12, đệm 16, khoảng cách con 8, nền surface của giao diện đang dùng.', 'A View with 12 radius, 16 padding, 8 gap between children, on the current theme\'s surface.'),
        tx('Không có phần đầu/chân riêng: đặt Text và Button bên trong.', 'No separate header/footer parts: place Text and Button inside.'),
      ],
      android: tx('Android: không có elevation; thẻ tách khỏi nền bằng màu surfaceMuted phía sau.', 'Android: no elevation; cards stand off by the surfaceMuted background behind them.'),
      ios: tx('iOS: không có bóng; giống Android để hai nền tảng nhìn như nhau.', 'iOS: no shadow; the same as Android so both platforms look alike.'),
    },
  },
  sheet: {
    web: "import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'",
    mobile: {
      source: "import { Sheet } from '@/shared/ui'",
      code: `<Sheet visible={open} onClose={() => setOpen(false)} title="Tuỳ chọn món">
  …
</Sheet>`,
      notes: [
        tx('Trượt từ dưới lên trên lớp nền tối 40 %; có thanh kéo ở trên và tiêu đề bắt buộc.', 'Slides up over a 40% dark scrim; has a handle on top and a required title.'),
        tx('Bấm vào nền tối thì đóng. Đáy sheet chừa vùng an toàn của máy.', 'Tapping the scrim closes it. The bottom keeps the device safe area.'),
      ],
      android: tx('Android: nút Back của hệ thống đóng sheet (onRequestClose).', 'Android: the system Back button closes the sheet (onRequestClose).'),
      ios: tx('iOS: chưa hỗ trợ vuốt xuống để đóng; người dùng bấm vào nền tối.', 'iOS: swipe down to close is not supported yet; people tap the scrim.'),
    },
  },
  'empty-state': {
    web: "import { EmptyState } from '@/shared/ui/empty-state'",
    mobile: {
      source: "import { EmptyState } from '@/shared/ui'",
      code: `<EmptyState illustration="empty" title="Chưa có đơn nào." hint="Đơn mới hiện ở đây ngay khi khách đặt." />`,
      notes: [
        tx('Trên điện thoại câu phụ là prop hint; trên web là children nên có thể chứa một nút.', 'On phones the second line is the hint prop; on the web it is children, so it can hold a button.'),
        tx('Hình minh hoạ rộng 140, chữ căn giữa.', 'The illustration is 140 wide, text centred.'),
      ],
      android: tx('Android: TalkBack đọc tiêu đề rồi câu phụ, vì vậy tiêu đề phải tự đủ nghĩa.', 'Android: TalkBack reads the title then the hint, so the title must make sense on its own.'),
      ios: tx('iOS: VoiceOver đọc giống Android.', 'iOS: VoiceOver reads it the same way as Android.'),
    },
  },
}
