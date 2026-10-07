import { EyeIcon, EyeOffIcon } from 'lucide-react'
import * as React from 'react'
import { Input } from './input'

/** A password field with a show/hide toggle, so a second "repeat it" field is not needed. */
function PasswordInput({ className, ...props }: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="relative">
      <Input {...props} type={shown ? 'text' : 'password'} className={`pr-10 ${className ?? ''}`} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        aria-pressed={shown}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {shown ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }
