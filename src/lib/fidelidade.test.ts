import { describe, expect, it } from 'vitest'
import { calcularCarne } from './fidelidade'

describe('calcularCarne', () => {
  it('soma só quem participa e calcula resto de 10', () => {
    const r = calcularCarne([{ contador: 7, fidelidade_a_cada: 10 }, { contador: 5, fidelidade_a_cada: 0 }], 0)
    expect(r.total).toBe(7)
    expect(r.atual).toBe(7)
    expect(r.faltam).toBe(3)
  })
  it('10 cheios marca completo', () => {
    const r = calcularCarne([{ contador: 10, fidelidade_a_cada: 10 }], 1)
    expect(r.atual).toBe(0)
    expect(r.completo).toBe(true)
    expect(r.gratuitos).toBe(1)
  })
  it('23 mostra 3/10', () => {
    const r = calcularCarne([{ contador: 23, fidelidade_a_cada: 10 }], 0)
    expect(r.total).toBe(23)
    expect(r.atual).toBe(3)
    expect(r.faltam).toBe(7)
  })
  it('ignora fidelidade 0', () => {
    const r = calcularCarne([{ contador: 99, fidelidade_a_cada: 0 }], 0)
    expect(r.total).toBe(0)
  })
})
