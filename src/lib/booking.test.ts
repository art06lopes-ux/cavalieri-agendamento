import { describe, expect, it } from 'vitest'
import { slotsDoDia, escolherBarbeiroLivre, barbeirosComSlot, somarMinutos, canonicalTel } from './booking'

describe('slotsDoDia', () => {
  it('pula janela ocupada 15:00-16:00 para servico de 60min', () => {
    const out = slotsDoDia(
      { inicio: '09:00', fim: '20:00' },
      [{ inicio: '2026-10-05T15:00:00-04:00', fim: '2026-10-05T16:00:00-04:00' }],
      60,
      { dia: '2026-10-05', gradeMin: 30, agoraIso: '2026-10-05T08:00:00-04:00' },
    )
    expect(out).toContain('2026-10-05T14:00:00-04:00')
    expect(out).not.toContain('2026-10-05T15:00:00-04:00')
    expect(out).not.toContain('2026-10-05T15:30:00-04:00')
    expect(out).toContain('2026-10-05T16:00:00-04:00')
  })

  it('exclui passado (com buffer de 15min) e usa fallback 30min sem duracao', () => {
    const out = slotsDoDia({ inicio: '09:00', fim: '12:00' }, [], null, {
      dia: '2026-10-05', gradeMin: 30, agoraIso: '2026-10-05T10:20:00-04:00',
    })
    expect(out[0]).toBe('2026-10-05T11:00:00-04:00')
  })

  it('nao oferece inicio que termina depois do fim da jornada', () => {
    const out = slotsDoDia({ inicio: '09:00', fim: '10:00' }, [], 60, {
      dia: '2026-10-05', gradeMin: 30, agoraIso: '2026-10-05T08:00:00-04:00',
    })
    expect(out).toEqual(['2026-10-05T09:00:00-04:00'])
  })
})

describe('escolherBarbeiroLivre', () => {
  it('escolhe quem tem menos horarios (balanceia)', () => {
    expect(escolherBarbeiroLivre({ a: ['1', '2'], b: ['1'] })).toBe('b')
  })

  it('retorna null sem ninguem livre', () => {
    expect(escolherBarbeiroLivre({ a: [] })).toBeNull()
  })
})

describe('barbeirosComSlot', () => {
  it('filtra so quem tem o horario escolhido', () => {
    const mapa = { a: ['2026-10-05T14:00:00-04:00'], b: ['2026-10-05T15:00:00-04:00'] }
    expect(barbeirosComSlot(mapa, '2026-10-05T14:00:00-04:00')).toEqual({
      a: ['2026-10-05T14:00:00-04:00'],
    })
  })
})

describe('somarMinutos', () => {
  it('soma duracao mantendo parede de Manaus', () => {
    expect(somarMinutos('2026-10-05T14:00:00-04:00', 60)).toBe('2026-10-05T15:00:00-04:00')
  })
})

describe('canonicalTel', () => {
  it('remove DDI 55 e mascara', () => {
    expect(canonicalTel('(65) 99999-0000')).toBe('65999990000')
    expect(canonicalTel('5565999990000')).toBe('65999990000')
  })
})
