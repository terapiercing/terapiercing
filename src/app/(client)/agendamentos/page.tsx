import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AgendamentosPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user

  if (!user) return null

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const { data: agendamentos } = await supabase
    .from('apontamentos')
    .select('id, data, hora, status, notas, servicos(nome, preco)')
    .eq('patient_id', paciente?.id ?? '')
    .order('data', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-800">
            Meus Agendamentos
          </h1>
          <p className="mt-1 text-zinc-500">
            Histórico completo de todos os seus agendamentos.
          </p>
        </div>
        <div>
          <Link
            href="/agendamentos/novo"
            className="inline-flex justify-center items-center rounded-lg bg-[#E1A293] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#d48d7c]"
          >
            Novo Agendamento
          </Link>
        </div>
      </div>

      {agendamentos && agendamentos.length > 0 ? (
        <div className="space-y-4">
          {agendamentos.map((agendamento) => {
            const servico =
              (agendamento.servicos as unknown as {
                nome: string
                preco: number
              } | null)
            const statusColor: Record<string, string> = {
              Pendente: 'bg-yellow-100 text-yellow-700',
              Confirmado: 'bg-blue-100 text-blue-700',
              Concluido: 'bg-green-100 text-green-700',
              Cancelado: 'bg-red-100 text-red-700',
            }

            return (
              <div
                key={agendamento.id}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-800">
                      {servico?.nome || 'Serviço'}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {new Date(agendamento.data).toLocaleDateString('pt-BR')}{' '}
                      às {agendamento.hora.slice(0, 5)}
                    </p>
                    {agendamento.notas && (
                      <p className="text-sm text-zinc-400">
                        {agendamento.notas}
                      </p>
                    )}
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusColor[agendamento.status] || 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {agendamento.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <p className="text-zinc-400">Nenhum agendamento encontrado.</p>
        </div>
      )}
    </div>
  )
}
