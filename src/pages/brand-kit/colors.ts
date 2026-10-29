import { t, tx } from '@/shared/i18n'

export type SwatchColor = { name: string; hex: string; token: string; use: string }

export const BRAND_COLORS: SwatchColor[] = [
  { name: 'Orange 500', hex: '#FE551B', token: '--primary', use: t('Màu thương hiệu: logo, mục đang chọn, gạch chân liên kết, hình minh hoạ, chuỗi số liệu đầu tiên.') },
  { name: 'Orange 50', hex: '#FFF4EE', token: '--accent', use: t('Nền ghi chú và thẻ nhấn rất nhẹ.') },
  { name: 'Ink', hex: '#1D1D1D', token: '--ink', use: t('Chữ nội dung và nút chính.') },
  { name: 'Grey 600', hex: '#6E6E6E', token: '--muted-foreground', use: t('Chữ điều hướng, mô tả, nhãn và mục chưa chọn.') },
  { name: 'Beige 50', hex: '#FAFAF9', token: '--beige-50', use: t('Nền khối số liệu, biểu đồ và chân trang.') },
  { name: 'Grey 100', hex: '#F5F5F5', token: '--muted', use: t('Nền ô nhập, nút phụ và nền khi rê chuột.') },
  { name: 'Grey 200', hex: '#EDEDED', token: '--border', use: t('Đường kẻ mảnh, chỉ khi thật cần.') },
]

export const STATE_COLORS: SwatchColor[] = [
  { name: 'Success', hex: '#1F7A3F', token: '--success', use: tx('Đơn đã giao, đã duyệt, việc đã xong.', 'Delivered, approved, done.') },
  { name: 'Warning', hex: '#A15C00', token: '--warning', use: tx('Sắp hết hạn, cần để ý, chờ quyết.', 'About to expire, needs attention, awaiting a decision.') },
  { name: 'Danger', hex: '#C42B1C', token: '--destructive', use: tx('Lỗi, từ chối, hành động không hoàn tác được.', 'Errors, rejections, actions that cannot be undone.') },
  { name: 'Info', hex: '#1D5BD8', token: '--info', use: tx('Thông tin trung tính đáng chú ý, không đòi làm gì.', 'Neutral information worth noticing, no action needed.') },
]

export const CHART_COLORS: SwatchColor[] = [
  { name: 'Chart 1', hex: '#FE551B', token: '--chart-1', use: tx('Chuỗi đầu tiên, luôn là số liệu chính.', 'The first series, always the main figure.') },
  { name: 'Chart 2', hex: '#2A78D6', token: '--chart-2', use: t('Chuỗi số liệu thứ hai trên biểu đồ.') },
  { name: 'Chart 3', hex: '#1BAF7A', token: '--chart-3', use: t('Chuỗi số liệu thứ ba trên biểu đồ.') },
]
