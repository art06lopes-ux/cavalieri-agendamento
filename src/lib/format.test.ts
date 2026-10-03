import { describe, expect, it } from 'vitest'
import { formatBRL, formatBRLCompact, formatDate, formatDateTime, formatHora, shortDayMonth } from './format'

describe('formatBRL', () => {
  it('formats a number as BRL currency', () => {
    expect(formatBRL(40)).toBe('R$ 40,00')
  })

  it('treats null/undefined as zero', () => {
    expect(formatBRL(null)).toBe('R$ 0,00')
    expect(formatBRL(undefined)).toBe('R$ 0,00')
  })

  it('parses numeric strings (as returned by Postgres numeric columns)', () => {
    expect(formatBRL('89.9')).toBe('R$ 89,90')
  })
})

describe('formatDate', () => {
  it('returns em dash for missing values', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
  })

  it('formats a plain date (YYYY-MM-DD) without shifting a day', () => {
    expect(formatDate('2026-09-20')).toBe('20/09/2026')
  })
})

describe('formatDateTime', () => {
  it('returns em dash for missing values', () => {
    expect(formatDateTime(null)).toBe('—')
  })

  it('renders in the Manaus timezone regardless of server TZ', () => {
    // 2026-09-21T02:30:00Z is 2026-09-20 22:30 in Manaus (UTC-4).
    expect(formatDateTime('2026-09-21T02:30:00Z')).toBe('20/09/2026, 22:30:00')
  })
})

describe('formatHora', () => {
  it('renders HH:MM in Manaus even if the bank returns UTC', () => {
    expect(formatHora('2026-10-05T23:30:00+00:00')).toBe('19:30')
    expect(formatHora(null)).toBe('—')
  })
})

describe('formatBRLCompact', () => {
  it('abbreviates thousands', () => {
    expect(formatBRLCompact(12500)).toContain('mil')
    expect(formatBRLCompact(12500).startsWith('R$')).toBe(true)
  })

  it('handles zero and small values plainly', () => {
    expect(formatBRLCompact(0)).toBe('R$ 0')
    expect(formatBRLCompact(950)).toBe('R$ 950')
  })
})

describe('shortDayMonth', () => {
  it('formats ISO date as dd/mm', () => {
    expect(shortDayMonth('2026-09-05')).toBe('05/09')
  })
})
