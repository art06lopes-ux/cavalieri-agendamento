'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { slots, reservar } from './actions'
import { formatBRL } from '@/lib/format'
import { todayISO } from '@/lib/dateRange'
import { Card, Eyebrow } from '@/components/ui'

type Servico = { id: string; nome: string; preco: number; duracao_minutos: number | null }
type Barbeiro = { id: string; nome: string }

function dataISOmais(dias: number) {
  const [y, m, d] = todayISO().split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10)
}

function fmtDiaCurto(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  const dow = dt.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '')
  return { dow, dia: String(d).padStart(2, '0'), mes: String(m).padStart(2, '0') }
}

function fmtDataLonga(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  })
}

export function Wizard({ servicos, barbeiros }: { servicos: Servico[]; barbeiros: Barbeiro[] }) {
  const router = useRouter()
  const [etapa, setEtapa] = useState(0)
  const [serviceId, setServiceId] = useState('')
  const [staffId, setStaffId] = useState<string | 'qualquer'>('qualquer')
  const [dia, setDia] = useState(dataISOmais(0))
  const [porBarbeiro, setPorBarbeiro] = useState<Record<string, string[]>>({})
  const [carregandoSlots, setCarregandoSlots] = useState(false)
  const [inicioIso, setInicioIso] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [nascimento, setNascimento] = useState('')
  const [lgpd, setLgpd] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const servico = servicos.find((s) => s.id === serviceId)
  const dias = useMemo(() => Array.from({ length: 8 }, (_, i) => dataISOmais(i)), [])

  useEffect(() => {
    if (etapa !== 3 || !serviceId) return
    let vivo = true
    setCarregandoSlots(true)
    setErro('')
    slots({ dia, serviceId })
      .then((r) => {
        if (!vivo) return
        setPorBarbeiro(r.porBarbeiro)
      })
      .catch((e: any) => vivo && setErro(e?.message ?? 'Não consegui carregar os horários.'))
      .finally(() => vivo && setCarregandoSlots(false))
    return () => {
      vivo = false
    }
  }, [etapa, dia, serviceId])

  const slotsVisiveis = useMemo(() => {
    if (staffId === 'qualquer') {
      const set = new Set<string>()
      Object.values(porBarbeiro).forEach((l) => l.forEach((s) => set.add(s)))
      return Array.from(set).sort()
    }
    return [...(porBarbeiro[staffId] ?? [])].sort()
  }, [porBarbeiro, staffId])

  const barbeiroDoSlot = (iso: string) => {
    if (staffId !== 'qualquer') return staffId
    return Object.entries(porBarbeiro).find(([, l]) => l.includes(iso))?.[0] ?? null
  }

  async function confirmar() {
    setErro('')
    setEnviando(true)
    try {
      const { id } = await reservar({ serviceId, staffId, inicioIso, nome, telefone, dataNascimento: nascimento, lgpd })
      router.push(`/agendar/${id}/sucesso` as never)
    } catch (e: any) {
      if (e?.message === 'HORARIO_OCUPADO') {
        setErro('Alguém reservou esse horário agora mesmo. Recarreguei os livres — escolha outro.')
        try {
          const r = await slots({ dia, serviceId })
          setPorBarbeiro(r.porBarbeiro)
          setInicioIso('')
        } catch {
          /* mantém a lista atual */
        }
      } else {
        setErro(e?.message ?? 'Não consegui confirmar. Tente de novo.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const nomes: Record<string, string> = Object.fromEntries(barbeiros.map((b) => [b.id, b.nome]))
  const podeAvancarHorario = !!inicioIso && (staffId !== 'qualquer' || !!barbeiroDoSlot(inicioIso))

  return (
    <div key={etapa} className="animate-[fadeSlide_.25s_ease]">
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={6}
        aria-valuenow={etapa + 1}
        aria-label="Etapa do agendamento"
        className="h-1 rounded bg-white/15 mb-5"
      >
        <div className="h-1 rounded bg-prata transition-all" style={{ width: `${((etapa + 1) / 6) * 100}%` }} />
      </div>
      {etapa === 0 && (
        <div className="space-y-3">
          <Eyebrow>1 · Escolha o serviço</Eyebrow>
          {servicos.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id)
                setEtapa(1)
              }}
              className={`w-full text-left rounded-2xl border p-4 transition-all active:scale-[0.99] ${
                serviceId === s.id
                  ? 'border-[#C0C5CE] bg-[#C0C5CE]/10'
                  : 'border-white/10 bg-zinc-900/60 hover:border-white/25'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-white font-semibold">{s.nome}</span>
                <span className="text-prata text-sm font-medium tabular-nums">{formatBRL(s.preco)}</span>
              </span>
              <span className="text-zinc-400 text-xs mt-1 block">{s.duracao_minutos ?? 30} min</span>
            </button>
          ))}
        </div>
      )}

      {etapa === 1 && (
        <div className="space-y-3">
          <Eyebrow>2 · Com quem você quer cortar?</Eyebrow>
          <button
            type="button"
            onClick={() => {
              setStaffId('qualquer')
              setEtapa(2)
            }}
            className="w-full rounded-2xl border border-white bg-white p-4 text-left active:scale-[0.99] transition-all"
          >
            <span className="text-black font-semibold">✦ Qualquer barbeiro</span>
            <span className="text-zinc-600 text-xs mt-0.5 block">Mais horários livres, a gente encaixa você</span>
          </button>
          {barbeiros.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setStaffId(b.id)
                setEtapa(2)
              }}
              className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4 text-left hover:border-white/25 active:scale-[0.99] transition-all"
            >
              <span className="w-11 h-11 rounded-full bg-white/10 ring-1 ring-[#C0C5CE]/40 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {b.nome.charAt(0).toUpperCase()}
              </span>
              <span className="text-white font-semibold">{b.nome}</span>
            </button>
          ))}
          <button type="button" onClick={() => setEtapa(0)} className="text-xs text-zinc-400 hover:text-white">
            ← trocar serviço
          </button>
        </div>
      )}

      {etapa === 2 && (
        <div>
          <div className="mb-3"><Eyebrow>3 · Escolha o dia</Eyebrow></div>
          <div className="grid grid-cols-4 gap-2">
            {dias.map((d) => {
              const f = fmtDiaCurto(d)
              const ativo = dia === d
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setDia(d)
                    setInicioIso('')
                    setEtapa(3)
                  }}
                  className={`rounded-2xl border py-3 px-1 text-center transition-all active:scale-[0.97] ${
                    ativo ? 'border-white bg-white text-black' : 'border-white/10 bg-zinc-900/60 text-white'
                  }`}
                >
                  <span className={`block text-[10px] uppercase ${ativo ? 'text-zinc-600' : 'text-zinc-400'}`}>{f.dow}</span>
                  <span className="block text-lg font-bold leading-tight">
                    {f.dia}
                    <span className={`text-xs font-normal ${ativo ? 'text-zinc-600' : 'text-zinc-400'}`}>/{f.mes}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <button type="button" onClick={() => setEtapa(1)} className="text-xs text-zinc-400 hover:text-white mt-4">
            ← trocar barbeiro
          </button>
        </div>
      )}

      {etapa === 3 && (
        <div>
          <div className="mb-1"><Eyebrow>4 · Horários livres</Eyebrow></div>
          <p className="text-zinc-400 text-xs mb-3 capitalize">
            {fmtDataLonga(dia)}
            {staffId !== 'qualquer' ? ` · ${nomes[staffId]}` : ''}
          </p>
          {carregandoSlots ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-white/5 h-11 animate-pulse" />
              ))}
            </div>
          ) : slotsVisiveis.length ? (
            <div className="grid grid-cols-3 gap-2">
              {slotsVisiveis.map((s) => {
                const hhmm = s.slice(11, 16)
                const ativo = inicioIso === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInicioIso(s)}
                    className={`rounded-xl border py-3 text-sm font-semibold tabular-nums transition-all active:scale-[0.97] ${
                      ativo ? 'border-[#C0C5CE] bg-[#C0C5CE] text-black on-prata' : 'border-white/10 bg-zinc-900/60 text-white'
                    }`}
                  >
                    {hhmm}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 text-center">
              <p className="text-white font-medium mb-1">Sem horário livre neste dia</p>
              <p className="text-zinc-400 text-xs">Tente outro dia ou outro barbeiro.</p>
            </div>
          )}
          <div aria-live="polite">
            {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setEtapa(2)} className="text-xs text-zinc-400 hover:text-white px-2">
              ← dia
            </button>
            <button
              type="button"
              disabled={!podeAvancarHorario}
              onClick={() => setEtapa(4)}
              className="flex-1 rounded-xl bg-[#C0C5CE] text-black text-sm font-semibold py-3 disabled:opacity-40 on-prata"
            >
              Continuar
            </button>
          </div>
          {!podeAvancarHorario && <p className="text-xs text-zinc-400 mt-2">Escolha um horário para continuar.</p>}
        </div>
      )}

      {etapa === 4 && (
        <div className="space-y-3">
          <Eyebrow>5 · Seus dados</Eyebrow>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nome *</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              autoComplete="name"
              className="w-full rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/40 text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">WhatsApp *</label>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(65) 99999-0000"
              inputMode="tel"
              autoComplete="tel"
              className="w-full rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/40 text-base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Data de nascimento *</label>
            <input type="date" value={nascimento} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setNascimento(e.target.value)} className="w-full rounded-xl bg-zinc-900/80 border border-white/10 px-3 py-3 text-white outline-none focus:border-white/40 text-base" />
          </div>
          <label className="flex gap-2 text-xs text-zinc-400"><input type="checkbox" checked={lgpd} onChange={(e) => setLgpd(e.target.checked)} /> Autorizo salvar meus dados para agendamento e fidelidade (LGPD).</label>
          <div aria-live="polite">
            {erro && <p className="text-red-400 text-sm">{erro}</p>}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setEtapa(3)} className="text-xs text-zinc-400 hover:text-white px-2">
              ← horário
            </button>
            <button
              type="button"
              disabled={!nome.trim() || !telefone.trim() || !nascimento || !lgpd}
              onClick={() => setEtapa(5)}
              className="flex-1 rounded-xl bg-prata text-black text-sm font-semibold py-3 disabled:opacity-40 on-prata"
            >
              Revisar
            </button>
          </div>
          {(!nome.trim() || !telefone.trim() || !nascimento || !lgpd) && (
            <p className="text-xs text-zinc-400 mt-2">Preencha nome, data de nascimento e autorize o uso dos dados.</p>
          )}
        </div>
      )}

      {etapa === 5 && (
        <div>
          <p className="text-zinc-400 text-sm mb-3">6 · Confira e confirme</p>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 space-y-2 text-sm">
            <ResumoLinha k="Serviço" v={`${servico?.nome} · ${formatBRL(servico?.preco ?? 0)}`} />
            <ResumoLinha
              k="Barbeiro"
              v={staffId === 'qualquer' ? `Qualquer (encaixe automático)` : (nomes[staffId] ?? '')}
            />
            <ResumoLinha k="Data" v={fmtDataLonga(dia)} />
            <ResumoLinha k="Horário" v={inicioIso.slice(11, 16)} />
            <ResumoLinha k="Cliente" v={`${nome} · ${telefone}`} />
            <ResumoLinha k="Nascimento" v={nascimento} />
          </div>
          <div aria-live="polite">
            {erro && <p className="text-red-400 text-sm mt-3">{erro}</p>}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={() => setEtapa(4)} className="text-xs text-zinc-400 hover:text-white px-2">
              ← dados
            </button>
            <button
              type="button"
              disabled={enviando}
              onClick={confirmar}
              className="flex-1 rounded-xl bg-prata text-black text-sm font-semibold py-3 disabled:opacity-50 on-prata"
            >
              {enviando ? 'Reservando…' : 'Confirmar agendamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ResumoLinha({ k, v }: { k: string; v: string }) {
  return (
    <p className="flex justify-between gap-3">
      <span className="text-zinc-400">{k}</span>
      <span className="text-white font-medium text-right capitalize">{v}</span>
    </p>
  )
}
