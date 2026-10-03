'use client'
import { useState } from 'react'
import { Selo } from '@/components/ui'
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
      if (r.ok) {
        const { ok: _descartado, ...saldo } = r
        setSaldo(saldo)
        return
      }
      setSaldo(null)
      setErro(r.erro === 'invalido' ? 'WhatsApp inválido (use DDD + número).' : 'Não encontrei cadastro para este número — faça um agendamento com nome, nascimento e Zap.')
    } catch {
      setSaldo(null)
      setErro('Não consegui buscar. Tente de novo.')
    } finally {
      setCarregando(false)
    }
  }
  const cortes = saldo ? (saldo.completo ? 10 : saldo.atual) : 0
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="carne-whatsapp" className="block text-xs text-zinc-400 mb-1.5">WhatsApp</label>
        <div className="flex gap-2">
          <input
            id="carne-whatsapp"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="(65) 99999-0000"
            inputMode="tel"
            className="flex-1 min-w-0 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/40 placeholder:text-zinc-400 text-base"
          />
          <button type="button" disabled={carregando || !tel.trim()} onClick={buscar} className="shrink-0 rounded-xl bg-prata text-black text-sm font-semibold px-4 disabled:opacity-40 on-prata">
            {carregando ? 'Buscando…' : 'Ver'}
          </button>
        </div>
      </div>
      <div aria-live="polite">
        {erro && <p className="text-red-400 text-sm">{erro}</p>}
        {saldo && (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="font-semibold">{saldo.nome} — {saldo.total} cortes</p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={cortes}
              aria-label="Cortes do carnê"
              className="h-2 w-full rounded bg-white/15 overflow-hidden my-3"
            >
              <div className="h-full rounded bg-prata transition-all" style={{ width: `${(cortes / 10) * 100}%` }} />
            </div>
            <div className="grid grid-cols-5 gap-2 justify-items-center my-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Selo key={i} cheio={i < saldo.atual || saldo.completo} />
              ))}
            </div>
            {saldo.gratuitos > 0
              ? <p className="text-prata text-sm font-semibold">Você tem {saldo.gratuitos} corte(s) grátis — fale no balcão.</p>
              : <p className="text-zinc-400 text-sm">{saldo.completo ? 'Carnê completo! Fale no balcão.' : `Faltam ${saldo.faltam} cortes para 1 grátis (${saldo.atual}/10).`}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
