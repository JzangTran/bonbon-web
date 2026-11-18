import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Avatar } from '../avatar'
import { Badge } from '../badge'
import { Button } from '../button'
import { Checkbox } from '../checkbox'
import { Chip } from '../chip'
import { Price, QuantityStepper, Rating } from '../commerce'
import { EmptyState } from '../empty-state'
import { IconButton } from '../icon-button'
import { ListItem } from '../list-item'
import { Banner, InlineMessage } from '../message'
import { ResultPage } from '../result-page'
import { Spinner } from '../spinner'
import { Switch } from '../switch'
import { Text } from '../text'
import { TextField } from '../text-field'

describe('Text', () => {
  it('maps each style to its heading level and class', () => {
    render(
      <>
        <Text variant="title-1">Đơn hàng</Text>
        <Text variant="title-3">Món bán chạy</Text>
        <Text variant="body-sm" tone="secondary">
          2× Cơm gà
        </Text>
      </>,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Đơn hàng' })).toHaveClass('text-title-1', 'text-text')
    expect(screen.getByRole('heading', { level: 3, name: 'Món bán chạy' })).toHaveClass('text-title-3')
    expect(screen.getByText('2× Cơm gà')).toHaveClass('text-body-sm', 'text-text-secondary')
  })
})

describe('Button and IconButton', () => {
  it('uses the 10 px control radius and the accent for the main action', () => {
    render(<Button>Nhận đơn</Button>)
    const button = screen.getByRole('button', { name: 'Nhận đơn' })
    expect(button).toHaveClass('rounded-control', 'bg-button', 'font-semibold')
  })
  it('an icon button always has an accessible name and a tooltip', () => {
    render(<IconButton label="Đóng" icon={<svg />} />)
    const button = screen.getByRole('button', { name: 'Đóng' })
    expect(button).toHaveAttribute('title', 'Đóng')
  })
})

describe('TextField', () => {
  it('shows help, then replaces it with an announced, linked error and keeps the value', () => {
    const { rerender } = render(<TextField id="phone" label="Số điện thoại" help="Ví dụ 0912345678" value="0912" onChange={() => {}} required />)
    const input = screen.getByLabelText(/Số điện thoại/)
    expect(input).toHaveAccessibleDescription('Ví dụ 0912345678')
    expect(input).toBeRequired()
    rerender(<TextField id="phone" label="Số điện thoại" help="Ví dụ 0912345678" error="Số điện thoại cần 10 chữ số" value="0912" onChange={() => {}} required />)
    expect(screen.getByRole('alert')).toHaveTextContent('Số điện thoại cần 10 chữ số')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Số điện thoại cần 10 chữ số')
    expect(input).toHaveValue('0912')
  })
})

describe('Chip', () => {
  it('toggles and announces its state', async () => {
    function Demo() {
      const [on, setOn] = useState(false)
      return (
        <Chip selected={on} onSelectedChange={setOn}>
          Gần nhất
        </Chip>
      )
    }
    render(<Demo />)
    const chip = screen.getByRole('button', { name: 'Gần nhất' })
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(chip)
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    expect(chip).toHaveClass('bg-accent-subtle')
  })
})

describe('Switch', () => {
  it('is a switch that flips with the keyboard', async () => {
    const onChange = vi.fn()
    render(<Switch checked={false} onCheckedChange={onChange} label="Nhận đơn" />)
    const sw = screen.getByRole('switch', { name: 'Nhận đơn' })
    expect(sw).toHaveAttribute('aria-checked', 'false')
    sw.focus()
    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('Checkbox', () => {
  it('is ticked by clicking its label and describes itself', async () => {
    render(<Checkbox id="terms" label="Tôi đồng ý" description="Đọc điều khoản trước khi đồng ý." />)
    const box = screen.getByRole('checkbox', { name: 'Tôi đồng ý' })
    expect(box).toHaveAccessibleDescription('Đọc điều khoản trước khi đồng ý.')
    await userEvent.click(screen.getByText('Tôi đồng ý'))
    expect(box).toBeChecked()
  })
})

describe('Badge', () => {
  it('maps the v4 variant names onto v5 tones', () => {
    render(
      <>
        <Badge variant="destructive">Bị từ chối</Badge>
        <Badge tone="success">Đã thanh toán</Badge>
        <Badge>Mới</Badge>
      </>,
    )
    expect(screen.getByText('Bị từ chối')).toHaveAttribute('data-tone', 'danger')
    expect(screen.getByText('Đã thanh toán')).toHaveClass('bg-success-subtle')
    expect(screen.getByText('Mới')).toHaveAttribute('data-tone', 'accent')
  })
})

describe('Avatar', () => {
  it('falls back to the initial with the name as its label', () => {
    render(<Avatar name="hoàng minh anh" />)
    expect(screen.getByRole('img', { name: 'hoàng minh anh' })).toHaveTextContent('H')
  })
})

describe('ListItem', () => {
  it('is one target with a chevron when it does something', async () => {
    const onClick = vi.fn()
    render(<ListItem title="Địa chỉ giao hàng" trailing="Nhà" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: /Địa chỉ giao hàng/ }))
    expect(onClick).toHaveBeenCalledOnce()
  })
  it('is static text without an action', () => {
    render(<ListItem title="Phí giao" trailing="10.000 ₫" />)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('commerce', () => {
  it('Price writes Vietnamese money and announces the old price', () => {
    render(<Price amount={45000} original={55000} />)
    expect(screen.getByText(/45\.000/)).toBeInTheDocument()
    expect(screen.getByText('giá cũ')).toHaveClass('sr-only')
    expect(screen.getByText(/55\.000/).tagName).toBe('S')
  })
  it('Rating says when there are no reviews instead of 0', () => {
    const { rerender } = render(<Rating score={null} count={0} />)
    expect(screen.getByText('Chưa có đánh giá')).toBeInTheDocument()
    rerender(<Rating score={4.8} count={126} />)
    expect(screen.getByLabelText('4,8 trên 5 sao, 126 đánh giá')).toBeInTheDocument()
  })
  it('QuantityStepper stays within its limits', async () => {
    function Demo() {
      const [n, setN] = useState(1)
      return <QuantityStepper value={n} onChange={setN} min={1} max={2} label="Cơm gà" />
    }
    render(<Demo />)
    const less = screen.getByRole('button', { name: 'Bớt một' })
    const more = screen.getByRole('button', { name: 'Thêm một' })
    expect(less).toBeDisabled()
    await userEvent.click(more)
    expect(screen.getByRole('group', { name: 'Số lượng Cơm gà' })).toHaveTextContent('2')
    expect(more).toBeDisabled()
  })
})

describe('feedback', () => {
  it('Spinner is announced', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Đang tải')
  })
  it('InlineMessage: danger is an alert, others a status; the action is reachable', () => {
    render(
      <>
        <InlineMessage tone="danger" title="Chưa lưu được món" action={<Button>Thử lại</Button>}>
          Máy chủ không phản hồi. Nội dung vẫn còn trên trang.
        </InlineMessage>
        <InlineMessage tone="success" title="Đã lưu lúc 14:02" />
      </>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Chưa lưu được món')
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu lúc 14:02')
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
  it('Banner can only be closed when it offers a close button', async () => {
    const onDismiss = vi.fn()
    const { rerender } = render(<Banner tone="warning" title="Quán đang tạm ngưng nhận đơn" />)
    expect(screen.queryByRole('button', { name: 'Đóng' })).toBeNull()
    rerender(<Banner tone="info" title="Có bản cập nhật" onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
  it('ResultPage says what happens next, in order', () => {
    render(<ResultPage title="Đã gửi đơn #1025 tới Bếp Sen" next={['Quán nhận đơn, thường trong 3 phút', 'Bạn thấy giờ giao dự kiến']} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Đã gửi đơn #1025')
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1Quán nhận đơn, thường trong 3 phút', '2Bạn thấy giờ giao dự kiến'])
  })
  it('EmptyState offers the one action that fills it', () => {
    render(<EmptyState title="Chưa có món nào" action={<Button>Thêm món</Button>} />)
    expect(screen.getByRole('button', { name: 'Thêm món' })).toBeInTheDocument()
  })
})

describe('cn', () => {
  it('keeps a text size next to a text colour (v4 dropped it)', async () => {
    const { cn } = await import('@/shared/lib/utils')
    expect(cn('text-ui', 'text-muted-foreground')).toBe('text-ui text-muted-foreground')
    expect(cn('text-label', 'text-text-secondary')).toBe('text-label text-text-secondary')
    expect(cn('text-ui', 'text-body-sm')).toBe('text-body-sm')
    expect(cn('rounded-control', 'rounded-card')).toBe('rounded-card')
  })
})

describe('feedback ladder', () => {
  it('splits one message into a title and what it means', async () => {
    const { splitMessage } = await import('../feedback')
    expect(splitMessage('Đã lưu nháp. Khách chưa thấy món này.')).toEqual({ title: 'Đã lưu nháp', body: 'Khách chưa thấy món này.' })
    expect(splitMessage('Đã lưu.')).toEqual({ title: 'Đã lưu' })
  })
  it('shows a result in the page region and an error inside the dialog region', async () => {
    const { FeedbackRegion, useFeedback } = await import('../feedback')
    function Actions() {
      const feedback = useFeedback()
      return (
        <>
          <button onClick={() => feedback.success('Đã lưu món. Khách thấy thay đổi ngay.')}>ok</button>
          <button onClick={() => feedback.error('Chưa lưu được món')}>fail</button>
        </>
      )
    }
    render(
      <FeedbackRegion>
        <div data-testid="page" />
        <div data-testid="dialog">
          <FeedbackRegion placement="bottom" errorsOnly>
            <Actions />
          </FeedbackRegion>
        </div>
      </FeedbackRegion>,
    )
    await userEvent.click(screen.getByText('ok'))
    // a success leaves the dialog for the page: the dialog usually closes right after
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Đã lưu món')
    expect(status).toHaveTextContent('Khách thấy thay đổi ngay.')
    expect(screen.getByTestId('dialog')).not.toContainElement(status)
    await userEvent.click(screen.getByText('fail'))
    expect(screen.getByTestId('dialog')).toContainElement(screen.getByRole('alert'))
  })
})

describe('CopyButton', () => {
  it('says it copied on the button itself', async () => {
    const { CopyButton } = await import('../copy-button')
    const user = userEvent.setup()
    render(<CopyButton value="bb_key" label="Sao chép khoá" />)
    await user.click(screen.getByRole('button', { name: /Sao chép/ }))
    expect(await screen.findByText('Đã chép', { selector: 'span:not(.sr-only)' })).toBeInTheDocument()
  })
})

describe('feedback carry-over', () => {
  it('a message from a page that closes right after saving moves to the page underneath', async () => {
    const { FeedbackHost, FeedbackRegion, useFeedback } = await import('../feedback')
    function Form({ onDone }: { onDone: () => void }) {
      const feedback = useFeedback()
      return (
        <button
          onClick={() => {
            feedback.success('Đã lưu món. Khách thấy thay đổi ngay.')
            onDone()
          }}
        >
          save
        </button>
      )
    }
    function Pages() {
      const [open, setOpen] = useState(true)
      return (
        <FeedbackRegion>
          <p>list</p>
          {open ? (
            <FeedbackRegion>
              <Form onDone={() => setOpen(false)} />
            </FeedbackRegion>
          ) : null}
        </FeedbackRegion>
      )
    }
    render(
      <FeedbackHost>
        <Pages />
      </FeedbackHost>,
    )
    await userEvent.click(screen.getByText('save'))
    expect(screen.queryByText('save')).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu món')
  })
})
