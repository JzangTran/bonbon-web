import { Link } from 'react-router'

/** The small print under a sign-in or sign-up card. */
export function LegalNote({ action }: { action: string }) {
  return (
    <p className="text-center text-xs text-foreground">
      Bằng việc {action}, bạn đồng ý với{' '}
      <Link to="/legal/SELLER_TERMS" target="_blank" className="text-primary hover:underline">
        Điều khoản dành cho người bán
      </Link>{' '}
      &amp;{' '}
      <Link to="/legal/PRIVACY_POLICY" target="_blank" className="text-primary hover:underline">
        Chính sách quyền riêng tư
      </Link>
    </p>
  )
}
