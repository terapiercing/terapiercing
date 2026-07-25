'use client'

import { useEffect, useState } from 'react'
import { getHistoricoCliente, type HistoricoCliente } from '@/lib/actions/auth'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function formatJsonFields(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
      const val = value === null || value === undefined ? '—' : String(value)
      return `${label}: ${val}`
    })
    .join('\n')
}

const statusColors: Record<string, string> = {
  Pendente: 'bg-yellow-100 text-yellow-700',
  Confirmado: 'bg-blue-100 text-blue-700',
  Concluido: 'bg-green-100 text-green-700',
  Cancelado: 'bg-red-100 text-red-700',
}

const statusLabels: Record<string, string> = {
  Pendente: 'Pendente',
  Confirmado: 'Confirmado',
  Concluido: 'Concluído',
  Cancelado: 'Cancelado',
}

export default function HistoricoClienteModal({
  patientId,
  patientName,
  onClose,
}: {
  patientId: string
  patientName: string
  onClose: () => void
}) {
  const [data, setData] = useState<HistoricoCliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedForm, setExpandedForm] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchHistory() {
      setLoading(true)
      const result = await getHistoricoCliente(patientId)
      if (cancelled) return
      if (result.error) {
        setError(result.error)
      } else {
        setData(result.data)
      }
      setLoading(false)
    }
    fetchHistory()
    return () => { cancelled = true }
  }, [patientId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-semibold text-zinc-800">
              Histórico do Cliente
            </h2>
            <p className="text-sm text-zinc-500">{patientName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6">
          {/* Loading */}
          {loading && (
            <div className="py-12 text-center text-zinc-400">
              Carregando histórico...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Content */}
          {data && !loading && (
            <div className="space-y-8">
              {/* Resumo Geral */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Resumo
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-[#E1A293]">
                      {data.totalAtendimentos}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Total</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {data.atendimentosPorStatus.Concluido}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Concluídos</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {data.atendimentosPorStatus.Pendente + data.atendimentosPorStatus.Confirmado}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Agendados</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">
                      {data.atendimentosPorStatus.Cancelado}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">Cancelados</p>
                  </div>
                </div>
              </div>

              {/* Procedimentos */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Procedimentos Realizados
                </h3>
                {data.procedimentos.length > 0 ? (
                  <div className="space-y-2">
                    {data.procedimentos.map((proc) => (
                      <div
                        key={proc.nome}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-800">{proc.nome}</p>
                          <p className="text-xs text-zinc-400">
                            Último: {formatDate(proc.ultimaData)}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#E1A293]/10 px-3 py-1 text-xs font-semibold text-[#E1A293]">
                          {proc.quantidade}x
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Nenhum procedimento registrado.</p>
                )}
              </div>

              {/* Status dos Agendamentos */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Distribuição por Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(data.atendimentosPorStatus) as [string, number][]).map(
                    ([status, count]) => (
                      <span
                        key={status}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium ${statusColors[status]}`}
                      >
                        {statusLabels[status]}: {count}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Formulários Preenchidos */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-3">
                  Formulários Preenchidos ({data.formularios.length})
                </h3>
                {data.formularios.length > 0 ? (
                  <div className="space-y-3">
                    {data.formularios.map((form) => (
                      <div
                        key={form.id}
                        className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedForm(expandedForm === form.id ? null : form.id)
                          }
                          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-800">
                              {form.servicoNome ?? 'Serviço removido'}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {form.templateNome ?? 'Sem template'} — {formatDate(form.criadoEm)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {form.aceiteDigital && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                                Aceito
                              </span>
                            )}
                            <span className="text-zinc-400 text-sm">
                              {expandedForm === form.id ? '▲' : '▼'}
                            </span>
                          </div>
                        </button>

                        {expandedForm === form.id && (
                          <div className="border-t border-zinc-100 px-4 py-3 bg-zinc-50">
                            <pre className="whitespace-pre-wrap text-xs text-zinc-600 font-mono leading-relaxed">
                              {formatJsonFields(form.camposJson)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">Nenhum formulário preenchido.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
