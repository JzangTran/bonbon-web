import { legalUrl } from '@/shared/config/sites'

/** The small print under a sign-in or sign-up card. */
export function LegalNote({ action }: { action: string }) {
  return (
    <p className="text-center text-xs text-foreground">
      Bằng việc {action}, bạn đồng ý với{' '}
      <a href={legalUrl('SELLER_TERMS')} target="_blank" rel="noreferrer" className="text-link">
        Điều khoản dành cho người bán
      </a>{' '}
      &amp;{' '}
      <a href={legalUrl('PRIVACY_POLICY')} target="_blank" rel="noreferrer" className="text-link">
        Chính sách quyền riêng tư
      </a>
    </p>
  )
}
