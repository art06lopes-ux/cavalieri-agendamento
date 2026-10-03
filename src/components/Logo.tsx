import Image from 'next/image'

export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex rounded-2xl overflow-hidden bg-black ring-1 ring-white/15 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-cavalieri.png"
        alt="Cavalieri Barbearia"
        fill
        sizes={`${size}px`}
        className="object-contain p-[6%]"
      />
    </span>
  )
}

export function LogoFull({ height = 160, className = '' }: { height?: number; className?: string }) {
  const width = Math.round(height * (605 / 587))
  return (
    <Image
      src="/logo-cavalieri.png"
      alt="Cavalieri Barbearia — Estilo, precisão, presença."
      width={width}
      height={height}
      className={`rounded-lg object-contain ${className}`}
      priority
    />
  )
}

export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={40} />
      <div className="leading-tight">
        <p className="text-white font-bold tracking-wide text-sm">CAVALIERI</p>
        <p className="text-white font-bold tracking-wide text-sm -mt-0.5">BARBEARIA</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="h-px w-3 bg-white/25" />
          <span className="text-[9px] text-zinc-400 tracking-[0.25em]">ESTILO · PRECISÃO</span>
          <span className="h-px w-3 bg-white/25" />
        </div>
      </div>
    </div>
  )
}
