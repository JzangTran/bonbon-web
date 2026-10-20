import { FocusFrame } from '@/widgets/focus-frame'
import { DeleteAccountCard } from './delete-account-card'
import { sellerPath } from '@/shared/config/sites'

/** Deleting the account (delete-account.md), on a page of its own. */
export function SellerDeleteAccountPage() {
  return (
    <FocusFrame title="Xoá tài khoản" exitTo={sellerPath('/account')} flat>
      <h1 className="mb-4 text-2xl font-bold">Xoá tài khoản</h1>
      <DeleteAccountCard />
    </FocusFrame>
  )
}
