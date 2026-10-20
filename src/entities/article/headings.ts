import type { Block, Heading } from './types'

/** A url-safe id for a heading: lower case, no accents, words joined with dashes. */
export function headingId(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function headingsOf(blocks: Block[]): Heading[] {
  const seen = new Map<string, number>()
  const out: Heading[] = []
  for (const b of blocks) {
    if (b.t !== 'h2' && b.t !== 'h3') continue
    const base = headingId(b.text) || 'muc'
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    out.push({ id: n === 1 ? base : `${base}-${n}`, text: b.text, level: b.t === 'h2' ? 2 : 3 })
  }
  return out
}

/** Reads the plain text of a help center article: `## heading`, `- ` list lines, blank lines between paragraphs. */
export function blocksFromText(body: string): Block[] {
  const blocks: Block[] = []
  let list: string[] | null = null
  const flush = () => {
    if (list) blocks.push({ t: 'ul', items: list })
    list = null
  }
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim()
    if (line === '') {
      flush()
      continue
    }
    const h = /^(#{2,3})\s+(.*)$/.exec(line)
    if (h) {
      flush()
      blocks.push({ t: h[1].length === 2 ? 'h2' : 'h3', text: h[2] })
    } else if (/^[-*]\s+/.test(line)) {
      list = [...(list ?? []), line.replace(/^[-*]\s+/, '')]
    } else {
      flush()
      const last = blocks[blocks.length - 1]
      if (last?.t === 'p') last.text += ` ${line}`
      else blocks.push({ t: 'p', text: line })
    }
  }
  flush()
  return blocks
}
