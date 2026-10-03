import { TIMEZONE } from './dateRange'

export function formatBRL(value: number | string | null | undefined) {
  const n = Number(value ?? 0)
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value + (value.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR')
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', { timeZone: TIMEZONE })
}

export function formatHora(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('pt-BR', { timeZone: TIMEZONE, hour: '2-digit', minute: '2-digit' })
}

export function formatBRLCompact(value: number | null | undefined) {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return '—'
  if (Math.abs(n) < 1000) return `R$ ${Math.round(n)}`
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

export function shortDayMonth(iso: string) {
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
