import { useState } from 'react'
import { t } from '@/shared/i18n'
import { Chip } from '@/shared/ui/chip'
import { QuantityStepper } from '@/shared/ui/commerce'
import { Switch } from '@/shared/ui/switch'
import { TextField } from '@/shared/ui/text-field'

// ---------------------------------------------------------------- live demos (they keep their own state)

export function ChipDemo() {
  const [picked, setPicked] = useState<string[]>(['Gần nhất'])
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {['Gần nhất', 'Cơm', 'Bún, phở', 'Đồ uống'].map((c) => (
        <Chip key={c} selected={picked.includes(c)} onSelectedChange={(on) => setPicked((p) => (on ? [...p, c] : p.filter((x) => x !== c)))}>
          {c}
        </Chip>
      ))}
    </div>
  )
}

export function SwitchDemo() {
  const [on, setOn] = useState(true)
  return (
    <div className="flex items-center gap-3">
      <Switch checked={on} onCheckedChange={setOn} aria-labelledby="switch-demo" />
      <span id="switch-demo" className="text-body">
        {on ? t('Đang nhận đơn') : t('Tạm ngưng nhận đơn')}
      </span>
    </div>
  )
}

export function StepperDemo() {
  const [n, setN] = useState(1)
  return <QuantityStepper value={n} onChange={setN} min={0} max={20} label="Cơm gà xối mỡ" />
}

export function FieldDemo({ withError = false }: { withError?: boolean }) {
  const [v, setV] = useState(withError ? '0912' : '')
  return (
    <TextField
      id={withError ? 'demo-phone-error' : 'demo-phone'}
      className="w-full max-w-sm"
      label={t('Số điện thoại')}
      required
      inputMode="tel"
      value={v}
      onChange={(e) => setV(e.target.value)}
      help={t('Quán gọi số này khi giao tới.')}
      error={withError ? t('Số điện thoại cần 10 chữ số, ví dụ 0912345678.') : undefined}
    />
  )
}
