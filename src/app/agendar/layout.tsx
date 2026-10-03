import { LogoWordmark } from '@/components/Logo'

export const metadata = {
  title: 'Agendar — Cavalieri Barbearia',
  description: 'Reserve seu horário na Cavalieri Barbearia',
}

export default function AgendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 pt-8 pb-10">
      <style>{`@keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
      <LogoWordmark className="mb-1" />
      <p className="text-zinc-500 text-xs tracking-[0.25em] mb-8">AGENDAMENTO</p>
      <main className="w-full max-w-md">{children}</main>
    </div>
  )
}
