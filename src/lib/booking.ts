export type Jornada = { inicio: string; fim: string }
export type Ocupado = { inicio: string; fim: string }

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Slots livres de um dia no formato `${dia}T${HH}:${MM}:00-04:00` (Manaus).
// Só entra início cujo [ini, ini+duracao] cabe na jornada, não sobrepõe
// ocupação e não está no passado (hoje: a partir de agora + 15min).
export function slotsDoDia(
  jornada: Jornada,
  ocupados: Ocupado[],
  duracaoMin: number | null,
  opts: { dia: string; gradeMin?: number; agoraIso?: string },
): string[] {
  const dur = duracaoMin && duracaoMin > 0 ? duracaoMin : 30
  const grade = opts.gradeMin ?? 30
  const ultimoInicio = toMin(jornada.fim) - dur
  const occ = ocupados.map((o) => ({ ini: Date.parse(o.inicio), fim: Date.parse(o.fim) }))
  const agora = opts.agoraIso ? Date.parse(opts.agoraIso) + 15 * 60000 : 0
  const out: string[] = []
  for (let t = toMin(jornada.inicio); t <= ultimoInicio; t += grade) {
    const hh = String(Math.floor(t / 60)).padStart(2, '0')
    const mm = String(t % 60).padStart(2, '0')
    const start = Date.parse(`${opts.dia}T${hh}:${mm}:00-04:00`)
    const end = start + dur * 60000
    if (start < agora) continue
    if (occ.some((o) => start < o.fim && end > o.ini)) continue
    out.push(`${opts.dia}T${hh}:${mm}:00-04:00`)
  }
  return out
}

// Para "qualquer barbeiro": mapa staffId → slots livres do dia; escolhe quem
// tem menos horários (balanceia a agenda). Null se ninguém livre.
export function escolherBarbeiroLivre(mapa: Record<string, string[]>): string | null {
  const entries = Object.entries(mapa).filter(([, slots]) => slots.length > 0)
  if (!entries.length) return null
  entries.sort((a, b) => a[1].length - b[1].length)
  return entries[0][0]
}

// Restringe o mapa aos barbeiros que têm o horário exato escolhido.
export function barbeirosComSlot(mapa: Record<string, string[]>, inicioIso: string): Record<string, string[]> {
  return Object.fromEntries(Object.entries(mapa).filter(([, slots]) => slots.includes(inicioIso)))
}

// Soma minutos a um horário e devolve parede de Manaus (`-04:00`).
export function somarMinutos(inicioIso: string, min: number): string {
  const t = Date.parse(inicioIso) + min * 60000
  const d = new Date(t)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:00-04:00`
}

// Telefone canônico: só dígitos, sem DDI 55 na frente.
export function canonicalTel(t: string): string {
  const d = t.replace(/\D/g, '')
  return d.length > 11 && d.startsWith('55') ? d.slice(2) : d
}
