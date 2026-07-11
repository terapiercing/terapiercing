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
    .select('id, nome, usuario, email, cpf, nascimento, telefone, endereco, numero, bairro, cidade, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <ClientesList
      usuarios={(usuarios || []) as Array<{
        id: string
        nome: string
        usuario: string | null
        email: string
        cpf: string | null
        nascimento: string | null
        telefone: string
        endereco: string | null
        numero: string | null
        bairro: string | null
        cidade: string | null
        role: string
        created_at: string
      }>}
    />
  )
}
