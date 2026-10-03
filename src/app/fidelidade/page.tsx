import { Carne } from './Carne'

export default function FidelidadePage() {
  return (
    <div className="min-h-screen bg-black text-white px-4 pt-8 pb-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Fidelidade</h1>
      <p className="text-zinc-400 text-sm mb-6">A cada 10 cortes, 1 grátis. Digite seu WhatsApp.</p>
      <Carne />
    </div>
  )
}
