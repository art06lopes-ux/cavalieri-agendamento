import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addMonthsISO,
  computeDateRange,
  dayEndTs,
  dayStartTs,
  eachDayISO,
  nextDayOfMonthISO,
  pctChange,
  previousPeriodRange,
  toLocalDateISO,
  todayISO,
  businessDayHour,
  businessMonthKey,
} from './dateRange'

describe('toLocalDateISO', () => {
  it('converts a UTC timestamp to the Manaus (UTC-4) calendar date', () => {
    // 2026-09-21T02:30:00Z is still 2026-09-20 at 22:30 in Manaus.
    expect(toLocalDateISO('2026-09-21T02:30:00Z')).toBe('2026-09-20')
    // 2026-09-21T04:30:00Z is 2026-09-21T00:30 in Manaus — day already flipped.
    expect(toLocalDateISO('2026-09-21T04:30:00Z')).toBe('2026-09-21')
  })
})

describe('dayStartTs / dayEndTs', () => {
  it('produce timestamptz bounds using the fixed -04:00 offset', () => {
    expect(dayStartTs('2026-09-20')).toBe('2026-09-20T00:00:00-04:00')
    expect(dayEndTs('2026-09-20')).toBe('2026-09-20T23:59:59.999-04:00')
  })
})

describe('addMonthsISO / nextDayOfMonthISO', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-20T18:00:00Z')) // 14:00 in Manaus
  })
  afterEach(() => vi.useRealTimers())

  it('adds months to a calendar date', () => {
    expect(addMonthsISO('2026-09-20', 1)).toBe('2026-10-20')
  })

  it('clamps to the last day when the target month is shorter', () => {
    expect(addMonthsISO('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonthsISO('2026-03-31', -1)).toBe('2026-02-28')
    expect(addMonthsISO('2024-01-31', 1)).toBe('2024-02-29') // leap year
    expect(addMonthsISO('2026-05-31', 1)).toBe('2026-06-30')
  })

  it('picks this month if the day has not passed yet, otherwise next month', () => {
    // "today" is 2026-09-20 in Manaus
    expect(nextDayOfMonthISO(25)).toBe('2026-09-25')
    expect(nextDayOfMonthISO(5)).toBe('2026-10-05')
  })
})

describe('computeDateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 2026-09-20T18:00:00Z = 2026-09-20 14:00 in Manaus
    vi.setSystemTime(new Date('2026-09-20T18:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('defaults to the last 14 days when no period is given', () => {
    const r = computeDateRange({})
    expect(r.period).toBe('14d')
    expect(r.startISO).toBe('2026-09-07')
    expect(r.endISO).toBe('2026-09-20')
  })

  it('handles 7d and 30d windows inclusive of today', () => {
    expect(computeDateRange({ period: '7d' }).startISO).toBe('2026-09-14')
    expect(computeDateRange({ period: '30d' }).startISO).toBe('2026-08-22')
  })

  it('handles this_month / last_month', () => {
    const thisMonth = computeDateRange({ period: 'this_month' })
    expect(thisMonth.startISO).toBe('2026-09-01')
    expect(thisMonth.endISO).toBe('2026-09-20')

    const lastMonth = computeDateRange({ period: 'last_month' })
    expect(lastMonth.startISO).toBe('2026-08-01')
    expect(lastMonth.endISO).toBe('2026-08-31')
  })

  it('handles an explicit month param', () => {
    const r = computeDateRange({ period: 'month', month: '2026-02' })
    expect(r.startISO).toBe('2026-02-01')
    expect(r.endISO).toBe('2026-02-28')
    expect(r.label).toBe('Mês de 02/2026')
  })
})

describe('eachDayISO', () => {
  it('lists every calendar day in the inclusive range', () => {
    const days = eachDayISO(new Date('2026-09-18T12:00:00Z'), new Date('2026-09-20T12:00:00Z'))
    expect(days).toEqual(['2026-09-18', '2026-09-19', '2026-09-20'])
  })
})

describe('previousPeriodRange', () => {
  it('returns an immediately preceding window of the same length', () => {
    const range = { start: new Date('2026-09-14T12:00:00Z'), end: new Date('2026-09-20T12:00:00Z') } // 7 days
    const prev = previousPeriodRange(range)
    expect(prev.startISO).toBe('2026-09-07')
    expect(prev.endISO).toBe('2026-09-13')
  })

  it('works for a single-day range', () => {
    const day = new Date('2026-09-20T12:00:00Z')
    const prev = previousPeriodRange({ start: day, end: day })
    expect(prev.startISO).toBe('2026-09-19')
    expect(prev.endISO).toBe('2026-09-19')
  })
})

describe('pctChange', () => {
  it('computes percentage change against a positive baseline', () => {
    expect(pctChange(150, 100)).toBe(50)
    expect(pctChange(50, 100)).toBe(-50)
  })

  it('treats "went from zero to something" as +100%, not division by zero', () => {
    expect(pctChange(80, 0)).toBe(100)
  })

  it('returns null when there is nothing to compare (both periods zero)', () => {
    expect(pctChange(0, 0)).toBeNull()
  })
})

describe('todayISO', () => {
  it('reflects the Manaus calendar date, not the UTC one', () => {
    vi.useFakeTimers()
    // 2026-09-21T01:00:00Z is still 2026-09-20 evening in Manaus.
    vi.setSystemTime(new Date('2026-09-21T01:00:00Z'))
    expect(todayISO()).toBe('2026-09-20')
    vi.useRealTimers()
  })
})

describe('businessDayHour', () => {
  it('buckets by Manaus wall time, not server TZ', () => {
    // Monday 13:00Z = Monday 09:00 in Manaus.
    expect(businessDayHour('2026-09-07T13:00:00Z')).toEqual({ weekdayMon0: 0, hour: 9 })
    // Sunday 23:30 Manaus stays Sunday 23.
    expect(businessDayHour('2026-09-07T03:30:00Z')).toEqual({ weekdayMon0: 6, hour: 23 })
  })
})

describe('businessMonthKey', () => {
  it('keys by Manaus calendar month', () => {
    // 2026-09-01T02:00:00Z is still August 31 in Manaus.
    expect(businessMonthKey('2026-09-01T02:00:00Z')).toBe('2026-7')
    expect(businessMonthKey('2026-09-01T05:00:00Z')).toBe('2026-8')
  })
})
