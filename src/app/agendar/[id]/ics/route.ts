import { createAdminClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  const { data: ag } = await (admin as any)
    .from('appointments')
    .select('inicio, fim, status, services(nome), staff(nome)')
    .eq('id', id)
    .maybeSingle()
  if (!ag || ag.status === 'cancelado') return new Response('Não encontrado.', { status: 404 })
  const stamp = (v: string) => String(v).replace(/[-:]/g, '').replace(/([+-]\d{2}):?(\d{2})$/, '$1$2')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${id}@cavalieri`,
    `DTSTART:${stamp(ag.inicio)}`,
    `DTEND:${stamp(ag.fim)}`,
    `SUMMARY:Cavalieri Barbearia — ${ag.services?.nome ?? 'Horário'} com ${ag.staff?.nome ?? ''}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return new Response(ics, {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="agendamento.ics"' },
  })
}
