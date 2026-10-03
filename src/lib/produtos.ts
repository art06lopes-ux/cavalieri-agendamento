const STOPWORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas', 'para', 'com', 'sem', 'sob', 'por', 'a', 'o', 'as', 'os'])

export function iniciaisProduto(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (!partes.length) return '?'
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
  // Ignora conectivos (ex. "Gel de Cabelo" -> GC, não GD)
  const relevantes = partes.filter((p) => !STOPWORDS.has(p.toLowerCase()))
  const base = relevantes.length >= 2 ? relevantes : partes
  if (base.length === 1) return base[0].charAt(0).toUpperCase()
  return (base[0].charAt(0) + base[1].charAt(0)).toUpperCase()
}

export function somenteVitrine(linhas: any[]): { id: string; nome: string; descricao: string | null; preco_venda: number; foto_url: string | null }[] {
  return (linhas ?? [])
    .filter((p) => p.ativo && (p.purpose === 'revenda' || p.purpose === 'ambos'))
    .map((p) => ({ id: String(p.id), nome: String(p.nome), descricao: (p.descricao ?? null) as string | null, preco_venda: Number(p.preco_venda ?? 0), foto_url: (p.foto_url ? String(p.foto_url) : null) as string | null }))
}
