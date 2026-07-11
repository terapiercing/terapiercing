import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminAgendamentosHub from './AdminAgendamentosHub'
import NovoAgendamentoForm from './NovoAgendamentoForm'

interface SearchParams {
  serviceId?: string
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const initialServiceId = params.serviceId || ''

  const supabase = await createClient()

  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!usuario) redirect('/login')

  const isAdmin = usuario.role === 'admin'

  const { data: servicos } = await supabase
    .from('servicos')
    .select('id, nome, duracao_min, preco')
    .eq('ativo', true)
    .order('nome')

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const todayDayOfWeek = now.getDay()

  const { data: todayAvailability } = await supabase
    .from('disponibilidades')
    .select('hora_fim')
    .eq('dia_semana', todayDayOfWeek)
    .eq('ativo', true)
    .single()

  let todayClosed = false
  if (todayAvailability) {
    const [endH, endM] = todayAvailability.hora_fim.split(':').map(Number)
    const endMinutes = endH * 60 + endM
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    todayClosed = currentMinutes >= endMinutes
  } else {
    todayClosed = true
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-800">Novo Agendamento</h1>
          <p className="mt-1 text-zinc-500">
            Escolha o procedimento, data e horário de sua preferência.
          </p>
        </div>
        <NovoAgendamentoForm
          servicos={servicos || []}
          initialServiceId={initialServiceId}
          todayClosed={todayClosed}
        />
      </div>
    )
  }

  const { data: todayAppointments } = await supabase
    .from('apontamentos')
    .select('id, data, hora, status, notas, patient_id, servicos(id, nome, duracao_min, preco), usuarios(nome, email, telefone)')
    .eq('data', todayStr)
    .order('hora', { ascending: true })

  const { data: bloqueios } = await supabase
    .from('bloqueios')
    .select('id, data, hora_inicio, hora_fim, motivo')
    .eq('data', todayStr)
    .order('hora_inicio', { ascending: true })

  return (
    <AdminAgendamentosHub
      todayAppointments={(todayAppointments || []) as any}
      bloqueios={(bloqueios || []) as any}
      servicos={(servicos || []) as any}
      initialServiceId={initialServiceId}
      todayClosed={todayClosed}
      todayDate={todayStr}
    />
  )
}
