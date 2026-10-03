const NASC_RE = /^\d{4}-\d{2}-\d{2}$/

export function validarNascimento(iso: string): { ok: true; iso: string } | { ok: false; erro: string } {
  if (!NASC_RE.test(iso)) return { ok: false, erro: 'Data de nascimento inválida.' }
  if (iso < '1900-01-01') return { ok: false, erro: 'Data de nascimento inválida.' }
  const hoje = new Date().toISOString().slice(0, 10)
  if (iso > hoje) return { ok: false, erro: 'Data de nascimento não pode ser futura.' }
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) {
    return { ok: false, erro: 'Data de nascimento inválida.' }
  }
  return { ok: true, iso }
}

export function decidirUpsert(
  existente: { nome: string; data_nascimento: string | null } | null,
  entrada: { nome: string; data_nascimento: string },
): { acao: 'insert' | 'update' | 'nada'; patch: Record<string, string> } {
  if (!existente) return { acao: 'insert', patch: { nome: entrada.nome, data_nascimento: entrada.data_nascimento } }
  const patch: Record<string, string> = {}
  if (existente.nome !== entrada.nome) patch.nome = entrada.nome
  if ((existente.data_nascimento ?? '') !== entrada.data_nascimento) patch.data_nascimento = entrada.data_nascimento
  if (!Object.keys(patch).length) return { acao: 'nada', patch }
  return { acao: 'update', patch }
}
