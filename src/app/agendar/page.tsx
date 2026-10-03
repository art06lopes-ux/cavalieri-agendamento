import { createAdminClient } from '@/lib/supabase/server'
import { Wizard } from './Wizard'

export const dynamic = 'force-dynamic'

export default async function AgendarPage() {
  const admin = createAdminClient()
  const [{ data: services }, { data: staff }] = await Promise.all([
    (admin as any).from('services').select('id, nome, preco, duracao_minutos').eq('ativo', true).order('nome'),
    (admin as any).from('staff').select('id, nome').eq('ativo', true).eq('role', 'barbeiro').order('nome'),
  ])
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-1">Corte seu horário</h1>
      <p className="text-zinc-500 text-sm mb-6">Leva menos de 1 minuto, sem cadastro.</p>
      {!((services ?? []).length && (staff ?? []).length) ? (
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-center">
          <p className="text-white font-medium mb-1">Agenda indisponível no momento</p>
          <p className="text-zinc-500 text-xs">Fale com a barbearia pelo WhatsApp para reservar.</p>
        </div>
      ) : (
        <Wizard servicos={services ?? []} barbeiros={staff ?? []} />
      )}
    </div>
  )
}
