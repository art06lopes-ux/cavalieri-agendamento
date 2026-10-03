import { describe, expect, it } from 'vitest'
import { somenteVitrine } from './produtos'

describe('somenteVitrine', () => {
  it('remove uso_interno e inativos, nunca vaza preco_compra', () => {
    const out = somenteVitrine([
      { id: '1', nome: 'Pomada', descricao: 'x', preco_venda: 40, preco_compra: 10, purpose: 'revenda', ativo: true },
      { id: '2', nome: 'Uso loja', descricao: null, preco_venda: 0, preco_compra: 5, purpose: 'uso_interno', ativo: true },
      { id: '3', nome: 'Inativo', descricao: null, preco_venda: 20, preco_compra: 5, purpose: 'revenda', ativo: false },
    ])
    expect(out.map((p) => p.id)).toEqual(['1'])
    expect(out[0]).not.toHaveProperty('preco_compra')
  })
  it('aceita ambos', () => {
    const out = somenteVitrine([
      { id: '9', nome: 'Kit', descricao: null, preco_venda: 99, purpose: 'ambos', ativo: true },
    ])
    expect(out).toHaveLength(1)
  })
})
