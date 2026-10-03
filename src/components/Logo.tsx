import Image from 'next/image'

// Emblema circular oficial da marca (1254x1254, fundo transparente).
export function LogoMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex rounded-full overflow-hidden bg-black ring-1 ring-white/20 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo-redonda.png"
        alt="Cavalieri Barbearia"
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
    </span>
  )
}

export function LogoFull({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-redonda.png"
      alt="Cavalieri Barbearia — Estilo, precisão, presença."
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  )
}

// O emblema já carrega "CAVALIERI BARBEARIA"; aqui só o selo de estilo.
export function LogoWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <LogoMark size={72} />
      <div className="flex items-center gap-2">
        <span className="h-px w-6 bg-prata/50" />
        <span className="text-[10px] text-prata tracking-[0.3em]">ESTILO · PRECISÃO</span>
        <span className="h-px w-6 bg-prata/50" />
      </div>
    </div>
  )
}