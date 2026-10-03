'use client'
import { useState } from 'react'
import { saldoFidelidade } from './actions'

export function Carne() {
  const [tel, setTel] = useState('')
  const [erro, setErro] = useState('')
  const [saldo, setSaldo] = useState<null | { nome: string; total: number; atual: number; faltam: number; gratuitos: number; completo: boolean }>(null)
  const [carregando, setCarregando] = useState(false)
  async function buscar() {
    setErro('')
    setCarregando(true)
    try {
      const r = await saldoFidelidade(tel)
      setSaldo(r)
    } catch (e: any) {
      setSaldo(null)
      setErro(e?.message === 'NAO_ENCONTRADO' ? 'Não encontrei cadastro para este número — faça um agendamento com nome, nascimento e Zap.' : (e?.message ?? 'Não consegui buscar. Tente de novo.'))
    } finally {
      setCarregando(false)
    }
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="(65) 99999-0000" inputMode="tel" className="flex-1 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/40 text-base" />
        <button type="button" disabled={carregando || !tel.trim()} onClick={buscar} className="rounded-xl bg-white text-black text-sm font-semibold px-4 disabled:opacity-40">Ver</button>
      </div>
      {erro && <p className="text-red-400 text-sm">{erro}</p>}
      {saldo && (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
          <p className="font-semibold">{saldo.nome} — {saldo.total} cortes</p>
          <div className="grid grid-cols-10 gap-1 my-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`h-6 rounded-full ${i < saldo.atual || saldo.completo ? 'bg-white' : 'bg-white/10'}`} />
            ))}
          </div>
          {saldo.gratuitos > 0
            ? <p className="text-white text-sm font-semibold">Você tem {saldo.gratuitos} corte(s) grátis — fale no balcão.</p>
            : <p className="text-zinc-400 text-sm">{saldo.completo ? 'Carnê completo! Fale no balcão.' : `Faltam ${saldo.faltam} cortes para 1 grátis (${saldo.atual}/10).`}</p>}
        </div>
      )}
    </div>
  )
}
