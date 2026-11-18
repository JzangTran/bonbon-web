import { tx } from '@/shared/i18n'

export type SwatchColor = { name: string; hex: string; token: string; use: string }

/** Design v5 (direction A "Cam Bếp"); the values come from bonbon-design/tokens and are checked there for contrast. */
export const BRAND_COLORS: SwatchColor[] = [
  { name: 'Orange 600 · accent', hex: '#CF430D', token: '--bb-accent', use: tx('Nút chính, mục đang chọn, viền focus. Chữ trắng trên nền này đạt 4,71:1.', 'Primary button, selected item, focus ring. White text on it reaches 4.71:1.') },
  { name: 'Orange 700 · link', hex: '#B33A0C', token: '--bb-link', use: tx('Liên kết trong đoạn văn, chữ nhãn khuyến mãi (5,95:1).', 'Links in running text, promo label text (5.95:1).') },
  { name: 'Orange 500 · brand', hex: '#F45A16', token: '--bb-brand', use: tx('Logo, chú gấu, mảng thương hiệu lớn. Không dùng cho chữ.', 'Logo, mascot, large brand shapes. Never text.') },
  { name: 'Orange 50 · accentSubtle', hex: '#FFF4ED', token: '--bb-accent-subtle', use: tx('Nền chip và mục menu đang chọn.', 'Fill of a selected chip or menu item.') },
  { name: 'Stone 900 · text', hex: '#1C1A18', token: '--bb-text', use: tx('Tiêu đề và nội dung.', 'Titles and body text.') },
  { name: 'Stone 600 · textSecondary', hex: '#5E5952', token: '--bb-text-secondary', use: tx('Mô tả, thông tin phụ.', 'Descriptions, metadata.') },
  { name: 'Stone 500 · textTertiary', hex: '#736D65', token: '--bb-text-tertiary', use: tx('Chú thích, thời gian, placeholder.', 'Captions, timestamps, placeholders.') },
  { name: 'Stone 50 · surfaceSubtle', hex: '#F7F6F4', token: '--bb-surface-subtle', use: tx('Nền ô tìm kiếm, nhóm cài đặt, dòng đang chọn.', 'Search field, settings group, selected row.') },
  { name: 'Stone 200 · border', hex: '#E3E0DB', token: '--bb-border', use: tx('Đường kẻ mảnh, chỉ khi thật cần.', 'Hairlines, only where needed.') },
]

export const STATE_COLORS: SwatchColor[] = [
  { name: 'Success', hex: '#1E7B45', token: '--bb-success', use: tx('Đã thanh toán, đã giao, đã duyệt.', 'Paid, delivered, approved.') },
  { name: 'Warning', hex: '#9A6A00', token: '--bb-warning', use: tx('Cần chú ý sớm. Màu hổ phách để không lẫn với cam thương hiệu.', 'Needs attention soon. Amber so it never reads as the orange brand.') },
  { name: 'Danger', hex: '#C8261B', token: '--bb-danger', use: tx('Lỗi, từ chối, hành động không hoàn tác được.', 'Errors, rejections, actions that cannot be undone.') },
  { name: 'Info', hex: '#1F5FD1', token: '--bb-info', use: tx('Đang xử lý, tin trung tính.', 'In progress, neutral news.') },
]

export const CHART_COLORS: SwatchColor[] = [
  { name: 'Chart 1', hex: '#CF430D', token: '--bb-chart-1', use: tx('Chuỗi đầu tiên, luôn là số liệu chính.', 'The first series, always the main figure.') },
  { name: 'Chart 2', hex: '#2A78D6', token: '--bb-chart-2', use: tx('Chuỗi thứ hai.', 'The second series.') },
  { name: 'Chart 3', hex: '#1B9E6E', token: '--bb-chart-3', use: tx('Chuỗi thứ ba.', 'The third series.') },
]
