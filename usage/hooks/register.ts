import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { composeTail, formatLabel, formatUsage, pickTitle } from './format'

const label = atom({ plugin: 'usage', key: 'label' } as const, '')
const usageText = atom({ plugin: 'usage', key: 'usageText' } as const, '')

// Prints the session's title entries (custom from /rename, else AI-generated) from its transcript.
const TITLE_SCRIPT =
  'f=$(ls "$HOME"/.claude/projects/*/"$1".jsonl 2>/dev/null | head -1); ' +
  '[ -n "$f" ] && grep -E \'"type":"(custom|ai)-title"\' "$f" | tail -20'

const refresh = async ($: EngineInterface): Promise<void> => {
  const [usage, surfaces, id] = await Promise.all([
    $.session.usage(),
    $.session.surfaces(),
    $.session.id(),
  ])
  const ran = await $.process.run(['sh', '-c', TITLE_SCRIPT, 'sh', id])
  const next = formatLabel(surfaces.some(s => s !== 'terminal'), pickTitle(ran.stdout))
  await update($, label, () => next)
  await update($, usageText, () => formatUsage(usage.rateLimits))
}

const safely = ($: EngineInterface): Promise<void> =>
  refresh($).catch(err => $.ui.log(`usage: ${String(err)}`, { to: 'debug' }))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    $.ui.status(undefined) // drop the pinned line an earlier version left
    await safely($)
    return result
  })
  on('session.measure', async ($, e, next) => {
    const result = await next(e)
    await safely($)
    return result
  })
  on('session.attach', async ($, e, next) => {
    const result = await next(e)
    await safely($)
    return result
  })
  on('session.detach', async ($, e, next) => {
    const result = await next(e)
    await safely($)
    return result
  })
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await safely($)
    return result
  })

  // One row: the engine's hint stays live, the label follows it, usage sits at the right edge.
  on('ui.render', { component: 'PromptHint' }, async ($, e, next) => {
    const [text, usage] = [await read($, label), await read($, usageText)]
    if (text === '') return next(e)
    const tail = composeTail(e.props.hint, text, usage, e.viewport?.columns)
    return next({ ...e, props: { ...e.props, tail } })
  })
}
