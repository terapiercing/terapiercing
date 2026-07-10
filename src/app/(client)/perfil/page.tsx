import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilForm from './perfil-form'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) {
    redirect('/login')
  }

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-800">Meu Perfil</h1>
        <p className="mt-1 text-zinc-500">
          Suas informações pessoais e de cadastro.
        </p>
      </div>

      <PerfilForm
        paciente={paciente}
        usuario={usuario}
        userEmail={user.email || ''}
      />
    </div>
  )
}
