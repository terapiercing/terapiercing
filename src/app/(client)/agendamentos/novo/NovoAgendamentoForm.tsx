'use client'

import { useState, useEffect, useActionState } from 'react'
import { getAvailableSlots, createAppointment } from '@/lib/actions/appointments'
import { useRouter } from 'next/navigation'
import ModalNovoCliente from './ModalNovoCliente'
import ModalPagamentoPendente from './ModalPagamentoPendente'

interface Servico {
  id: string
  nome: string
  duracao_min: number
  preco: number
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string | null
}

export default function NovoAgendamentoForm({
  servicos,
  clientes = [],
  initialServiceId,
  todayClosed,
  isAdmin = false,
}: {
  servicos: Servico[]
  clientes?: Cliente[]
  initialServiceId: string
  todayClosed: boolean
  isAdmin?: boolean
}) {
  const router = useRouter()
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || (servicos[0]?.id ?? ''))
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Lista de clientes com atualização local ao cadastrar novo paciente
  const [listaClientes, setListaClientes] = useState<Cliente[]>(clientes)
  const [selectedPatientId, setSelectedPatientId] = useState<string>(clientes[0]?.id || '')
  const [clientSearch, setClientSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setListaClientes(clientes)
    if (clientes.length > 0 && !selectedPatientId) {
      setSelectedPatientId(clientes[0].id)
    }
  }, [clientes])

  const filteredClientes = listaClientes.filter((c) => {
    if (!clientSearch) return true
    const q = clientSearch.toLowerCase()
    return (
      c.nome.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.telefone.includes(q) ||
      c.cpf?.includes(q)
    )
  })

  const handleClienteCreated = (novoCliente: Cliente) => {
    setListaClientes((prev) => [novoCliente, ...prev])
    setSelectedPatientId(novoCliente.id)
  }

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const [state, formAction, pending] = useActionState(
    createAppointment,
    undefined
  )

  const showPaymentPopup = !!state?.success && !isAdmin

  useEffect(() => {
    if (state?.success && isAdmin) {
      router.push('/agendamentos')
    }
  }, [state, isAdmin, router])

  const selectedService = servicos.find(s => s.id === selectedServiceId)

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) {
      setAvailableSlots([])
      setSelectedTime('')
      return
    }

    async function fetchSlots() {
      setLoadingSlots(true)
      setSelectedTime('')
      try {
        const slots = await getAvailableSlots(selectedServiceId, selectedDate)
        setAvailableSlots(slots)
      } catch (err) {
        console.error('Erro ao buscar slots:', err)
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchSlots()
  }, [selectedServiceId, selectedDate])

  // Calendar generation logic
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const lastDay = new Date(year, month + 1, 0).getDate()

  const calendarDays: { date: Date; isCurrentMonth: boolean; isPast: boolean; isSunday: boolean }[] = []

  const formatDateStr = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dateStr = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dateStr}`
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayStr = formatDateStr(todayStart)

  // Helper to check if a date should be treated as unavailable
  const isDateUnavailable = (d: Date) => {
    if (d.getDay() === 0) return true // Domingo
    if (d < todayStart) return true // Passado
    if (todayClosed && formatDateStr(d) === todayStr) return true // Hoje mas expediente encerrou
    return false
  }

  // Add padding days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i)
    calendarDays.push({
      date: d,
      isCurrentMonth: false,
      isPast: isDateUnavailable(d),
      isSunday: d.getDay() === 0
    })
  }

  // Add days of current month
  for (let i = 1; i <= lastDay; i++) {
    const d = new Date(year, month, i)
    calendarDays.push({
      date: d,
      isCurrentMonth: true,
      isPast: isDateUnavailable(d),
      isSunday: d.getDay() === 0
    })
  }

  // Add padding days for next month to complete the 6-week grid (42 days)
  const remaining = 42 - calendarDays.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    calendarDays.push({
      date: d,
      isCurrentMonth: false,
      isPast: isDateUnavailable(d),
      isSunday: d.getDay() === 0
    })
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const getDayClasses = (item: typeof calendarDays[0]) => {
    const dateStr = formatDateStr(item.date)
    const isSelected = selectedDate === dateStr
    const isToday = formatDateStr(new Date()) === dateStr

    let classes = 'aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-200 '

    if (item.isSunday || item.isPast) {
      classes += 'text-zinc-300 cursor-not-allowed '
    } else {
      classes += 'cursor-pointer hover:bg-zinc-100 text-zinc-800 '
    }

    if (!item.isCurrentMonth && !isSelected) {
      classes += 'opacity-40 '
    }

    if (isSelected) {
      classes += '!bg-[#C4917B] !text-white font-semibold shadow-sm '
    } else if (isToday) {
      classes += 'border border-[#C4917B] text-[#C4917B] font-semibold '
    }

    return classes
  }

  return (
    <>
      <form action={formAction} className="space-y-6 bg-white border border-zinc-200 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
        <input type="hidden" name="serviceId" value={selectedServiceId} />
        <input type="hidden" name="date" value={selectedDate} />
        <input type="hidden" name="time" value={selectedTime} />
        {isAdmin && <input type="hidden" name="patientId" value={selectedPatientId} />}

        {/* Admin: Seleção de Cliente */}
        {isAdmin && (
          <div className="space-y-3 rounded-2xl bg-zinc-50 p-4 border border-zinc-200">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-zinc-800 flex items-center gap-2">
                <span>👤</span> Selecionar Cliente
              </label>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-semibold text-[#C4917B] hover:text-[#A87060] hover:underline flex items-center gap-1 transition-all duration-200"
              >
                <span>+</span> Cadastrar Novo Cliente
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Filtrar cliente por nome, e-mail, telefone..."
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs text-zinc-800 bg-white shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
              />

              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required={isAdmin}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 bg-white shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
              >
                {filteredClientes.length === 0 ? (
                  <option value="">Nenhum cliente encontrado</option>
                ) : (
                  filteredClientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome} - {c.telefone} ({c.email})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}

      {/* Select Service */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-zinc-700">Procedimento</label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200"
        >
          {servicos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome} ({s.duracao_min} min)
            </option>
          ))}
        </select>
      </div>

      {/* Service Details Card */}
      {selectedService && (
        <div className="rounded-2xl bg-[#FDFAF8] border border-zinc-200 p-4 flex justify-between items-center text-sm">
          <div>
            <p className="font-semibold text-zinc-800">Duração Estimada</p>
            <p className="text-zinc-500">{selectedService.duracao_min} minutos</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-zinc-800">Valor</p>
            <p className="font-semibold text-[#D4AF37] text-base font-serif">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedService.preco)}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Calendar */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-zinc-700">Selecione o Dia</label>
        
        <div className="mx-auto max-w-sm border border-zinc-200 rounded-2xl p-3 sm:p-4 bg-white shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-zinc-800 text-sm">
              {MONTHS_PT[month]} {year}
            </h3>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-all duration-200 active:scale-95"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-all duration-200 active:scale-95"
              >
                &rsaquo;
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-zinc-400 uppercase mb-1">
            {WEEKDAYS_PT.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const isDisabled = item.isSunday || item.isPast
              const dateStr = formatDateStr(item.date)

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setSelectedDate(dateStr)
                  }}
                  className={getDayClasses(item)}
                >
                  {item.date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Available Slots */}
      {selectedDate && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-zinc-700">
            Horários Disponíveis ({new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')})
          </label>
          {loadingSlots ? (
            <p className="text-sm text-zinc-500">Buscando horários disponíveis...</p>
          ) : availableSlots.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl py-2.5 text-center text-sm font-medium border transition-all duration-200 ${
                    selectedTime === slot
                      ? 'bg-[#C4917B] border-[#C4917B] text-white shadow-sm'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-[#C4917B]/30 hover:text-[#C4917B]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              Não há horários disponíveis para o procedimento selecionado nesta data. Por favor, escolha outro dia.
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-zinc-700">Observações / Notas (opcional)</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Alguma recomendação ou detalhe que queira compartilhar conosco..."
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-800 shadow-sm focus:border-[#C4917B] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none transition-all duration-200 resize-none"
        />
      </div>

      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
          {state.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-zinc-200 bg-white py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98]"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={pending || !selectedTime}
          className="flex-[2] rounded-xl bg-[#C4917B] py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] focus:ring-2 focus:ring-[#C4917B]/15 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Processando...' : 'Confirmar Agendamento'}
        </button>
      </div>
    </form>

    {/* Modal de cadastro rápido de cliente */}
    {isAdmin && (
      <ModalNovoCliente
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClienteCreated={handleClienteCreated}
      />
    )}

    {/* Modal de pagamento pendente */}
    <ModalPagamentoPendente
      isOpen={showPaymentPopup}
      onConfirm={() => router.push('/agendamentos')}
    />
  </>
)
}
