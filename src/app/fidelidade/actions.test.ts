import { beforeEach, describe, expect, it, vi } from 'vitest'

type Resposta = { data: unknown; error: unknown }

const mock = vi.hoisted(() => {
  const respostas: Record<string, Resposta> = {}
  function definir(novo: Record<string, Resposta>) {
    for (const k of Object.keys(respostas)) delete respostas[k]
    Object.assign(respostas, novo)
  }
  function builder(tabela: string) {
    const responder = () => Promise.resolve(respostas[tabela] ?? { data: [], error: null })
    const b: Record<string, unknown> = {
      select: () => b,
      in: () => b,
      eq: () => b,
      is: () => b,
      limit: () => responder(),
      then: (onOk: (v: Resposta) => unknown, onErr: (e: unknown) => unknown) => responder().then(onOk, onErr),
    }
    return b
  }
  return { definir, builder }
})

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({ from: (tabela: string) => mock.builder(tabela) }),
}))

const { saldoFidelidade } = await import('./actions')

beforeEach(() => {
  mock.definir({})
})

describe('saldoFidelidade', () => {
  it('telefone inválido não consulta o banco', async () => {
    const r = await saldoFidelidade('123')
    expect(r).toEqual({ ok: false, erro: 'invalido' })
  })

  it('sem cadastro devolve nao_encontrado', async () => {
    mock.definir({ clients: { data: [], error: null } })
    const r = await saldoFidelidade('(65) 99999-0000')
    expect(r).toEqual({ ok: false, erro: 'nao_encontrado' })
  })

  it('cliente com contadores devolve o saldo', async () => {
    mock.definir({
      clients: { data: [{ id: 'c1', nome: 'João' }], error: null },
      client_loyalty_counters: { data: [{ contador: 7, services: { fidelidade_a_cada: 10 } }], error: null },
      courtesy_redemptions: { data: [], error: null },
    })
    const r = await saldoFidelidade('65999990000')
    expect(r).toEqual({ ok: true, nome: 'João', total: 7, atual: 7, faltam: 3, gratuitos: 0, completo: false })
  })

  it('cortesia usada fecha o ciclo do carnê', async () => {
    mock.definir({
      clients: { data: [{ id: 'c1', nome: 'João' }], error: null },
      client_loyalty_counters: { data: [{ contador: 10, services: { fidelidade_a_cada: 10 } }], error: null },
      courtesy_redemptions: { data: [{ id: 'r1' }], error: null },
    })
    const r = await saldoFidelidade('65999990000')
    expect(r).toEqual({ ok: true, nome: 'João', total: 10, atual: 0, faltam: 0, gratuitos: 1, completo: true })
  })

  it('erro de infra na busca do cliente lança em vez de nao_encontrado', async () => {
    const falha = { message: 'conexão perdida' }
    mock.definir({ clients: { data: null, error: falha } })
    await expect(saldoFidelidade('65999990000')).rejects.toBe(falha)
  })

  it('erro de infra nos contadores lança', async () => {
    const falha = { message: 'timeout' }
    mock.definir({
      clients: { data: [{ id: 'c1', nome: 'João' }], error: null },
      client_loyalty_counters: { data: null, error: falha },
      courtesy_redemptions: { data: [], error: null },
    })
    await expect(saldoFidelidade('65999990000')).rejects.toBe(falha)
  })
})