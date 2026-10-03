'use client'

import { useState } from 'react'
import { cancelarPublico } from '../../actions'

export function CancelarForm({ id }: { id: string }) {
  const [telefone, setTelefone] = useState('')
  const [estado, setEstado] = useState<'idle' | 'ok' | 'erro'>('idle')
  const [msg, setMsg] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function enviar() {
    setEnviando(true)
    setEstado('idle')
    try {
      await cancelarPublico({ id, telefone })
      setEstado('ok')
    } catch (e: any) {
      setEstado('erro')
      setMsg(e?.message ?? 'Não consegui cancelar.')
    } finally {
      setEnviando(false)
    }
  }

  if (estado === 'ok') {
    return <p className="text-sm text-green-400">Agendamento cancelado. O horário voltou a ficar livre.</p>
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-left">
      <p className="text-white text-sm font-medium mb-1">Precisou desmarcar?</p>
      <p className="text-zinc-500 text-xs mb-3">Confirme seu WhatsApp para cancelar (até 2h antes).</p>
      <div className="flex gap-2">
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(65) 99999-0000"
          inputMode="tel"
          className="flex-1 min-w-0 rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-2.5 text-white text-sm outline-none focus:border-white/40"
        />
        <button
          type="button"
          disabled={enviando || !telefone.trim()}
          onClick={enviar}
          className="rounded-xl bg-prata text-black text-sm font-medium px-4 disabled:opacity-50 on-prata shrink-0"
        >
          {enviando ? '…' : 'Cancelar'}
        </button>
      </div>
      {estado === 'erro' && <p className="text-red-400 text-xs mt-2">{msg}</p>}
    </div>
  )
}
