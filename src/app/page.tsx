import Image from "next/image";
import Link from "next/link";
import { BotaoPrimario, Eyebrow, Card } from "@/components/ui";
import { LogoMark } from "@/components/Logo";

function Conteudo() {
  return (
    <>
      <LogoMark size={64} className="mb-5" />
      <Eyebrow>BARBEARIA · ESTILO · PRECISÃO</Eyebrow>
      <h1 className="text-4xl font-bold tracking-tight mt-2">Corte seu horário<br />na Cavalieri</h1>
      <p className="text-zinc-400 text-sm mt-2 mb-5">Serviço, barbeiro e horário em menos de 1 minuto.</p>
      <div className="sm:max-w-xs">
        <BotaoPrimario href="/agendar">Agendar agora</BotaoPrimario>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* mobile: foto na proporção real (3/4) com o conteúdo sobreposto;
          desktop: duas colunas, foto à esquerda e texto à direita */}
      <section className="sm:grid sm:grid-cols-2 sm:items-center sm:gap-10 sm:px-10 sm:py-12">
        <div className="relative w-full aspect-[3/4] sm:aspect-auto sm:h-[72vh]">
          <Image
            src="/fachada-noite.jpg"
            alt="Fachada da Cavalieri Barbearia à noite"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 45vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/25" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:hidden">
            <Conteudo />
          </div>
        </div>
        <div className="hidden sm:block">
          <Conteudo />
        </div>
      </section>

      <div className="sm:grid sm:grid-cols-2 sm:gap-10 sm:px-10">
        <div aria-hidden className="hidden sm:block" />
        <div className="space-y-3 px-6 py-6 sm:p-0 sm:pb-28 sm:pt-0">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Fidelidade</p>
              <p className="text-zinc-400 text-xs">A cada 10 cortes, 1 grátis</p>
            </div>
            <Link href="/fidelidade" className="text-prata text-sm font-semibold">Ver meu carnê →</Link>
          </Card>
          <Card className="p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Produtos</p>
              <p className="text-zinc-400 text-xs">O que tem na loja</p>
            </div>
            <Link href="/produtos" className="text-prata text-sm font-semibold">Ver vitrine →</Link>
          </Card>
          <p className="text-zinc-400 text-xs text-center pt-2">Seg–Sáb · 09:00–20:00</p>
        </div>
      </div>
    </div>
  );
}