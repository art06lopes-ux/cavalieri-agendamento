import { describe, expect, it } from 'vitest'
import { validarNascimento, decidirUpsert } from './cliente'

describe('validarNascimento', () => {
  it('aceita data válida passada', () => {
    expect(validarNascimento('2000-05-10')).toEqual({ ok: true, iso: '2000-05-10' })
  })
  it('rejeita futura', () => {
    expect(validarNascimento('2099-01-01').ok).toBe(false)
  })
  it('rejeita anterior a 1900', () => {
    expect(validarNascimento('1899-12-31').ok).toBe(false)
  })
  it('rejeita formato inválido', () => {
    expect(validarNascimento('10/05/2000').ok).toBe(false)
  })
})

describe('decidirUpsert', () => {
  it('insert quando não existe', () => {
    expect(decidirUpsert(null, { nome: 'Ana', data_nascimento: '2000-01-01' }).acao).toBe('insert')
  })
  it('update quando falta nascimento', () => {
    const r = decidirUpsert({ nome: 'Ana', data_nascimento: null }, { nome: 'Ana', data_nascimento: '2000-01-01' })
    expect(r.acao).toBe('update')
    expect(r.patch.data_nascimento).toBe('2000-01-01')
  })
  it('nada quando igual', () => {
    const r = decidirUpsert({ nome: 'Ana', data_nascimento: '2000-01-01' }, { nome: 'Ana', data_nascimento: '2000-01-01' })
    expect(r.acao).toBe('nada')
  })
})
