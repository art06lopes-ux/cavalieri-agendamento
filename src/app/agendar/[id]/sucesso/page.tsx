import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatBRL, formatHora } from '@/lib/format'
import { toLocalDateISO } from '@/lib/dateRange'
import { Card } from '@/components/ui'
import { CancelarForm } from './CancelarForm'

export default async function SucessoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: ag } = await (admin as any)
    .from('appointments')
    .select('id, inicio, status, services(nome, preco), staff(nome)')
    .eq('id', id)
    .maybeSingle()
  if (!ag || ag.status === 'cancelado') notFound()
  const dia = toLocalDateISO(ag.inicio)
  const hora = formatHora(ag.inicio)
  const [y, m, d] = dia.split('-').map(Number)
  const dataFmt = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
  const msg = encodeURIComponent(
    `Olá! Confirmei meu horário na Cavalieri: ${ag.services?.nome} com ${ag.staff?.nome}, ${dataFmt} às ${hora}.`,
  )

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/15 ring-1 ring-green-500/30 flex items-center justify-center mx-auto mb-4">
        <span className="text-green-400 text-3xl">✓</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Agendamento confirmado</h1>
      <p className="text-zinc-400 text-sm mb-6">Seu horário está reservado.</p>
      <Card className="p-4 space-y-2 text-sm text-left mb-6">
        <p className="flex justify-between gap-3">
          <span className="text-zinc-400">Serviço</span>
          <span className="text-white font-medium text-right">
            {ag.services?.nome} · {formatBRL(ag.services?.preco ?? 0)}
          </span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-zinc-400">Barbeiro</span>
          <span className="text-white font-medium">{ag.staff?.nome}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-zinc-400">Data</span>
          <span className="text-white font-medium capitalize">{dataFmt}</span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-zinc-400">Horário</span>
          <span className="text-white font-medium tabular-nums">{hora}</span>
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <a
          href={`/agendar/${id}/ics`}
          className="rounded-xl border border-white/20 text-white text-sm font-medium py-3 hover:border-white/40"
        >
          + Calendário
        </a>
        <a
          href={`https://wa.me/?text=${msg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-prata text-black text-sm font-semibold py-3 on-prata hover:bg-prata/90"
        >
          WhatsApp
        </a>
      </div>
      <CancelarForm id={id} />
    </div>
  )
}
