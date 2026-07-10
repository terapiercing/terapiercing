import { createClient } from '@/lib/supabase/server'
import NovoAgendamentoForm from './NovoAgendamentoForm'

interface SearchParams {
  serviceId?: string
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const initialServiceId = params.serviceId || ''

  const supabase = await createClient()

  const { data: servicos } = await supabase
    .from('servicos')
    .select('id, nome, duracao_min, preco')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-800">Novo Agendamento</h1>
        <p className="mt-1 text-zinc-500">
          Escolha o procedimento, data e horário de sua preferência.
        </p>
      </div>

      <NovoAgendamentoForm
        servicos={servicos || []}
        initialServiceId={initialServiceId}
      />
    </div>
  )
}
