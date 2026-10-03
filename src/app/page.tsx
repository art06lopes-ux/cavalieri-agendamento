import Image from "next/image";
import Link from "next/link";
import { BotaoPrimario, Eyebrow, Card } from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative h-[62vh] min-h-[420px]">
        <Image src="/fachada-noite.jpg" alt="Fachada da Cavalieri Barbearia à noite" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-6 max-w-md mx-auto">
          <Eyebrow>BARBEARIA · ESTILO · PRECISÃO</Eyebrow>
          <h1 className="text-4xl font-bold tracking-tight mt-2">Corte seu horário<br />na Cavalieri</h1>
          <p className="text-zinc-400 text-sm mt-2 mb-5">Serviço, barbeiro e horário em menos de 1 minuto. Sem cadastro.</p>
          <BotaoPrimario href="/agendar">Agendar agora</BotaoPrimario>
        </div>
      </section>
      <div className="px-6 py-6 max-w-md mx-auto space-y-3 pb-28">
        <Card className="p-4 flex items-center justify-between">
          <div><p className="font-semibold">Fidelidade</p><p className="text-zinc-500 text-xs">A cada 10 cortes, 1 grátis</p></div>
          <Link href="/fidelidade" className="text-prata text-sm font-semibold">Ver meu carnê →</Link>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div><p className="font-semibold">Produtos</p><p className="text-zinc-500 text-xs">O que tem na loja</p></div>
          <Link href="/produtos" className="text-prata text-sm font-semibold">Ver vitrine →</Link>
        </Card>
        <p className="text-zinc-400 text-xs text-center pt-2">Seg–Sáb · 09:00–20:00</p>
      </div>
    </div>
  )
}
