'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Agendamento {
  id: string
  data: string
  hora: string
  status: string
  notas: string | null
  patient_id: string
  servicos: { nome: string; preco: number } | null
  usuarios: { nome: string; email: string } | null
}

interface Servico {
  id: string
  nome: string
}

const STATUS_OPTIONS = ['Pendente', 'Confirmado', 'Concluido', 'Cancelado'] as const

const STATUS_COLORS: Record<string, string> = {
  Pendente: 'bg-yellow-100 text-yellow-700',
  Confirmado: 'bg-blue-100 text-blue-700',
  Concluido: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  Pendente: 'Pendente',
  Confirmado: 'Confirmado',
  Concluido: 'Concluído',
  Cancelado: 'Cancelado',
}

export default function AgendamentosList({
  agendamentos,
  servicos,
  isAdmin,
}: {
  agendamentos: Agendamento[]
  servicos: Servico[]
  isAdmin: boolean
}) {
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filtered = useMemo(() => {
    return agendamentos.filter((a) => {
      // Filtro por texto (nome do cliente ou email) — só admin
      if (search) {
        const q = search.toLowerCase()
        const nome = a.usuarios?.nome?.toLowerCase() || ''
        const email = a.usuarios?.email?.toLowerCase() || ''
        if (!nome.includes(q) && !email.includes(q)) return false
      }

      // Filtro por data
      if (filterDate && a.data !== filterDate) return false

      // Filtro por serviço
      if (filterService && a.servicos?.nome !== filterService) return false

      // Filtro por status
      if (filterStatus && a.status !== filterStatus) return false

      return true
    })
  }, [agendamentos, search, filterDate, filterService, filterStatus])

  const hasFilters = search || filterDate || filterService || filterStatus

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C4917B]">Agendamentos</p>
          <h1 className="text-3xl font-semibold text-zinc-800">
            {isAdmin ? 'Todos os Agendamentos' : 'Meus Agendamentos'}
          </h1>
          <p className="mt-1 text-zinc-500">
            {isAdmin
              ? 'Histórico completo de todos os agendamentos do sistema.'
              : 'Histórico completo dos seus agendamentos.'}
          </p>
        </div>
        <div>
          <Link
            href="/agendamentos/novo"
            className="inline-flex justify-center items-center rounded-xl bg-[#C4917B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
          >
            Novo Agendamento
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Busca por nome/email (admin) */}
          {isAdmin && (
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Buscar cliente
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome ou email do cliente..."
                className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
              />
            </div>
          )}

          {/* Filtro por data */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Data
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Filtro por procedimento */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Procedimento
            </label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
            >
              <option value="">Todos</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.nome}>
                  {s.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por status */}
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Limpar filtros */}
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setFilterDate('')
              setFilterService('')
              setFilterStatus('')
            }}
            className="text-xs font-medium text-[#C4917B] hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Resultados */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs text-zinc-400">
            {filtered.length} agendamento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          {filtered.map((agendamento) => (
            <div
              key={agendamento.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-zinc-800">
                    {agendamento.servicos?.nome || 'Serviço'}
                  </p>
                  {isAdmin && agendamento.usuarios && (
                    <p className="text-sm text-zinc-600">
                      {agendamento.usuarios.nome}
                      <span className="text-zinc-400 ml-1">
                        ({agendamento.usuarios.email})
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-zinc-500">
                    {new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')}{' '}
                    às {agendamento.hora.slice(0, 5)}
                  </p>
                  {agendamento.servicos?.preco != null && (
                    <p className="text-sm font-medium text-[#D4AF37]">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(agendamento.servicos.preco)}
                    </p>
                  )}
                  {agendamento.notas && (
                    <p className="text-sm text-zinc-400 truncate">
                      {agendamento.notas}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    STATUS_COLORS[agendamento.status] || 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {STATUS_LABELS[agendamento.status] || agendamento.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-zinc-400">
            {hasFilters
              ? 'Nenhum agendamento encontrado com os filtros selecionados.'
              : 'Nenhum agendamento encontrado.'}
          </p>
        </div>
      )}
    </div>
  )
}
