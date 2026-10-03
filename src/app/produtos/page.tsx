import { createAdminClient } from '@/lib/supabase/server'
import { formatBRL } from '@/lib/format'
import { somenteVitrine } from '@/lib/produtos'

export const dynamic = 'force-dynamic'

export default async function ProdutosPage() {
  const admin = createAdminClient()
  const { data } = await (admin as any).from('products').select('id, nome, descricao, preco_venda, purpose, ativo').eq('ativo', true).in('purpose', ['revenda', 'ambos']).order('nome')
  const itens = somenteVitrine(data ?? [])
  return (
    <div className="min-h-screen bg-black text-white px-4 pt-8 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Produtos</h1>
      <p className="text-zinc-500 text-sm mb-6">Vitrine da loja — pagamento no balcão.</p>
      {!itens.length ? <p className="text-zinc-500 text-sm">Nenhum produto cadastrado ainda.</p> : (
        <div className="space-y-3">{itens.map((p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="font-semibold">{p.nome}</p>
            {!!p.descricao && <p className="text-zinc-500 text-xs mt-0.5">{p.descricao}</p>}
            <p className="text-white text-sm font-medium mt-2">{formatBRL(p.preco_venda)}</p>
          </div>))}</div>
      )}
    </div>
  )
}
