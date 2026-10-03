export function calcularCarne(
  contadores: { contador: number; fidelidade_a_cada: number }[],
  gratuitos: number,
): { total: number; atual: number; faltam: number; gratuitos: number; completo: boolean } {
  const total = contadores.filter((c) => c.fidelidade_a_cada > 0).reduce((s, c) => s + (c.contador || 0), 0)
  const atual = total % 10
  const completo = total > 0 && atual === 0
  return { total, atual, faltam: completo ? 0 : 10 - atual, gratuitos, completo }
}
