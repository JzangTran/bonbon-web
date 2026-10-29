import { tx } from '@/shared/i18n'
import { C, P, Principle } from '../doc'
import type { BrandDoc } from '../doc'
import { TokenTable } from '../token-table'
import { ROWS, TOKEN_GROUPS } from '../tokens'

const colorTokens: BrandDoc = {
  title: 'Color tokens',
  summary: tx(
    'Mọi token màu của web, đọc trực tiếp từ tokens.css nên luôn khớp với mã. Cột Dark để trống nghĩa là giao diện tối dùng lại giá trị sáng.',
    'Every web colour token, read straight from tokens.css so it always matches the code. An empty Dark column means the dark theme reuses the light value.',
  ),
  sections: [
    {
      id: 'how-to-use',
      title: tx('Dùng qua lớp Tailwind', 'Use them through Tailwind classes'),
      body: (
        <>
          <P>
            {tx('Token có cột Tailwind dùng được như ', 'Tokens with a Tailwind column work as ')}
            <C>bg-primary</C>, <C>text-muted-foreground</C>, <C>border-border</C>
            {tx('. Token không có lớp (như ', '. Tokens without a class (like ')}
            <C>--orange-600</C>
            {tx(') là tầng bảng màu, chỉ dùng để định nghĩa token khác.', ') are the palette layer, only used to define other tokens.')}
          </P>
          <Principle>{tx('Ưu tiên token ngữ nghĩa; chỉ dùng tầng bảng màu khi định nghĩa token mới.', 'Prefer semantic tokens; use the palette layer only to define new tokens.')}</Principle>
        </>
      ),
    },
    ...TOKEN_GROUPS.map((g) => ({ id: g.id, title: g.title, body: <TokenTable rows={ROWS.filter((r) => g.test(r.name))} /> })),
  ],
}

export const WEB_TOKENS: Record<string, BrandDoc> = { 'color-tokens': colorTokens }
