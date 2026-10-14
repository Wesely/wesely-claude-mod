export const ICON_REMOTE = '📶'
export const ICON_LOCAL = '💻'
const UNTITLED = '(untitled)'

type Limit = { kind: string; percentUsed: number }

const pct = (limits: readonly Limit[], kind: string): string => {
  const found = limits.find(l => l.kind === kind)
  return found === undefined ? '--' : `${Math.round(found.percentUsed)}%`
}

/** Last custom title wins over the AI title; each input line is one transcript JSON entry. */
export const pickTitle = (jsonl: string): string | undefined => {
  const entries = jsonl
    .split('\n')
    .filter(line => line.trim() !== '')
    .flatMap(line => {
      try {
        return [JSON.parse(line) as { type?: string; customTitle?: string; aiTitle?: string }]
      } catch {
        return []
      }
    })
  const custom = entries.filter(x => x.type === 'custom-title' && x.customTitle).at(-1)
  const ai = entries.filter(x => x.type === 'ai-title' && x.aiTitle).at(-1)
  return custom?.customTitle ?? ai?.aiTitle
}

/** Right side: the pinned status text (the engine prefixes it with the plugin name). */
export const formatUsage = (rateLimits: readonly Limit[]): string =>
  `5hr: ${pct(rateLimits, 'five_hour')} · Weekly: ${pct(rateLimits, 'seven_day')}`

/** Left side: remote-control icon and session name, drawn on the hint line. */
export const formatLabel = (isRemote: boolean, title: string | undefined): string =>
  `${isRemote ? ICON_REMOTE : ICON_LOCAL} ${title ?? UNTITLED}`

// Wide (2-column) code points: CJK, fullwidth forms, emoji.
const WIDE = /[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦\u{1F300}-\u{1FAFF}\u{20000}-\u{3FFFD}]/u
const ROW_INDENT = 2 // the hint line's left padding
const RIGHT_MARGIN = 2 // slack so the row never wraps

export const displayWidth = (text: string): number =>
  [...text].reduce((sum, ch) => sum + (WIDE.test(ch) ? 2 : 1), 0)

/** Tail after the engine's hint: label on the left, usage pushed to the row's right edge. */
export const composeTail = (hint: string, label: string, usage: string, columns: number | undefined): string => {
  const left = `${hint === '' ? '' : ' · '}${label}`
  const used = ROW_INDENT + displayWidth(hint) + displayWidth(left) + displayWidth(usage) + RIGHT_MARGIN
  const gap = columns === undefined ? 0 : columns - used
  return `${left}${gap >= 2 ? ' '.repeat(gap) : ' · '}${usage}`
}
