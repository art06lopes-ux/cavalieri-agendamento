'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { slotsDoDia, escolherBarbeiroLivre, barbeirosComSlot, somarMinutos, canonicalTel } from '@/lib/booking'
import { validarNascimento, decidirUpsert } from '@/lib/cliente'
import { todayISO } from '@/lib/dateRange'

const normTel = canonicalTel
const DIA_RE = /^\d{4}-\d{2}-\d{2}$/
const ATIVOS = ['agendado', 'confirmado', 'em_atendimento', 'concluido']

function weekdayManaus(dia: string) {
  const [y, m, d] = dia.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

function limiteDia(dias: number) {
  const [y, m, d] = todayISO().split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + dias))
  return t.toISOString().slice(0, 10)
}

async function baseDisponibilidade(dia: string, serviceId: string) {
  if (!DIA_RE.test(dia)) throw new Error('Data inválida.')
  const hoje = todayISO()
  if (dia < hoje || dia > limiteDia(7)) throw new Error('Data fora da janela de agendamento (7 dias).')
  const admin = createAdminClient()
  const [{ data: service }, { data: staff }, { data: schedules }, { data: appts }] = await Promise.all([
    (admin as any).from('services').select('id, nome, preco, duracao_minutos').eq('id', serviceId).eq('ativo', true).maybeSingle(),
    (admin as any).from('staff').select('id, nome').eq('ativo', true).eq('role', 'barbeiro').order('nome'),
    (admin as any).from('staff_schedules').select('staff_id, dia_semana, inicio, fim').eq('ativo', true),
    (admin as any)
      .from('appointments')
      .select('staff_id, inicio, fim')
      .in('status', ATIVOS)
      .gte('inicio', `${dia}T00:00:00-04:00`)
      .lt('inicio', `${dia}T23:59:59-04:00`),
  ])
  if (!service) throw new Error('Serviço indisponível.')
  const duracao = Number(service.duracao_minutos ?? 0) > 0 ? Number(service.duracao_minutos) : 30
  const dow = weekdayManaus(dia)
  const agoraIso = dia === hoje ? new Date().toISOString() : undefined
  const porBarbeiro: Record<string, string[]> = {}
  for (const b of (staff ?? []) as any[]) {
    const j = ((schedules ?? []) as any[]).find((s) => s.staff_id === b.id && s.dia_semana === dow)
    if (!j) continue
    const occ = ((appts ?? []) as any[])
      .filter((a) => a.staff_id === b.id)
      .map((a) => ({ inicio: a.inicio, fim: a.fim }))
    porBarbeiro[b.id] = slotsDoDia(
      { inicio: String(j.inicio).slice(0, 5), fim: String(j.fim).slice(0, 5) },
      occ,
      duracao,
      { dia, gradeMin: 30, agoraIso },
    )
  }
  return { service, staff: (staff ?? []) as any[], porBarbeiro, duracao }
}

export async function slots(input: { dia: string; serviceId: string }) {
  const { porBarbeiro, duracao } = await baseDisponibilidade(input.dia, input.serviceId)
  return { porBarbeiro, duracao }
}

export async function reservar(input: {
  serviceId: string
  staffId: string | 'qualquer'
  inicioIso: string
  nome: string
  telefone: string
  dataNascimento: string
}) {
  const tel = normTel(input.telefone)
  if (input.nome.trim().length < 2) throw new Error('Informe seu nome.')
  if (tel.length < 10 || tel.length > 13) throw new Error('WhatsApp inválido (use DDD + número).')
  const nasc = validarNascimento(input.dataNascimento)
  if (!nasc.ok) throw new Error(nasc.erro)
  const dia = input.inicioIso.slice(0, 10)
  const { service, porBarbeiro, duracao } = await baseDisponibilidade(dia, input.serviceId)
  void service
  let staffId = input.staffId
  if (staffId === 'qualquer') {
    const candidatos = barbeirosComSlot(porBarbeiro, input.inicioIso)
    const livre = escolherBarbeiroLivre(candidatos)
    if (!livre) throw new Error('HORARIO_OCUPADO')
    staffId = livre
  }
  const livres = porBarbeiro[staffId] ?? []
  if (!livres.includes(input.inicioIso)) throw new Error('HORARIO_OCUPADO')
  const fimIso = somarMinutos(input.inicioIso, duracao)

  const admin = createAdminClient()
  let clientId: string | null = null
  const { data: existentes } = await (admin as any).from('clients').select('id, nome, data_nascimento').in('telefone', [tel, `55${tel}`]).limit(1)
  const nomeLimpo = input.nome.trim()
  if (existentes?.length) {
    const existente = existentes[0] as { id: string; nome: string; data_nascimento: string | null }
    clientId = existente.id
    const decisao = decidirUpsert(
      { nome: existente.nome, data_nascimento: existente.data_nascimento },
      { nome: nomeLimpo, data_nascimento: nasc.iso },
    )
    if (decisao.acao === 'update') {
      const { error: updErr } = await (admin as any).from('clients').update(decisao.patch).eq('id', existente.id)
      if (updErr) throw new Error(updErr.message)
    }
  } else {
    const { data: novo, error: cliErr } = await (admin as any)
      .from('clients')
      .insert({ nome: nomeLimpo, telefone: tel, data_nascimento: nasc.iso, consentimento_lgpd: true, consentimento_em: new Date().toISOString() })
      .select('id')
      .single()
    if (cliErr) throw new Error(cliErr.message)
    clientId = novo.id
  }
  const { data: ag, error } = await (admin as any)
    .from('appointments')
    .insert({
      client_id: clientId,
      service_id: input.serviceId,
      staff_id: staffId,
      inicio: input.inicioIso,
      fim: fimIso,
      status: 'agendado',
      origem: 'publico',
      nome_contato: input.nome.trim(),
      telefone_contato: tel,
    })
    .select('id')
    .single()
  if (error) {
    if ((error as any).code === '23P01') throw new Error('HORARIO_OCUPADO')
    throw new Error(error.message)
  }
  return { id: ag.id as string }
}

export async function cancelarPublico(input: { id: string; telefone: string }) {
  const tel = normTel(input.telefone)
  const admin = createAdminClient()
  const { data: ag } = await (admin as any).from('appointments').select('*').eq('id', input.id).maybeSingle()
  if (!ag || normTel(ag.telefone_contato) !== tel) throw new Error('Agendamento não encontrado.')
  if (['cancelado', 'concluido', 'faltou'].includes(ag.status)) throw new Error('Este agendamento já foi encerrado.')
  if (Date.parse(ag.inicio) - Date.now() < 2 * 3600000) throw new Error('Só é possível cancelar até 2h antes do horário.')
  const { error } = await (admin as any)
    .from('appointments')
    .update({ status: 'cancelado', cancelado_em: new Date().toISOString(), atualizado_em: new Date().toISOString() })
    .eq('id', input.id)
  if (error) throw new Error(error.message)
  return { ok: true }
}
