export function somenteVitrine(linhas: any[]): { id: string; nome: string; descricao: string | null; preco_venda: number }[] {
  return (linhas ?? [])
    .filter((p) => p.ativo && (p.purpose === 'revenda' || p.purpose === 'ambos'))
    .map((p) => ({ id: String(p.id), nome: String(p.nome), descricao: (p.descricao ?? null) as string | null, preco_venda: Number(p.preco_venda ?? 0) }))
}
