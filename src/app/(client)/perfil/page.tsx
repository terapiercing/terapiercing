import { createClient } from '@/lib/supabase/server'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) return null

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-800">Meu Perfil</h1>
        <p className="mt-1 text-zinc-500">
          Suas informações pessoais e de cadastro.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-500">
              Nome
            </label>
            <p className="mt-1 text-zinc-800">
              {paciente?.nome || '—'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500">
              Email
            </label>
            <p className="mt-1 text-zinc-800">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500">
              Telefone
            </label>
            <p className="mt-1 text-zinc-800">
              {paciente?.telefone || '—'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500">
              CPF
            </label>
            <p className="mt-1 text-zinc-800">{paciente?.cpf || '—'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500">
              Data de Nascimento
            </label>
            <p className="mt-1 text-zinc-800">
              {paciente?.nascimento
                ? new Date(paciente.nascimento).toLocaleDateString('pt-BR')
                : '—'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-500">
              Endereço
            </label>
            <p className="mt-1 text-zinc-800">
              {paciente?.endereco || '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
