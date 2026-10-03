// Todas as datas "de negocio" sao calculadas no fuso da barbearia, nao no do servidor (UTC).
export const TIMEZONE = 'America/Manaus'
export const TZ_OFFSET = '-04:00' // Manaus nao tem horario de verao

export const PERIOD_LABELS: Record<string, string> = {
  '7d': 'Últimos 7 dias',
  '14d': 'Últimos 14 dias',
  '30d': 'Últimos 30 dias',
  this_month: 'Este mês',
  last_month: 'Mês passado',
  month: 'Mês selecionado',
}

// Data (YYYY-MM-DD) de um instante, vista do fuso da barbearia.
export function toLocalDateISO(value: Date | string): string {
  const d = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

// Dia da semana (0 = segunda) e hora (0-23) de um instante, no fuso da barbearia.
export function businessDayHour(iso: string): { weekdayMon0: number; hour: number } {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return { weekdayMon0: weekdays.indexOf(get('weekday')), hour: Number(get('hour')) % 24 }
}

// Chave ano-mes ("2026-8") de um instante, no fuso da barbearia.
export function businessMonthKey(iso: string): string {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${Number(get('year'))}-${Number(get('month')) - 1}`
}

// Representa um dia-calendario como Date em UTC-meio-dia, para aritmetica sem surpresa de fuso.
function dayFromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12))
}
function isoFromDay(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + n)
  return r
}

// Intervalo imediatamente anterior, com a mesma duração — usado para comparar "vs período anterior".
export function previousPeriodRange(range: { start: Date; end: Date }) {
  const days = Math.round((range.end.getTime() - range.start.getTime()) / 86400000) + 1
  const prevEnd = addDays(range.start, -1)
  const prevStart = addDays(prevEnd, -(days - 1))
  const startISO = isoFromDay(prevStart)
  const endISO = isoFromDay(prevEnd)
  return { startISO, endISO, startTs: dayStartTs(startISO), endTs: dayEndTs(endISO) }
}

export function pctChange(current: number, previous: number): number | null {
  if (previous > 0) return ((current - previous) / previous) * 100
  if (current > 0) return 100
  return null
}

export function todayISO(): string {
  return toLocalDateISO(new Date())
}

// Soma meses a um dia-calendario (YYYY-MM-DD) sem depender do fuso do servidor.
// Trava no ultimo dia do mes de destino (31/jan + 1 mes = 28/fev, nao 03/mar).
export function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const targetMonth = m - 1 + months
  const ty = y + Math.floor(targetMonth / 12)
  const tm = ((targetMonth % 12) + 12) % 12
  const lastDay = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate()
  const td = Math.min(d, lastDay)
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(td).padStart(2, '0')}`
}

// Proximo dia N (1-28) a partir de hoje, no fuso da barbearia.
export function nextDayOfMonthISO(dia: number): string {
  const hoje = todayISO()
  const [y, m] = hoje.split('-').map(Number)
  let candidate = `${y}-${String(m).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  if (candidate <= hoje) candidate = addMonthsISO(candidate, 1)
  return candidate
}

// Limites para filtrar colunas timestamptz no banco, no fuso da barbearia.
export function dayStartTs(iso: string) {
  return `${iso}T00:00:00${TZ_OFFSET}`
}
export function dayEndTs(iso: string) {
  return `${iso}T23:59:59.999${TZ_OFFSET}`
}

export function computeDateRange(params: { period?: string; month?: string }) {
  const period = params.period ?? '14d'
  const hoje = dayFromISO(todayISO())
  const y = hoje.getUTCFullYear()
  const m = hoje.getUTCMonth()
  let start: Date
  let end: Date = hoje

  if (period === '7d') {
    start = addDays(hoje, -6)
  } else if (period === '30d') {
    start = addDays(hoje, -29)
  } else if (period === 'this_month') {
    start = new Date(Date.UTC(y, m, 1, 12))
  } else if (period === 'last_month') {
    start = new Date(Date.UTC(y, m - 1, 1, 12))
    end = new Date(Date.UTC(y, m, 0, 12))
  } else if (period === 'month' && params.month) {
    const [py, pm] = params.month.split('-').map(Number)
    start = new Date(Date.UTC(py, pm - 1, 1, 12))
    end = new Date(Date.UTC(py, pm, 0, 12))
  } else {
    start = addDays(hoje, -13)
  }

  const startISO = isoFromDay(start)
  const endISO = isoFromDay(end)

  return {
    period,
    start,
    end,
    startISO,
    endISO,
    startTs: dayStartTs(startISO),
    endTs: dayEndTs(endISO),
    label:
      period === 'month' && params.month
        ? `Mês de ${params.month.slice(5, 7)}/${params.month.slice(0, 4)}`
        : (PERIOD_LABELS[period] ?? PERIOD_LABELS['14d']),
  }
}

export function eachDayISO(start: Date, end: Date) {
  const days: string[] = []
  let cur = new Date(start)
  while (cur <= end) {
    days.push(isoFromDay(cur))
    cur = addDays(cur, 1)
  }
  return days
}
