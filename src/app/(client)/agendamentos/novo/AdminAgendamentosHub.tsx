'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateAppointmentStatus,
  deleteAppointment,
  createBloqueio,
  deleteBloqueio,
  type AppointmentStatus,
} from '@/lib/actions/appointments'
import NovoAgendamentoForm from './NovoAgendamentoForm'

interface TodayAppointment {
  id: string
  hora: string
  status: string
  notas: string | null
  servicos: { nome: string; duracao_min: number; preco: number } | null
  usuarios: { nome: string; email: string; telefone: string } | null
}

interface Bloqueio {
  id: string
  data: string
  hora_inicio: string | null
  hora_fim: string | null
  motivo: string | null
}

interface Servico {
  id: string
  nome: string
  duracao_min: number
  preco: number
}

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string | null
}

type Tab = 'agenda' | 'bloqueios' | 'novo'

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

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'agenda', label: 'Agenda do Dia', icon: '📅' },
  { key: 'bloqueios', label: 'Bloquear Agenda', icon: '🚫' },
  { key: 'novo', label: 'Novo Agendamento', icon: '✨' },
]

export default function AdminAgendamentosHub({
  todayAppointments,
  bloqueios,
  servicos,
  clientes = [],
  initialServiceId,
  todayClosed,
  todayDate,
}: {
  todayAppointments: TodayAppointment[]
  bloqueios: Bloqueio[]
  servicos: Servico[]
  clientes?: Cliente[]
  initialServiceId: string
  todayClosed: boolean
  todayDate: string
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('agenda')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [blockError, setBlockError] = useState('')
  const [blockSuccess, setBlockSuccess] = useState('')
  const [deleteBlockConfirm, setDeleteBlockConfirm] = useState<string | null>(null)

  const [bloqueioDate, setBloqueioDate] = useState(todayDate)
  const [bloqueioType, setBloqueioType] = useState<'dia' | 'horario'>('dia')
  const [bloqueioHoraInicio, setBloqueioHoraInicio] = useState('08:00')
  const [bloqueioHoraFim, setBloqueioHoraFim] = useState('12:00')
  const [bloqueioMotivo, setBloqueioMotivo] = useState('')
  const [bloqueiosDoDia, setBloqueiosDoDia] = useState<Bloqueio[]>(bloqueios)
  const [loadingBloqueios, setLoadingBloqueios] = useState(false)

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    setActionLoading(appointmentId)
    const result = await updateAppointmentStatus(appointmentId, newStatus)
    setActionLoading(null)
    if (result.error) {
      alert(result.error)
    }
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
    router.refresh()
  }

  const handleCreateBloqueio = async (formData: FormData) => {
    setBlockError('')
    setBlockSuccess('')
    const result = await createBloqueio(formData)
    if (result.error) {
      setBlockError(result.error)
    } else {
      setBlockSuccess('Bloqueio criado com sucesso!')
      setBloqueioMotivo('')
      fetchBloqueios(bloqueioDate)
      router.refresh()
    }
  }

  const handleDeleteBloqueio = async (id: string) => {
    const result = await deleteBloqueio(id)
    setDeleteBlockConfirm(null)
    if (result.error) {
      alert(result.error)
    }
    fetchBloqueios(bloqueioDate)
    router.refresh()
  }

  const fetchBloqueios = async (dateStr: string) => {
    setLoadingBloqueios(true)
    try {
      const { getBloqueiosByDate } = await import('@/lib/actions/appointments')
      const data = await getBloqueiosByDate(dateStr)
      setBloqueiosDoDia(data as Bloqueio[])
    } catch {
      // ignore
    } finally {
      setLoadingBloqueios(false)
    }
  }

  const handleBloqueioDateChange = (newDate: string) => {
    setBloqueioDate(newDate)
    fetchBloqueios(newDate)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C4917B]">Painel Admin</p>
        <h1 className="text-3xl font-semibold text-zinc-800">Agendamentos</h1>
        <p className="mt-1 text-zinc-500">
          Gerencie a agenda do dia, bloqueios e crie novos agendamentos.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex gap-1 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab.key
                  ? 'border-[#C4917B] text-[#C4917B]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Agenda do Dia */}
      {activeTab === 'agenda' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-semibold text-zinc-800">
              {formatDate(todayDate)}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {todayAppointments.length} agendamento{todayAppointments.length !== 1 ? 's' : ''} encontrado{todayAppointments.length !== 1 ? 's' : ''}
            </p>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <p className="text-zinc-400">Nenhum agendamento para hoje.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-[#C4917B]">
                          {appt.hora.slice(0, 5)}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium border ${STATUS_COLORS[appt.status] || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                          {STATUS_OPTIONS.find(s => s.value === appt.status)?.label || appt.status}
                        </span>
                      </div>
                      <p className="font-semibold text-zinc-800">
                        {appt.servicos?.nome || 'Serviço'}
                      </p>
                      {appt.usuarios && (
                        <p className="text-sm text-zinc-600">
                          {appt.usuarios.nome}
                          <span className="text-zinc-400 ml-1">({appt.usuarios.email})</span>
                        </p>
                      )}
                      {appt.notas && (
                        <p className="text-sm text-zinc-400 truncate">📝 {appt.notas}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status select */}
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

                      {/* Delete button */}
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Bloquear Agenda */}
      {activeTab === 'bloqueios' && (
        <div className="space-y-4">
          <form
            action={handleCreateBloqueio}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5"
          >
            <h2 className="text-lg font-semibold text-zinc-800">Criar Bloqueio</h2>

            <input type="hidden" name="bloqueio_type" value={bloqueioType} />
            <input type="hidden" name="data" value={bloqueioDate} />

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Data</label>
              <input
                type="date"
                value={bloqueioDate}
                onChange={(e) => handleBloqueioDateChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Block type */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">Tipo de Bloqueio</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bloqueio_type_visual"
                    value="dia"
                    checked={bloqueioType === 'dia'}
                    onChange={() => setBloqueioType('dia')}
                    className="accent-[#C4917B]"
                  />
                  <span className="text-sm text-zinc-700">Dia inteiro</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bloqueio_type_visual"
                    value="horario"
                    checked={bloqueioType === 'horario'}
                    onChange={() => setBloqueioType('horario')}
                    className="accent-[#C4917B]"
                  />
                  <span className="text-sm text-zinc-700">Horário específico</span>
                </label>
              </div>
            </div>

            {/* Time range (only for specific time) */}
            {bloqueioType === 'horario' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={bloqueioHoraInicio}
                    onChange={(e) => setBloqueioHoraInicio(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Horário Fim</label>
                  <input
                    type="time"
                    name="hora_fim"
                    value={bloqueioHoraFim}
                    onChange={(e) => setBloqueioHoraFim(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Motivo (opcional)</label>
              <input
                type="text"
                name="motivo"
                value={bloqueioMotivo}
                onChange={(e) => setBloqueioMotivo(e.target.value)}
                placeholder="Ex: Feriado, almoço, reunião..."
                className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
              />
            </div>

            {blockError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
                {blockError}
              </div>
            )}
            {blockSuccess && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 border border-green-200">
                {blockSuccess}
              </div>
            )}

            <button
              type="submit"
              className="rounded-xl bg-[#C4917B] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
            >
              Criar Bloqueio
            </button>
          </form>

          {/* Existing blocks */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-semibold text-zinc-700 mb-3">
              Bloqueios em {formatDate(bloqueioDate)}
            </h3>
            {loadingBloqueios ? (
              <p className="text-sm text-zinc-400">Carregando...</p>
            ) : bloqueiosDoDia.length === 0 ? (
              <p className="text-sm text-zinc-400">Nenhum bloqueio nesta data.</p>
            ) : (
              <div className="space-y-2">
                {bloqueiosDoDia.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 transition-all duration-200"
                  >
                    <div>
                      {b.hora_inicio && b.hora_fim ? (
                        <p className="text-sm font-medium text-zinc-700">
                          🕐 {b.hora_inicio.slice(0, 5)} – {b.hora_fim.slice(0, 5)}
                        </p>
                      ) : (
                        <p className="text-sm font-medium text-zinc-700">🚫 Dia inteiro</p>
                      )}
                      {b.motivo && (
                        <p className="text-xs text-zinc-500 mt-0.5">{b.motivo}</p>
                      )}
                    </div>
                    {deleteBlockConfirm === b.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteBloqueio(b.id)}
                          className="rounded-lg bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600 transition-all duration-200 active:scale-[0.98]"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setDeleteBlockConfirm(null)}
                          className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-all duration-200 active:scale-[0.98]"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteBlockConfirm(b.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Novo Agendamento */}
      {activeTab === 'novo' && (
        <NovoAgendamentoForm
          servicos={servicos}
          clientes={clientes}
          initialServiceId={initialServiceId}
          todayClosed={todayClosed}
          isAdmin={true}
        />
      )}
    </div>
  )
}
