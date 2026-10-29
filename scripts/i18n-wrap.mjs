// Wraps every Vietnamese string of the web UI in t(...), keeping the file's formatting (edits by source position, not reprinting).
// Usage: node scripts/i18n-wrap.mjs [--dry]   Prints the number of strings per file, then the keys en.ts has no English for yet.
// The Vietnamese text is the key; src/shared/i18n/en.ts maps it to English. Articles (blog, guides) stay Vietnamese.
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { parse } from '@babel/parser'
import traverseModule from '@babel/traverse'

const traverse = traverseModule.default ?? traverseModule
const DRY = process.argv.includes('--dry')
const VN = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/
const SKIP = [/src\/shared\/api\/generated\//, /src\/entities\/article\/content\//, /src\/shared\/i18n\//, /\.d\.ts$/]
// attributes that are not text a person reads
const NOT_TEXT_ATTRS = new Set(['className', 'href', 'to', 'src', 'id', 'htmlFor', 'type', 'name', 'value', 'key', 'role', 'inputMode', 'autoComplete', 'target', 'rel', 'lang'])

const files = execFileSync('git', ['ls-files', 'src'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => /\.(tsx?|ts)$/.test(f) && !SKIP.some((r) => r.test(f)))

const keys = new Set()
let total = 0
for (const file of files) {
  let src = readFileSync(file, 'utf8')
  if (!VN.test(src)) continue
  let ast
  try {
    ast = parse(src, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  } catch (e) {
    console.error('cannot parse', file, e.message)
    continue
  }
  // first pass: local variables named t would hide the translator, rename them to tItem
  const renames = []
  traverse(ast, {
    Identifier(path) {
      if (path.node.name !== 't') return
      const b = path.scope.getBinding('t')
      if (!b || b.kind === 'module') return
      if (path.parentPath.isMemberExpression({ property: path.node }) && !path.parent.computed) return
      if (path.parentPath.isObjectProperty({ key: path.node }) && !path.parent.computed) return
      renames.push(path.node.start)
    },
  })
  if (renames.length) {
    renames.sort((a, b) => b - a)
    for (const at of renames) src = src.slice(0, at) + 'tItem' + src.slice(at + 1)
    ast = parse(src, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
  }
  const edits = []
  const inT = (path) => !!path.findParent((p) => p.isCallExpression() && p.node.callee.type === 'Identifier' && p.node.callee.name === 't')
  const quote = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
  const clash = (path) => {
    const b = path.scope.getBinding('t')
    if (b && !(b.kind === 'module')) console.error(`shadowed t at ${file}:${path.node.loc.start.line}`)
  }
  traverse(ast, {
    StringLiteral(path) {
      const v = path.node.value
      if (!VN.test(v) || inT(path)) return
      const parent = path.parent
      if (path.parentPath.isImportDeclaration() || path.parentPath.isExportDeclaration()) return
      if ((parent.type === 'ObjectProperty' || parent.type === 'ObjectMethod') && parent.key === path.node && !parent.computed) return
      if (path.findParent((p) => p.isTSType() || p.isTSLiteralType())) return
      if (parent.type === 'JSXAttribute') {
        if (NOT_TEXT_ATTRS.has(parent.name.name)) return
        edits.push({ start: path.node.start, end: path.node.end, text: `{t(${quote(v)})}` })
      } else {
        edits.push({ start: path.node.start, end: path.node.end, text: `t(${quote(v)})` })
      }
      keys.add(v)
      clash(path)
    },
    JSXText(path) {
      const raw = path.node.value
      if (!VN.test(raw)) return
      const lead = raw.match(/^\s*/)[0]
      const trail = raw.match(/\s*$/)[0]
      const text = raw.trim().replace(/\s+/g, ' ')
      // keep a space that separated the text from a neighbouring expression
      const keepLead = lead.length > 0 && !lead.includes('\n') ? ' ' : ''
      const keepTrail = trail.length > 0 && !trail.includes('\n') ? ' ' : ''
      const body = `${keepLead}${text}${keepTrail}`
      edits.push({ start: path.node.start, end: path.node.end, text: `${lead.includes('\n') ? lead : ''}{t(${quote(body)})}${trail.includes('\n') ? trail : ''}` })
      keys.add(body)
      clash(path)
    },
    TemplateLiteral(path) {
      const quasis = path.node.quasis.map((q) => q.value.cooked ?? q.value.raw)
      if (!quasis.some((q) => VN.test(q)) || inT(path)) return
      if (path.parent.type === 'TaggedTemplateExpression') return
      if (path.findParent((p) => p.isTSType())) return
      let key = ''
      const vars = []
      quasis.forEach((q, i) => {
        key += q
        if (i < path.node.expressions.length) {
          const e = path.node.expressions[i]
          key += `{v${i}}`
          vars.push(`v${i}: ${src.slice(e.start, e.end)}`)
        }
      })
      // nested Vietnamese inside the expressions is wrapped in its own pass; skip if an expression holds one
      if (path.node.expressions.some((e) => VN.test(src.slice(e.start, e.end)))) return
      const call = vars.length ? `t(${quote(key)}, { ${vars.join(', ')} })` : `t(${quote(key)})`
      edits.push({ start: path.node.start, end: path.node.end, text: path.parent.type === 'JSXAttribute' ? `{${call}}` : call })
      keys.add(key)
      clash(path)
    },
  })
  // a JSX attribute holding a template literal sits in a JSXExpressionContainer; drop the doubled braces
  if (!edits.length) continue
  edits.sort((a, b) => b.start - a.start)
  // no overlapping edits (outer wins)
  const kept = []
  for (const e of edits) if (!kept.some((k) => e.start >= k.start && e.end <= k.end)) kept.push(e)
  let out = src
  for (const e of kept) out = out.slice(0, e.start) + e.text + out.slice(e.end)
  if (!/import \{[^}]*\bt\b[^}]*\} from '@\/shared\/i18n'/.test(out)) {
    const imports = [...out.matchAll(/^import [\s\S]*?from '[^']+'\n/gm)]
    const at = imports.length ? imports[imports.length - 1].index + imports[imports.length - 1][0].length : 0
    out = out.slice(0, at) + "import { t } from '@/shared/i18n'\n" + out.slice(at)
  }
  total += kept.length
  console.log(`${kept.length}\t${file}`)
  if (!DRY) writeFileSync(file, out)
}
console.log(`${total} strings wrapped`)
// keys already in en.ts, read from its source so this script needs no TypeScript loader
const en = new Set([...readFileSync('src/shared/i18n/en.ts', 'utf8').matchAll(/^  ("(?:[^"\\]|\\.)*"): /gm)].map((m) => JSON.parse(m[1])))
const missing = [...keys].filter((k) => !en.has(k))
if (missing.length) console.log(['no English yet in src/shared/i18n/en.ts:', ...missing.map((k) => JSON.stringify(k))].join('\n'))
