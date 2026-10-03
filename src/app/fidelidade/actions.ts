'use server'
import { createAdminClient } from '@/lib/supabase/server'
import { canonicalTel } from '@/lib/booking'
import { calcularCarne } from '@/lib/fidelidade'

export async function saldoFidelidade(telefone: string) {
  const tel = canonicalTel(telefone)
  if (tel.length < 10 || tel.length > 13) throw new Error('WhatsApp inválido (use DDD + número).')
  const admin = createAdminClient()
  const { data: cli } = await (admin as any).from('clients').select('id, nome').in('telefone', [tel, `55${tel}`]).limit(1)
  if (!cli?.length) throw new Error('NAO_ENCONTRADO')
  const clientId = cli[0].id as string
  const [{ data: contadores }, { data: cortesias }] = await Promise.all([
    (admin as any).from('client_loyalty_counters').select('contador, services!inner(fidelidade_a_cada)').eq('client_id', clientId),
    (admin as any).from('courtesy_redemptions').select('id').eq('client_id', clientId).eq('reason', 'fidelidade').is('sale_id', null),
  ])
  const norm = ((contadores ?? []) as any[]).map((c) => ({ contador: c.contador, fidelidade_a_cada: c.services?.fidelidade_a_cada ?? 0 }))
  const calc = calcularCarne(norm, (cortesias ?? []).length)
  return { nome: cli[0].nome as string, ...calc }
}
