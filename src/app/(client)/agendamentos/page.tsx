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
    .select(
      'id, data, hora, status, notas, patient_id, servicos(nome, preco), usuarios(nome, email), anamneses(id, formulario_template_id, campos_json, aceite_digital, aceito_em, formulario_templates(nome, perguntas_json))'
    )

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
        anamneses: Array<{
          id: string
          formulario_template_id: string | null
          campos_json: Record<string, unknown> | null
          aceite_digital: boolean | null
          aceito_em: string | null
          formulario_templates: { nome: string; perguntas_json: string } | null
        }> | null
      }>}
      servicos={(servicos || []) as Array<{ id: string; nome: string }>}
      isAdmin={isAdmin}
    />
  )
}
