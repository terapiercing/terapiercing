import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AgendamentosList from './AgendamentosList'

export default async function AgendamentosPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, role, nome')
    .eq('id', user.id)
    .single()

  if (!usuario) redirect('/login')

  const isAdmin = usuario.role === 'admin'

  // Buscar lista de serviços para o filtro
  const { data: servicos } = await supabase
    .from('servicos')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')

  // Buscar agendamentos
  // Admin vê todos, cliente vê apenas os seus
  let query = supabase
    .from('apontamentos')
    .select('id, data, hora, status, notas, patient_id, servicos(nome, preco), usuarios(nome, email)')

  if (!isAdmin) {
    query = query.eq('patient_id', usuario.id)
  }

  const { data: agendamentos } = await query.order('data', { ascending: false })

  return (
    <AgendamentosList
      agendamentos={(agendamentos || []) as unknown as Array<{
        id: string
        data: string
        hora: string
        status: string
        notas: string | null
        patient_id: string
        servicos: { nome: string; preco: number } | null
        usuarios: { nome: string; email: string } | null
      }>}
      servicos={(servicos || []) as Array<{ id: string; nome: string }>}
      isAdmin={isAdmin}
    />
  )
}
