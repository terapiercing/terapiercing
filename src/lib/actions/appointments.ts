'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper to convert "HH:MM:SS" or "HH:MM" to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

// Helper to format minutes from midnight to "HH:MM"
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export async function getAvailableSlots(serviceId: string, dateStr: string) {
  const supabase = await createClient()

  // 1. Get service duration
  const { data: service } = await supabase
    .from('servicos')
    .select('duracao_min')
    .eq('id', serviceId)
    .single()

  if (!service) return []

  const serviceDuration = service.duracao_min

  // 2. Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const [year, month, day] = dateStr.split('-').map(Number)
  const dateObj = new Date(Date.UTC(year, month - 1, day))
  const dayOfWeek = dateObj.getUTCDay()

  // 3. Get availability for this day of week
  const { data: availability } = await supabase
    .from('disponibilidades')
    .select('hora_inicio, hora_fim')
    .eq('dia_semana', dayOfWeek)
    .eq('ativo', true)
    .single()

  if (!availability) return []

  const startMin = timeToMinutes(availability.hora_inicio)
  const endMin = timeToMinutes(availability.hora_fim)

  // 4. Get blocks on this date
  const { data: blocks } = await supabase
    .from('bloqueios')
    .select('hora_inicio, hora_fim')
    .eq('data', dateStr)

  // 5. Get existing appointments on this date
  const { data: appointments } = await supabase
    .from('apontamentos')
    .select('hora, servicos(duracao_min)')
    .eq('data', dateStr)
    .neq('status', 'Cancelado')

  // Generate slots every 30 minutes
  const slots: string[] = []
  const interval = 30 // minutes

  for (let current = startMin; current + serviceDuration <= endMin; current += interval) {
    const slotStart = current
    const slotEnd = current + serviceDuration

    // Check if slot is in any block
    let isBlocked = false
    if (blocks) {
      for (const block of blocks) {
        if (!block.hora_inicio || !block.hora_fim) {
          isBlocked = true
          break
        }
        const blockStart = timeToMinutes(block.hora_inicio)
        const blockEnd = timeToMinutes(block.hora_fim)
        if (slotStart < blockEnd && blockStart < slotEnd) {
          isBlocked = true
          break
        }
      }
    }

    if (isBlocked) continue

    // Check if slot overlaps with existing appointments
    let isOverlapping = false
    if (appointments) {
      for (const appt of appointments) {
        const apptStart = timeToMinutes(appt.hora)
        const apptDuration = (appt.servicos as unknown as { duracao_min: number })?.duracao_min || 60
        const apptEnd = apptStart + apptDuration

        if (slotStart < apptEnd && apptStart < slotEnd) {
          isOverlapping = true
          break
        }
      }
    }

    if (!isOverlapping) {
      slots.push(minutesToTime(slotStart))
    }
  }

  return slots
}

export async function createAppointment(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()

  const serviceId = formData.get('serviceId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string

  if (!serviceId || !date || !time) {
    return { error: 'Por favor, selecione um serviço, data e horário.' }
  }

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!usuario) {
    return { error: 'Perfil de usuário não encontrado.' }
  }

  // --- Validação: data não pode ser no passado ---
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = date.split('-').map(Number)
  const selectedDate = new Date(Date.UTC(year, month - 1, day))

  if (selectedDate < today) {
    return { error: 'Não é possível agendar em uma data passada.' }
  }

  // --- Validação: horário não pode ser retroativo (se for hoje) ---
  const now = new Date()
  const isToday = selectedDate.getTime() === today.getTime()

  if (isToday) {
    const [h, m] = time.split(':').map(Number)
    const selectedMinutes = h * 60 + m
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    if (selectedMinutes <= currentMinutes) {
      return { error: 'Não é possível agendar em um horário que já passou.' }
    }
  }

  // --- Validação: horário dentro do expediente ---
  const dayOfWeek = selectedDate.getUTCDay()

  const { data: availability } = await supabase
    .from('disponibilidades')
    .select('hora_inicio, hora_fim')
    .eq('dia_semana', dayOfWeek)
    .eq('ativo', true)
    .single()

  if (!availability) {
    return { error: 'Não há disponibilidade de atendimento para este dia da semana.' }
  }

  const requestedMin = timeToMinutes(time)
  const service = await supabase
    .from('servicos')
    .select('duracao_min')
    .eq('id', serviceId)
    .single()

  const serviceDuration = service.data?.duracao_min ?? 60
  const startMin = timeToMinutes(availability.hora_inicio)
  const endMin = timeToMinutes(availability.hora_fim)

  if (requestedMin < startMin || requestedMin + serviceDuration > endMin) {
    return {
      error: `O horário selecionado está fora do expediente (${availability.hora_inicio.slice(0, 5)} às ${availability.hora_fim.slice(0, 5)}).`,
    }
  }

  // --- Validação: verificar bloqueios ---
  const { data: blocks } = await supabase
    .from('bloqueios')
    .select('hora_inicio, hora_fim')
    .eq('data', date)

  if (blocks) {
    for (const block of blocks) {
      if (!block.hora_inicio || !block.hora_fim) {
        return { error: 'Este dia está bloqueado e não aceita agendamentos.' }
      }
      const blockStart = timeToMinutes(block.hora_inicio)
      const blockEnd = timeToMinutes(block.hora_fim)
      if (requestedMin < blockEnd && blockStart < requestedMin + serviceDuration) {
        return { error: 'O horário selecionado conflita com um período bloqueado.' }
      }
    }
  }

  // --- Validação: verificar conflito com agendamentos existentes ---
  const { data: existingAppointments } = await supabase
    .from('apontamentos')
    .select('hora, servicos(duracao_min)')
    .eq('data', date)
    .neq('status', 'Cancelado')

  if (existingAppointments) {
    for (const appt of existingAppointments) {
      const apptStart = timeToMinutes(appt.hora)
      const apptDuration = (appt.servicos as unknown as { duracao_min: number })?.duracao_min || 60
      const apptEnd = apptStart + apptDuration

      if (requestedMin < apptEnd && apptStart < requestedMin + serviceDuration) {
        return { error: 'O horário selecionado já está ocupado. Por favor, escolha outro horário.' }
      }
    }
  }

  // --- Inserir agendamento ---
  const { error } = await supabase
    .from('apontamentos')
    .insert({
      patient_id: usuario.id,
      service_id: serviceId,
      data: date,
      hora: `${time}:00`,
      status: 'Pendente',
      notas: notes || null,
    })

  if (error) {
    return { error: `Erro ao agendar: ${error.message}` }
  }

  revalidatePath('/agendamentos')
  redirect('/agendamentos')
}
