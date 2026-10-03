import Link from "next/link";
import { LogoWordmark } from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <LogoWordmark className="mb-6 justify-center" />
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Corte seu horário
        <br />
        na Cavalieri
      </h1>
      <p className="text-zinc-500 text-sm mb-8 max-w-xs">
        Escolha serviço, barbeiro e horário em menos de 1 minuto. Sem cadastro.
      </p>
      <Link
        href="/agendar"
        className="w-full max-w-xs rounded-2xl bg-white text-black text-base font-semibold py-4 active:scale-[0.98] transition-all"
      >
        Agendar agora
      </Link>
      <p className="text-zinc-600 text-xs mt-6">Seg–Sáb · 09:00–20:00</p>
    </div>
  );
}
