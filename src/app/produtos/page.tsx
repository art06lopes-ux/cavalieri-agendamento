import { createAdminClient } from '@/lib/supabase/server'
import { somenteVitrine } from '@/lib/produtos'
import { Busca } from './Busca'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const admin = createAdminClient()
  const { data, error } = await (admin as any).from('products').select('id, nome, descricao, preco_venda, foto_url, purpose, ativo').eq('ativo', true).in('purpose', ['revenda', 'ambos']).order('nome')
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white px-4 pt-8 pb-10 max-w-md mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Produtos</h1>
        <p className="text-zinc-400 text-sm mb-6">Vitrine da loja — pagamento no balcão.</p>
        <p className="text-red-400 text-sm">Não consegui carregar os produtos. Tente de novo.</p>
      </div>
    )
  }
  const itens = somenteVitrine(data ?? [])
  return (
    <div className="min-h-screen bg-black text-white px-4 pt-8 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Produtos</h1>
      <p className="text-zinc-400 text-sm mb-6">Vitrine da loja — pagamento no balcão.</p>
      {!itens.length ? <p className="text-zinc-400 text-sm">Nenhum produto cadastrado ainda.</p> : (
        <Busca itens={itens} />
      )}
    </div>
  )
}
