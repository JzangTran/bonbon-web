import { legalUrl } from '@/shared/config/sites'

/** The small print under a sign-in or sign-up card. */
export function LegalNote({ action }: { action: string }) {
  return (
    <p className="text-center text-xs text-foreground">
      Bằng việc {action}, bạn đồng ý với{' '}
      <a href={legalUrl('SELLER_TERMS')} target="_blank" rel="noreferrer" className="text-primary hover:underline">
        Điều khoản dành cho người bán
      </a>{' '}
      &amp;{' '}
      <a href={legalUrl('PRIVACY_POLICY')} target="_blank" rel="noreferrer" className="text-primary hover:underline">
        Chính sách quyền riêng tư
      </a>
    </p>
  )
}
