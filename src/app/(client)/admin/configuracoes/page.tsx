import { createClient } from '@/lib/supabase/server'
import { getConfiguracao } from '@/lib/config'
import ConfiguracoesForm from './ConfiguracoesForm'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const config = await getConfiguracao()

  // 1. Check authentication and role
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    redirect('/login')
  }

  const { data: userProfile } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="text-4xl text-red-500">⚠️</div>
        <h2 className="text-xl font-bold text-red-800">Acesso Restrito</h2>
        <p className="text-sm text-red-600">
          Você não possui privilégios de administrador para acessar as configurações do sistema.
        </p>
      </div>
    )
  }

  // 2. Fetch services
  const { data: servicos } = await supabase
    .from('servicos')
    .select('*')
    .order('nome')

  // 3. Fetch weekly availability
  const { data: disponibilidades } = await supabase
    .from('disponibilidades')
    .select('*')
    .order('dia_semana')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-800">Configurações da Clínica</h1>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Gerencie o catálogo de procedimentos da clínica e os horários de funcionamento.
        </p>
      </div>

      <ConfiguracoesForm
        initialServicos={servicos || []}
        initialDisponibilidades={disponibilidades || []}
        initialConfig={config}
      />
    </div>
  )
}
