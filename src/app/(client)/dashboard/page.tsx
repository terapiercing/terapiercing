import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) return null

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nome')
    .eq('user_id', user.id)
    .single()

  const { count: agendamentosCount } = await supabase
    .from('apontamentos')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', paciente?.id ?? '')

  const { data: proximoAgendamento } = await supabase
    .from('apontamentos')
    .select('data, hora, servicos(nome)')
    .eq('patient_id', paciente?.id ?? '')
    .gte('data', new Date().toISOString().split('T')[0])
    .order('data', { ascending: true })
    .limit(1)
    .single()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-800">
          Olá, {paciente?.nome?.split(' ')[0] || 'Cliente'}!
        </h1>
        <p className="mt-1 text-zinc-500">
          Bem-vindo à sua área pessoal na RBClinic.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">
            Total de Agendamentos
          </h3>
          <p className="mt-2 text-3xl font-semibold text-[#E1A293]">
            {agendamentosCount ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">
            Próximo Agendamento
          </h3>
          {proximoAgendamento ? (
            <p className="mt-2 text-lg font-semibold text-zinc-800">
              {new Date(proximoAgendamento.data).toLocaleDateString('pt-BR')}{' '}
              às {proximoAgendamento.hora.slice(0, 5)}
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-400">Nenhum agendamento</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500">Serviços</h3>
          <p className="mt-2 text-sm text-zinc-400">
            {proximoAgendamento
              ? (
                  proximoAgendamento.servicos as { nome: string }[]
                )?.map((s) => s.nome).join(', ')
              : '—'}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/agendamentos"
          className="rounded-lg bg-[#E1A293] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d48d7c]"
        >
          Ver Agendamentos
        </Link>
        <Link
          href="/perfil"
          className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
        >
          Meu Perfil
        </Link>
      </div>
    </div>
  )
}
