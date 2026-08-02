'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAppointmentsByDate,
  updateAppointmentStatus,
  deleteAppointment,
  type AppointmentStatus,
} from '@/lib/actions/appointments'
import ModalVerFormulario from './ModalVerFormulario'

interface AnamneseData {
  id: string
  formulario_template_id: string | null
  campos_json: Record<string, unknown> | null
  aceite_digital: boolean | null
  aceito_em: string | null
  formulario_templates: { nome: string; perguntas_json: string } | null
}

interface ConsultedAppointment {
  id: string
  data: string
  hora: string
  status: string
  notas: string | null
  servicos: { id: string; nome: string; duracao_min: number; preco: number } | null
  usuarios: { nome: string; email: string; telefone: string } | null
  anamneses: AnamneseData[] | null
}

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Confirmado', label: 'Confirmado' },
  { value: 'Concluido', label: 'Concluído' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const STATUS_COLORS: Record<string, string> = {
  Pendente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Confirmado: 'bg-blue-100 text-blue-700 border-blue-200',
  Concluido: 'bg-green-100 text-green-700 border-green-200',
  Cancelado: 'bg-red-100 text-red-700 border-red-200',
}

const todayStr = () => new Date().toISOString().split('T')[0]

const shiftDate = (dateStr: string, days: number) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().split('T')[0]
}

export default function ConsultarAgendamentosTab() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [appointments, setAppointments] = useState<ConsultedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [viewingAppointment, setViewingAppointment] = useState<ConsultedAppointment | null>(null)

  const loadAppointments = useCallback(async (dateStr: string) => {
    try {
      const data = await getAppointmentsByDate(dateStr)
      const parsed = data as unknown as ConsultedAppointment[]
      setError('')
      setAppointments(parsed)
      return parsed
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err)
      setError('Não foi possível carregar os agendamentos desta data.')
      setAppointments([])
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const changeDate = (dateStr: string) => {
    setLoading(true)
    setSelectedDate(dateStr)
  }

  const handleFormSaved = async (appointmentId: string) => {
    const fresh = await loadAppointments(selectedDate)
    const updated = fresh.find((a) => a.id === appointmentId)
    if (updated) setViewingAppointment(updated)
  }

  useEffect(() => {
    let cancelled = false
    void Promise.resolve().then(() => {
      if (!cancelled) loadAppointments(selectedDate)
    })
    return () => {
      cancelled = true
    }
  }, [loadAppointments, selectedDate])

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setActionLoading(appointmentId)
    const result = await updateAppointmentStatus(appointmentId, newStatus)
    setActionLoading(null)
    if (result.error) {
      alert(result.error)
    }

    if (newStatus === 'Confirmado' && !result.error) {
      const appt = appointments.find((a) => a.id === appointmentId)
      if (appt?.usuarios?.telefone) {
        const phone = appt.usuarios.telefone.replace(/\D/g, '')
        const dataFormatada = new Date(appt.data + 'T00:00:00').toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
        const servico = appt.servicos?.nome || 'Procedimento'
        const mensagem = encodeURIComponent(
          `Olá ${appt.usuarios.nome}! ✅\n\n` +
            `Seu agendamento na RBClinic foi confirmado!\n\n` +
            `📅 Data: ${dataFormatada}\n` +
            `🕐 Horário: ${appt.hora.slice(0, 5)}\n` +
            `💆 Procedimento: ${servico}\n\n` +
            `Aguardamos você! 💛`
        )
        window.open(`https://api.whatsapp.com/send?phone=55${phone}&text=${mensagem}`, '_blank')
      }
    }

    loadAppointments(selectedDate)
    router.refresh()
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    setActionLoading(appointmentId)
    const result = await deleteAppointment(appointmentId)
    setActionLoading(null)
    setDeleteConfirm(null)
    if (result.error) {
      alert(result.error)
    }
    loadAppointments(selectedDate)
    router.refresh()
  }

  const filtered = appointments.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const nome = a.usuarios?.nome?.toLowerCase() || ''
      const email = a.usuarios?.email?.toLowerCase() || ''
      const telefone = a.usuarios?.telefone || ''
      if (!nome.includes(q) && !email.includes(q) && !telefone.includes(q)) return false
    }
    return true
  })

  const formatDateLong = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Busca por data */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Data de Consulta</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => changeDate(e.target.value || todayStr())}
              className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => changeDate(shiftDate(todayStr(), -1))}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
            >
              Ontem
            </button>
            <button
              type="button"
              onClick={() => changeDate(todayStr())}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => changeDate(shiftDate(todayStr(), 1))}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
            >
              Amanhã
            </button>
          </div>
        </div>

        {/* Filtros adicionais */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">
              Buscar cliente
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, e-mail ou telefone..."
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
            >
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(statusFilter || search) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter('')
              setSearch('')
            }}
            className="text-xs font-medium text-[#C4917B] hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Resultados */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-zinc-400">Carregando agendamentos...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-3xl mb-2">🗓️</p>
          <p className="text-zinc-500">
            Nenhum agendamento encontrado em {formatDateLong(selectedDate)}.
          </p>
          {statusFilter || search ? (
            <p className="text-sm text-zinc-400 mt-1">
              Tente limpar os filtros ou escolher outra data.
            </p>
          ) : (
            <p className="text-sm text-zinc-400 mt-1">
              Selecione outra data para consultar.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-zinc-800">{formatDateLong(selectedDate)}</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {filtered.length} agendamento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.map((appt) => {
            const hasForm = appt.anamneses && appt.anamneses.length > 0
            return (
              <div
                key={appt.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-[#C4917B]">
                        {appt.hora.slice(0, 5)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium border ${STATUS_COLORS[appt.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}
                      >
                        {STATUS_OPTIONS.find((s) => s.value === appt.status)?.label || appt.status}
                      </span>
                      {hasForm && (
                        <span className="rounded-full px-3 py-1 text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          📋 Formulário preenchido
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-zinc-800">
                      {appt.servicos?.nome || 'Serviço'}
                    </p>
                    {appt.usuarios && (
                      <p className="text-sm text-zinc-600">
                        {appt.usuarios.nome}
                        <span className="text-zinc-400 ml-1">
                          ({appt.usuarios.email})
                          {appt.usuarios.telefone && ` · ${appt.usuarios.telefone}`}
                        </span>
                      </p>
                    )}
                    {appt.notas && (
                      <p className="text-sm text-zinc-400 truncate">📝 {appt.notas}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={appt.status}
                      disabled={actionLoading === appt.id}
                      onChange={(e) =>
                        handleStatusChange(appt.id, e.target.value as AppointmentStatus)
                      }
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-sm text-zinc-700 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none disabled:opacity-50 transition-all duration-200"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setViewingAppointment(appt)}
                      disabled={!hasForm}
                      className={`rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                        hasForm
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border border-zinc-200 bg-zinc-50 text-zinc-400'
                      }`}
                      title={hasForm ? 'Ver formulário preenchido' : 'Sem formulário preenchido'}
                    >
                      📋 Ver Formulário
                    </button>

                    {deleteConfirm === appt.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteAppointment(appt.id)}
                          disabled={actionLoading === appt.id}
                          className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                        >
                          {actionLoading === appt.id ? '...' : 'Sim'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all duration-200 active:scale-[0.98]"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(appt.id)}
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-all duration-200 active:scale-[0.98]"
                        title="Excluir agendamento"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de visualização do formulário */}
      {viewingAppointment && (
        <ModalVerFormulario
          appointment={viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  )
}
