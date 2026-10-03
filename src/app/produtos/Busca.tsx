'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatBRL } from '@/lib/format'

type Item = { id: string; nome: string; descricao: string | null; preco_venda: number }

export function Busca({ itens }: { itens: Item[] }) {
  const [q, setQ] = useState('')
  const termo = q.trim().toLowerCase()
  const filtrados = termo ? itens.filter((p) => p.nome.toLowerCase().includes(termo)) : itens
  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar produto..."
        aria-label="Buscar produto"
        className="w-full rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/40 text-base mb-4"
      />
      {!filtrados.length ? (
        <p className="text-zinc-500 text-sm">Nenhum produto encontrado.</p>
      ) : (
        <div className="space-y-3">
          {filtrados.map((p) => (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
              <p className="text-zinc-500 text-[11px] uppercase tracking-wide">Disponível na loja</p>
              <p className="font-semibold mt-0.5">{p.nome}</p>
              {!!p.descricao && <p className="text-zinc-500 text-xs mt-0.5">{p.descricao}</p>}
              <p className="text-white text-sm font-medium mt-2">{formatBRL(p.preco_venda)}</p>
              <Link href="/agendar" className="inline-block mt-2 text-xs text-zinc-400 underline hover:text-white">
                Perguntar no agendamento
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
