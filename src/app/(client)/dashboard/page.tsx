import { createClient } from '@/lib/supabase/server'
import { getConfiguracao } from '@/lib/config'
import Link from 'next/link'

const adminModules = [
  {
    href: '/agendamentos/novo',
    icon: '✨',
    title: 'Agendamentos',
    description: 'Agenda do dia, bloquear horários, criar e gerenciar agendamentos',
    color: 'var(--primary)',
  },
  {
    href: '/agendamentos',
    icon: '📋',
    title: 'Histórico de Agendamentos',
    description: 'Histórico completo de procedimentos agendados',
    color: '#6366F1',
  },
  {
    href: '/clientes',
    icon: '👥',
    title: 'Clientes',
    description: 'Visualizar, editar e acompanhar o histórico dos clientes',
    color: '#22C55E',
    badge: 'Admin',
  },
  {
    href: '/clientes/novo',
    icon: '➕',
    title: 'Novo Cliente',
    description: 'Cadastrar um novo cliente no sistema',
    color: '#059669',
    badge: 'Admin',
  },
  {
    href: '/perfil',
    icon: '👤',
    title: 'Perfil',
    description: 'Dados pessoais do usuário',
    color: '#8B5CF6',
  },
  {
    href: '/admin/configuracoes',
    icon: '⚙️',
    title: 'Configurações',
    description: 'Gerenciar procedimentos, valores e horários',
    color: '#64748B',
    badge: 'Admin',
  },
]

export default async function Dashboard() {
  const supabase = await createClient()
  const config = await getConfiguracao()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) return null

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nome, role')
    .eq('id', user.id)
    .maybeSingle()

  const isAdmin = usuario?.role === 'admin'
  const patientId = usuario?.id ?? user.id

  const { count: agendamentosCount } = await supabase
    .from('apontamentos')
    .select('*', { count: 'exact', head: true })
    .eq('patient_id', patientId)

  const { data: proximoAgendamento } = await supabase
    .from('apontamentos')
    .select('data, hora, servicos(nome)')
    .eq('patient_id', patientId)
    .gte('data', new Date().toISOString().split('T')[0])
    .order('data', { ascending: true })
    .limit(1)
    .maybeSingle()

  const servicosRaw = proximoAgendamento?.servicos as unknown as { nome: string } | { nome: string }[] | null
  const servicoNome = Array.isArray(servicosRaw)
    ? servicosRaw.map((s) => s.nome).join(', ')
    : servicosRaw?.nome ?? '—'

  if (isAdmin) {
    return (
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Painel Administrativo
          </p>
          <h1 className="font-serif text-3xl tracking-tight text-secondary sm:text-4xl">
            {config.nomeClinica}
          </h1>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Total de Agendamentos
            </h3>
            <p className="mt-3 text-3xl font-bold text-primary">
              {agendamentosCount ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Próximo Agendamento
            </h3>
            {proximoAgendamento ? (
              <p className="mt-3 text-lg font-semibold text-zinc-800">
                {new Date(proximoAgendamento.data).toLocaleDateString('pt-BR')}{' '}
                às {proximoAgendamento.hora.slice(0, 5)}
              </p>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">Nenhum agendamento</p>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Próximo Serviço
            </h3>
            <p className="mt-3 text-sm text-zinc-600">
              {servicoNome}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((mod) => (
            <Link
              key={mod.href}
              href={mod.href}
              className="group relative flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-primary/30 active:scale-[0.98]"
            >
              <span className="text-4xl">{mod.icon}</span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-800 transition-colors duration-200 group-hover:text-primary">
                {mod.title}
              </h3>
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{mod.description}</p>
              {mod.badge && (
                <span
                  className="mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-white"
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

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Sua área pessoal
        </p>
        <h1 className="text-3xl font-semibold text-zinc-800">
          Olá, {usuario?.nome?.split(' ')[0] || 'Cliente'}!
        </h1>
        <p className="text-zinc-500">
          Bem-vindo à {config.nomeClinica}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Total de Agendamentos
          </h3>
          <p className="mt-3 text-3xl font-bold text-primary">
            {agendamentosCount ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Próximo Agendamento
          </h3>
          {proximoAgendamento ? (
            <p className="mt-3 text-lg font-semibold text-zinc-800">
              {new Date(proximoAgendamento.data).toLocaleDateString('pt-BR')}{' '}
              às {proximoAgendamento.hora.slice(0, 5)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-zinc-400">Nenhum agendamento</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Serviço
          </h3>
          <p className="mt-3 text-sm text-zinc-600">
            {servicoNome}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/agendamentos"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] text-center"
        >
          Ver Agendamentos
        </Link>
        <Link
          href="/perfil"
          className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-600 shadow-sm transition-all duration-200 hover:bg-zinc-50 active:scale-[0.98] text-center"
        >
          Meu Perfil
        </Link>
      </div>
    </div>
  )
}

