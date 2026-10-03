'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITENS = [
  { href: '/', rotulo: 'Início', icone: '⌂' },
  { href: '/agendar', rotulo: 'Agendar', icone: '✂' },
  { href: '/produtos', rotulo: 'Produtos', icone: '◇' },
  { href: '/fidelidade', rotulo: 'Fidelidade', icone: '★' },
]

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-black/95 backdrop-blur pb-safe">
      <div className="mx-auto max-w-md grid grid-cols-4">
        {ITENS.map((i) => {
          const ativo = path === i.href || (i.href !== '/' && path.startsWith(i.href))
          return (
            <Link key={i.href} href={i.href as never} className={`py-2.5 text-center text-[11px] ${ativo ? 'text-white font-semibold' : 'text-zinc-500'}`}>
              <span className="block text-lg leading-none">{i.icone}</span>
              {i.rotulo}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
