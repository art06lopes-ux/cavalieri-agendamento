import { describe, expect, it } from 'vitest'
import { somenteVitrine, iniciaisProduto } from './produtos'

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
  it('mantém foto_url e normaliza vazio para null', () => {
    const out = somenteVitrine([
      { id: '1', nome: 'Pomada', descricao: null, preco_venda: 40, foto_url: 'https://x/f.jpg', purpose: 'revenda', ativo: true },
      { id: '2', nome: 'Gel', descricao: null, preco_venda: 20, foto_url: '', purpose: 'revenda', ativo: true },
    ])
    expect(out[0].foto_url).toBe('https://x/f.jpg')
    expect(out[1].foto_url).toBeNull()
  })
  it('iniciais de duas palavras ignorando conectivo', () => {
    expect(iniciaisProduto('Gel de Cabelo')).toBe('GC')
  })
})
