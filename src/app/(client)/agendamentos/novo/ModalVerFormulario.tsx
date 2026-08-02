'use client'

import { useMemo } from 'react'

interface Pergunta {
  id: string
  label: string
  type: string
  required: boolean
  options?: string[]
}

interface AnamneseData {
  id: string
  formulario_template_id: string | null
  campos_json: Record<string, unknown> | null
  aceite_digital: boolean | null
  aceito_em: string | null
  formulario_templates: { nome: string; perguntas_json: string } | null
}

interface AppointmentView {
  id: string
  data: string
  hora: string
  servicos: { nome: string; duracao_min: number; preco: number } | null
  usuarios: { nome: string; email: string; telefone: string } | null
  anamneses: AnamneseData[] | null
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—'
  return String(value)
}

export default function ModalVerFormulario({
  appointment,
  onClose,
}: {
  appointment: AppointmentView
  onClose: () => void
}) {
  const anamnese = appointment.anamneses && appointment.anamneses.length > 0 ? appointment.anamneses[0] : null

  const perguntas: Pergunta[] = useMemo(() => {
    if (!anamnese?.formulario_templates?.perguntas_json) return []
    try {
      const parsed = JSON.parse(anamnese.formulario_templates.perguntas_json)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }, [anamnese])

  const campos = anamnese?.campos_json || {}
  const assinatura = typeof campos._assinatura === 'string' ? campos._assinatura : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-3 sm:p-4">
      <div className="w-full max-w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 truncate">
                Ficha de Anamnese
              </h3>
              <p className="text-xs text-zinc-500 truncate">
                {appointment.usuarios?.nome || 'Cliente'} · {appointment.servicos?.nome || 'Serviço'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 min-h-[44px] min-w-[44px] rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all duration-200 active:scale-[0.98]"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6">
          {!anamnese ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-zinc-500">
                Nenhum formulário preenchido para este agendamento.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                O cliente não preencheu a ficha de anamnese.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Dados do agendamento */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 space-y-1">
                <p className="text-sm font-medium text-zinc-800">
                  {new Date(appointment.data + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                  {' às '}
                  {appointment.hora.slice(0, 5)}
                </p>
                {appointment.usuarios && (
                  <p className="text-sm text-zinc-600">
                    {appointment.usuarios.nome}
                    {appointment.usuarios.telefone && (
                      <span className="text-zinc-400 ml-1">· {appointment.usuarios.telefone}</span>
                    )}
                  </p>
                )}
                {anamnese.formulario_templates && (
                  <p className="text-xs text-zinc-500">
                    Modelo: {anamnese.formulario_templates.nome}
                  </p>
                )}
              </div>

              {/* Perguntas e respostas */}
              {perguntas.length > 0 ? (
                <div className="space-y-4">
                  {perguntas.map((pergunta, index) => (
                    <div key={pergunta.id} className="rounded-2xl border border-zinc-100 p-4">
                      <p className="text-sm font-medium text-zinc-700">
                        <span className="text-zinc-400 mr-1">{index + 1}.</span>
                        {pergunta.label}
                      </p>
                      <p className="mt-1.5 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                        {formatValue(campos[pergunta.id])}
                      </p>
                    </div>
                  ))}

                  {/* Outras respostas que não estão no template (ex: anamnese antiga) */}
                  {Object.entries(campos)
                    .filter(([key]) => !key.startsWith('_') && !perguntas.some((p) => p.id === key))
                    .map(([key, value]) => (
                      <div key={key} className="rounded-2xl border border-zinc-100 p-4">
                        <p className="text-sm font-medium text-zinc-700">{key}</p>
                        <p className="mt-1.5 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                          {formatValue(value)}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-200 p-6">
                  <p className="text-sm text-zinc-500">Respostas registradas:</p>
                  <div className="mt-3 space-y-3">
                    {Object.entries(campos)
                      .filter(([key]) => !key.startsWith('_'))
                      .map(([key, value]) => (
                        <div key={key} className="rounded-xl border border-zinc-100 p-3">
                          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">{key}</p>
                          <p className="mt-1 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                            {formatValue(value)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Assinatura */}
              {assinatura && (
                <div className="rounded-2xl border border-zinc-100 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Assinatura Digital
                  </p>
                  <img
                    src={assinatura}
                    alt="Assinatura do cliente"
                    className="max-h-24 w-auto mx-auto"
                  />
                </div>
              )}

              {/* Aceite */}
              {anamnese.aceito_em && (
                <p className="text-xs text-zinc-400 text-center">
                  Assinado em {new Date(anamnese.aceito_em).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-zinc-100 bg-white px-4 py-3 sm:px-6 sm:py-4 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#C4917B] px-4 py-2.5 sm:px-5 sm:py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#A87060] active:scale-[0.98]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
