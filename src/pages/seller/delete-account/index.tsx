import { FocusFrame } from '@/widgets/focus-frame'
import { DeleteAccountCard } from './delete-account-card'
import { merchantPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/** Deleting the account (delete-account.md), on a page of its own. */
export function SellerDeleteAccountPage() {
  return (
    <FocusFrame title={t('Xoá tài khoản')} exitTo={merchantPath('/account')} flat>
      <h1 className="mb-4 text-2xl font-semibold">{t('Xoá tài khoản')}</h1>
      <DeleteAccountCard />
    </FocusFrame>
  )
}
