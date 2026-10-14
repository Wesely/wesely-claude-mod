import { expect, test } from 'claude-code/testing'

import { composeTail, displayWidth, formatLabel, formatUsage, pickTitle } from './format'

test('usage text for the right side', () => {
  const limits = [
    { kind: 'five_hour', percentUsed: 20.4 },
    { kind: 'seven_day', percentUsed: 80 },
  ]
  expect(formatUsage(limits)).toBe('5hr: 20% · Weekly: 80%')
  expect(formatUsage([])).toBe('5hr: -- · Weekly: --')
})

test('label for the left side', () => {
  expect(formatLabel(false, '客戶標記')).toBe('💻 客戶標記')
  expect(formatLabel(true, undefined)).toBe('📶 (untitled)')
})

test('custom title beats ai title', () => {
  const jsonl = [
    '{"type":"ai-title","aiTitle":"AI 名"}',
    '{"type":"custom-title","customTitle":"我的名"}',
    '{"type":"ai-title","aiTitle":"更新 AI 名"}',
  ].join('\n')
  expect(pickTitle(jsonl)).toBe('我的名')
  expect(pickTitle('{"type":"ai-title","aiTitle":"只有 AI"}\n')).toBe('只有 AI')
  expect(pickTitle('')).toBeUndefined()
})

test('tail pushes usage to the right edge, falls back when narrow', () => {
  const hint = 'auto mode on'
  const tail = composeTail(hint, '💻 客戶', '5hr: 3%', 60)
  expect(2 + displayWidth(hint) + displayWidth(tail) + 2).toBe(60)
  expect(tail.endsWith('5hr: 3%')).toBe(true)
  expect(composeTail(hint, '💻 客戶', '5hr: 3%', 20)).toBe(' · 💻 客戶 · 5hr: 3%')
  expect(composeTail('', 'x', 'y', undefined)).toBe('x · y')
})
