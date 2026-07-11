import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientesList from './ClientesList'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('role')
    .eq('id', user.id)
    .single()

  if (usuario?.role !== 'admin') redirect('/dashboard')

  const { data: usuarios } = await supabase
    .from('usuarios')
    .select('id, nome, email, cpf, telefone, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <ClientesList
      usuarios={(usuarios || []) as Array<{
        id: string
        nome: string
        email: string
        cpf: string | null
        telefone: string
        role: string
        created_at: string
      }>}
    />
  )
}
