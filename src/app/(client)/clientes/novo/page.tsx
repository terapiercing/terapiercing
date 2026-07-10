import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClienteForm from './ClienteForm'

export default async function NovoClientePage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (usuario?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-800">
          Cadastrar Novo Cliente
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Preencha os dados do cliente para criá-lo no sistema.
        </p>
      </div>

      <ClienteForm />
    </div>
  )
}
