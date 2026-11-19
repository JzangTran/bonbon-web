import { createCn } from 'cn/config'

/**
 * Class merging that knows bonbon's own utilities (design v5). Without this, `text-label` or `text-ui` (sizes) look like colours to
 * the merger and are dropped when a text colour follows, so a component silently loses its size; the same for the radius and shadow
 * names. Keep these lists in step with the @theme block in shared/ui/tokens.css.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'title-1', 'title-2', 'title-3', 'body', 'body-sm', 'label', 'caption', 'h1', 'h2', 'h3', 'lead', 'ui', 'small'] }],
      rounded: [{ rounded: ['control', 'panel', 'card', 'media', 'device'] }],
      shadow: [{ shadow: ['float', 'overlay', 'card', 'raised', 'dialog'] }],
    },
  },
})
