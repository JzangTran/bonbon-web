import { Link } from 'react-router'
import { AuthShell, SuccessMark } from '@/widgets/auth-shell'

/**
 * Where MoMo sends a customer's browser after a payment made on its page. It only says goodbye: whether the payment
 * arrived is decided by the signed notification to our server, and the app shows the order as the server has it.
 */
export function PaymentReturnPage() {
  return (
    <AuthShell bare title="Đã nhận kết quả từ MoMo" description="Quay lại ứng dụng bonbon để xem đơn của bạn. Trạng thái đơn sẽ tự cập nhật trong ít giây.">
      <SuccessMark />
      <Link to="/" className="text-link text-center text-sm">
        Về trang chủ bonbon
      </Link>
    </AuthShell>
  )
}
