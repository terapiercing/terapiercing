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

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('*')
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
        usuario={usuario}
        userEmail={usuario?.email || user.email || ''}
      />
    </div>
  )
}
