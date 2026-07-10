import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const adminModules = [
  {
    href: '/agendamentos/novo',
    icon: '✨',
    title: 'Novo Agendamento',
    description: 'Escolher procedimento, data e horário',
    color: '#E1A293',
  },
  {
    href: '/agendamentos',
    icon: '📋',
    title: 'Agendamentos',
    description: 'Histórico de procedimentos agendados',
    color: '#5B9BD5',
  },
  {
    href: '/perfil',
    icon: '👤',
    title: 'Perfil',
    description: 'Dados pessoais do usuário',
    color: '#7C6FA0',
  },
  {
    href: '/admin/configuracoes',
    icon: '⚙️',
    title: 'Configurações',
    description: 'Gerenciar procedimentos, valores e horários',
    color: '#8B8B8B',
    badge: 'Administrativa',
  },
]

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) return null

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nome, role')
    .eq('id', user.id)
    .single()

  const isAdmin = usuario?.role === 'admin'

  // --- Fetch stats used by both views ---
  const { count: agendamentosCount } = await supabase
    .from('apontamentos')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', usuario?.id ?? '')

  const { data: proximoAgendamento } = await supabase
    .from('apontamentos')
    .select('data, hora, servicos(nome)')
    .eq('patient_id', usuario?.id ?? '')
    .gte('data', new Date().toISOString().split('T')[0])
    .order('data', { ascending: true })
    .limit(1)
    .single()

  // =============================================
  // ADMIN VIEW — card-based module panel
  // =============================================
  if (isAdmin) {
    return (
      <div className="space-y-10">
        {/* Greeting */}
        <div className="text-center">
          <h1 className="font-serif text-4xl tracking-tight text-[#D4AF37]">
            RBClinic
          </h1>
          <p className="mt-2 text-zinc-500">
            Painel Administrativo
          </p>
        </div>

        {/* Quick stats row */}
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

        {/* Module cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group relative flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-[#E1A293] active:scale-[0.98]"
            >
              <span className="text-4xl">{mod.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-800 group-hover:text-[#E1A293] transition-colors">
                {mod.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{mod.description}</p>
              {mod.badge && (
                <span
                  className="mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: mod.color }}
                >
                  {mod.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // =============================================
  // CLIENT VIEW — original dashboard
  // =============================================
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-800">
          Olá, {usuario?.nome?.split(' ')[0] || 'Cliente'}!
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
