import Link from 'next/link'

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] tracking-[0.3em] text-[#C0C5CE] font-medium">{children}</p>
}

export function BotaoPrimario({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href as never} className="block w-full rounded-2xl bg-[#C0C5CE] text-black text-center text-base font-semibold py-4 active:scale-[0.98] transition-all">
      {children}
    </Link>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-zinc-900/60 ${className}`}>{children}</div>
}

export function Selo({ cheio, children }: { cheio: boolean; children?: React.ReactNode }) {
  return (
    <span className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${cheio ? 'bg-[#C0C5CE] text-black' : 'bg-white/10 text-zinc-500 ring-1 ring-white/10'}`}>
      {children}
    </span>
  )
}
