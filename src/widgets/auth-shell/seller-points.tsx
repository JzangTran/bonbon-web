import { t } from '@/shared/i18n'
import { BikeIcon, PercentIcon, StoreIcon } from 'lucide-react'

/** What the seller entry pages promise, from the product scope: local reach, low commission, own delivery. */
export const SELLER_POINTS = [
  { icon: <StoreIcon />, text: t('Đưa quán của bạn đến cư dân ngay trong chung cư và khu công nghiệp quanh quán') },
  { icon: <PercentIcon />, text: t('Hoa hồng thấp hơn các ứng dụng giao đồ ăn lớn') },
  { icon: <BikeIcon />, text: t('Quán tự giao trong khu, tự đặt phí giao và bán kính giao') },
]
