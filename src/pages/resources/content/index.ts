import type { ResourceDoc } from '../doc'
import type { TabKey } from '../site'
import { DESIGN_LANGUAGE } from './design-language'
import { DEVELOPERS } from './developers'
import { GET_STARTED } from './get-started'
import { UX } from './ux'
import { WEB_TOKENS } from './web-tokens'

/** Every written page of the resources site: tab → section → page. The components are in components/registry.tsx. */
export const CONTENT: Record<TabKey, Record<string, Record<string, ResourceDoc>>> = {
  design: { 'get-started': GET_STARTED, 'design-language': DESIGN_LANGUAGE, ux: UX, 'web-tokens': WEB_TOKENS },
  developers: DEVELOPERS,
}
